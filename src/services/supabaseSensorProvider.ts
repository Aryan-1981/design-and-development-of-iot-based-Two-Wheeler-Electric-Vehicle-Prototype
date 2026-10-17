import { SupabaseClient } from '@supabase/supabase-js';
import { UnifiedTelemetry, HardwareStatus, SystemLogEntry } from '../types/sensors';
import { electricalSimulator } from './electricalSimulator';
import { supabase, initSupabase } from './supabaseClient';

export type SupabaseTelemetryCallback = (telemetry: UnifiedTelemetry) => void;
export type SupabaseHistoryCallback = (history: UnifiedTelemetry[]) => void;
export type SupabaseStatusCallback = (status: HardwareStatus, details?: string) => void;
export type SupabaseLogCallback = (log: SystemLogEntry) => void;

export class SupabaseSensorProvider {
  private client: SupabaseClient | null = null;
  private channel: any = null;
  private isSubscribed: boolean = false;
  private currentStatus: HardwareStatus = 'CONNECTING';

  private telemetryCallbacks: Set<SupabaseTelemetryCallback> = new Set();
  private historyCallbacks: Set<SupabaseHistoryCallback> = new Set();
  private statusCallbacks: Set<SupabaseStatusCallback> = new Set();
  private logCallbacks: Set<SupabaseLogCallback> = new Set();

  private maxRpmSession: number = 0;
  private lastUpdateMs: number = 0;
  private pollingTimer: any = null;
  private pollingIntervalMs: number = 3000; // Poll every 3 seconds as a resilient backup

  constructor() {
    this.client = supabase;
  }

  public configure(url: string, anonKey: string) {
    if (!url || !anonKey) return;
    this.client = initSupabase(url, anonKey);
    this.emitLog('SYSTEM', 'INFO', `Configured Supabase client: ${url}`);
    this.stop();
    this.start();
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  public async start() {
    if (!this.client) {
      this.setStatus('OFFLINE', 'Supabase credentials not configured. Open Config to enter URL & anon key.');
      return;
    }

    if (this.isSubscribed) return;
    this.isSubscribed = true;

    this.setStatus('CONNECTING', 'Connecting to Supabase (fetching recent telemetry)...');
    this.emitLog('NETWORK', 'INFO', 'Querying public.vehicle_telemetry in Supabase');

    // 1. Initial historical batch fetch (up to 50 latest rows to immediately populate charts)
    await this.fetchRecentTelemetry(50);

    // 2. Set up realtime websocket subscription
    this.setupRealtimeSubscription();

    // 3. Set up polling fallback: ensures updates flow even if Supabase Realtime publication or WebSocket is blocked
    this.startPollingFallback();
  }

  private async fetchRecentTelemetry(limit: number = 50) {
    if (!this.client) return;
    try {
      const { data, error } = await this.client
        .from('vehicle_telemetry')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Chronological order (oldest first, newest last) for charting
        const sortedRows = [...data].reverse();
        const telemetryHistory: UnifiedTelemetry[] = sortedRows.map((row) => this.mapDbRowToTelemetry(row));

        // Notify history callbacks to backfill charts immediately
        this.historyCallbacks.forEach((cb) => cb(telemetryHistory));

        // Notify latest telemetry
        const latestRow = data[0];
        const latestTelemetry = this.mapDbRowToTelemetry(latestRow);
        this.lastUpdateMs = Date.now();
        this.setStatus('LIVE', `Connected to Supabase. Loaded ${data.length} telemetry records.`);
        this.emitLog('NETWORK', 'SUCCESS', `Retrieved ${data.length} records from Supabase (Device: ${latestRow.device_id || 'ev-esp32-01'})`);
        this.telemetryCallbacks.forEach((cb) => cb(latestTelemetry));
      } else {
        this.setStatus('CONNECTING', 'Connected to Supabase, but vehicle_telemetry table is currently empty.');
        this.emitLog('NETWORK', 'WARN', 'Supabase query succeeded but returned 0 rows. Verify RLS SELECT policy.');
      }
    } catch (err: any) {
      console.error('Supabase fetch error:', err);
      const msg = err.message || JSON.stringify(err);
      this.setStatus('ERROR', `Supabase query failed: ${msg}`);
      this.emitLog('NETWORK', 'ERROR', `Supabase query error: ${msg}. If RLS is enabled, grant SELECT on vehicle_telemetry to anon.`);
    }
  }

  private setupRealtimeSubscription() {
    if (!this.client) return;

    try {
      this.channel = this.client
        .channel('realtime_vehicle_telemetry')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'vehicle_telemetry' },
          (payload: any) => {
            if (payload && payload.new) {
              this.handleDbRow(payload.new);
            }
          }
        )
        .subscribe((status: string, err?: any) => {
          if (status === 'SUBSCRIBED') {
            this.setStatus('LIVE', 'Subscribed to Supabase Realtime stream');
            this.emitLog('NETWORK', 'SUCCESS', 'Realtime WebSocket connected to vehicle_telemetry');
          } else if (status === 'CHANNEL_ERROR') {
            this.emitLog('NETWORK', 'WARN', `Realtime channel error (${err?.message || 'WebSocket closed'}). Falling back to polling.`);
          } else if (status === 'TIMED_OUT') {
            this.emitLog('NETWORK', 'WARN', 'Realtime subscription timed out. Using polling fallback.');
          }
        });
    } catch (err: any) {
      this.emitLog('NETWORK', 'WARN', `Could not initialize Realtime channel: ${err.message}. Polling will handle updates.`);
    }
  }

  private startPollingFallback() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = setInterval(async () => {
      if (!this.client || !this.isSubscribed) return;
      try {
        const { data, error } = await this.client
          .from('vehicle_telemetry')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const row = data[0];
          const rowTime = new Date(row.created_at || Date.now()).getTime();
          // If this row is newer than our last processed row, emit it
          if (rowTime > this.lastUpdateMs) {
            this.handleDbRow(row);
          }
        }
      } catch (e) {
        // silent polling catch
      }
    }, this.pollingIntervalMs);
  }

  public stop() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    if (this.channel && this.client) {
      try {
        this.client.removeChannel(this.channel);
      } catch (e) {
        // ignore
      }
      this.channel = null;
    }
    this.isSubscribed = false;
    this.setStatus('OFFLINE', 'Supabase subscription paused');
  }

  public onTelemetry(cb: SupabaseTelemetryCallback): () => void {
    this.telemetryCallbacks.add(cb);
    return () => this.telemetryCallbacks.delete(cb);
  }

  public onHistory(cb: SupabaseHistoryCallback): () => void {
    this.historyCallbacks.add(cb);
    return () => this.historyCallbacks.delete(cb);
  }

  public onStatus(cb: SupabaseStatusCallback): () => void {
    this.statusCallbacks.add(cb);
    cb(this.currentStatus);
    return () => this.statusCallbacks.delete(cb);
  }

  public onLog(cb: SupabaseLogCallback): () => void {
    this.logCallbacks.add(cb);
    return () => this.logCallbacks.delete(cb);
  }

  private setStatus(status: HardwareStatus, details?: string) {
    this.currentStatus = status;
    this.statusCallbacks.forEach((cb) => cb(status, details));
  }

  private emitLog(
    category: SystemLogEntry['category'],
    level: SystemLogEntry['level'],
    message: string
  ) {
    const entry: SystemLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      category,
      level,
      message,
    };
    this.logCallbacks.forEach((cb) => cb(entry));
  }

  private mapDbRowToTelemetry(row: any): UnifiedTelemetry {
    const rpmVal = typeof row.rpm === 'number' ? row.rpm : (row.rpm ? Number(row.rpm) : null);
    if (rpmVal !== null && rpmVal > this.maxRpmSession) {
      this.maxRpmSession = rpmVal;
    }

    const isRotating = rpmVal !== null && rpmVal > 20;
    const electrical = electricalSimulator.tick(isRotating, rpmVal);

    // Validate DHT11: either dht_valid is true OR values are valid non-null numbers
    const tempC = row.temperature_c !== null && row.temperature_c !== undefined ? Number(row.temperature_c) : null;
    const humPct = row.humidity_percent !== null && row.humidity_percent !== undefined ? Number(row.humidity_percent) : null;
    const dhtValid = Boolean(row.dht_valid) || (tempC !== null && !isNaN(tempC));

    // Validate MPU6050: either mpu_valid is true OR accelerometer / gyro / mpu_temp is non-null
    const accelX = row.accel_x_ms2 !== null && row.accel_x_ms2 !== undefined ? Number(row.accel_x_ms2) : null;
    const accelY = row.accel_y_ms2 !== null && row.accel_y_ms2 !== undefined ? Number(row.accel_y_ms2) : null;
    const accelZ = row.accel_z_ms2 !== null && row.accel_z_ms2 !== undefined ? Number(row.accel_z_ms2) : null;
    const gyroX = row.gyro_x_rads !== null && row.gyro_x_rads !== undefined ? Number(row.gyro_x_rads) : null;
    const gyroY = row.gyro_y_rads !== null && row.gyro_y_rads !== undefined ? Number(row.gyro_y_rads) : null;
    const gyroZ = row.gyro_z_rads !== null && row.gyro_z_rads !== undefined ? Number(row.gyro_z_rads) : null;
    const mpuTempC = row.mpu_temperature_c !== null && row.mpu_temperature_c !== undefined ? Number(row.mpu_temperature_c) : null;
    const mpuValid = Boolean(row.mpu_valid) || (accelX !== null && !isNaN(accelX)) || (mpuTempC !== null && !isNaN(mpuTempC));

    const commandedAngle = row.servo_commanded_angle !== null && row.servo_commanded_angle !== undefined
      ? Number(row.servo_commanded_angle)
      : 0;
    const outputAngle = row.servo_output_angle !== null && row.servo_output_angle !== undefined
      ? Number(row.servo_output_angle)
      : (180 - commandedAngle);

    return {
      timestamp: new Date(row.created_at || Date.now()).toLocaleTimeString(),
      timestamp_ms: new Date(row.created_at || Date.now()).getTime(),
      dht11: {
        temperature_c: tempC,
        humidity_percent: humPct,
        valid: dhtValid,
      },
      rpm: {
        value: rpmVal,
        pulse_count: Number(row.pulse_count ?? 0),
        pulses_per_revolution: Number(row.pulses_per_revolution ?? 1),
        motor_rotating: isRotating,
        valid: rpmVal !== null,
      },
      mpu6050: {
        accel_x_ms2: accelX,
        accel_y_ms2: accelY,
        accel_z_ms2: accelZ,
        gyro_x_rads: gyroX,
        gyro_y_rads: gyroY,
        gyro_z_rads: gyroZ,
        temperature_c: mpuTempC,
        valid: mpuValid,
      },
      servo: {
        commanded_angle_deg: commandedAngle,
        output_angle_deg: outputAngle,
        test_active: Boolean(row.servo_test_active),
      },
      simulatedElectrical: electrical,
      status: 'LIVE',
      maxRpmSession: this.maxRpmSession,
    };
  }

  private handleDbRow(row: any) {
    const rowTime = new Date(row.created_at || Date.now()).getTime();
    if (rowTime > this.lastUpdateMs) {
      this.lastUpdateMs = rowTime;
    }
    this.setStatus('LIVE', `Live packet received from ${row.device_id || 'ESP32'}`);
    const telemetry = this.mapDbRowToTelemetry(row);
    this.telemetryCallbacks.forEach((cb) => cb(telemetry));
  }
}

export const supabaseProvider = new SupabaseSensorProvider();

