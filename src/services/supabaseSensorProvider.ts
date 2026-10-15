import { SupabaseClient } from '@supabase/supabase-js';
import { UnifiedTelemetry, HardwareStatus, SystemLogEntry } from '../types/sensors';
import { electricalSimulator } from './electricalSimulator';
import { supabase, initSupabase } from './supabaseClient';

export type SupabaseTelemetryCallback = (telemetry: UnifiedTelemetry) => void;
export type SupabaseStatusCallback = (status: HardwareStatus, details?: string) => void;
export type SupabaseLogCallback = (log: SystemLogEntry) => void;

export class SupabaseSensorProvider {
  private client: SupabaseClient | null = null;
  private channel: any = null;
  private isSubscribed: boolean = false;
  private currentStatus: HardwareStatus = 'CONNECTING';

  private telemetryCallbacks: Set<SupabaseTelemetryCallback> = new Set();
  private statusCallbacks: Set<SupabaseStatusCallback> = new Set();
  private logCallbacks: Set<SupabaseLogCallback> = new Set();

  private maxRpmSession: number = 0;
  private lastUpdateMs: number = 0;

  constructor() {
    this.client = supabase;
  }

  public configure(url: string, anonKey: string) {
    if (!url || !anonKey) return;
    this.client = initSupabase(url, anonKey);
    this.emitLog('SYSTEM', 'INFO', `Configured Supabase client: ${url}`);
    this.start();
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  public async start() {
    if (!this.client) {
      this.setStatus('OFFLINE', 'Supabase credentials not configured in settings or .env');
      return;
    }

    if (this.isSubscribed) return;
    this.isSubscribed = true;

    this.setStatus('CONNECTING', 'Connecting to Supabase Realtime channel...');
    this.emitLog('NETWORK', 'INFO', 'Subscribing to realtime updates on table: vehicle_telemetry');

    // 1. Fetch latest historical row to immediately populate dashboard
    try {
      const { data, error } = await this.client
        .from('vehicle_telemetry')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        this.handleDbRow(data[0]);
      }
    } catch (err: any) {
      this.emitLog('NETWORK', 'WARN', `Initial query notice: ${err.message}`);
    }

    // 2. Subscribe to live INSERT events pushed from ESP32
    try {
      this.channel = this.client
        .channel('realtime_vehicle_telemetry')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'vehicle_telemetry' },
          (payload: any) => {
            this.handleDbRow(payload.new);
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            this.setStatus('LIVE', 'Subscribed to Supabase Realtime Telemetry Stream');
            this.emitLog('NETWORK', 'SUCCESS', 'Realtime WebSocket connection established with Supabase');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.setStatus('OFFLINE', `Supabase Realtime disconnected (${status})`);
          }
        });
    } catch (err: any) {
      this.setStatus('ERROR', `Failed to subscribe: ${err.message}`);
    }
  }

  public stop() {
    if (this.channel && this.client) {
      this.client.removeChannel(this.channel);
      this.channel = null;
    }
    this.isSubscribed = false;
    this.setStatus('OFFLINE', 'Supabase subscription paused');
  }

  public onTelemetry(cb: SupabaseTelemetryCallback): () => void {
    this.telemetryCallbacks.add(cb);
    return () => this.telemetryCallbacks.delete(cb);
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

  private handleDbRow(row: any) {
    this.lastUpdateMs = Date.now();
    this.setStatus('LIVE', `Live packet received from ${row.device_id || 'ESP32'}`);

    const rpmVal = typeof row.rpm === 'number' ? row.rpm : null;
    if (rpmVal !== null && rpmVal > this.maxRpmSession) {
      this.maxRpmSession = rpmVal;
    }

    const isRotating = (rpmVal !== null && rpmVal > 20);
    const electrical = electricalSimulator.tick(isRotating, rpmVal);

    const telemetry: UnifiedTelemetry = {
      timestamp: new Date(row.created_at || Date.now()).toLocaleTimeString(),
      timestamp_ms: new Date(row.created_at || Date.now()).getTime(),
      dht11: {
        temperature_c: row.temperature_c ?? null,
        humidity_percent: row.humidity_percent ?? null,
        valid: Boolean(row.dht_valid),
      },
      rpm: {
        value: rpmVal,
        pulse_count: row.pulse_count ?? 0,
        pulses_per_revolution: row.pulses_per_revolution ?? 1,
        motor_rotating: isRotating,
        valid: rpmVal !== null,
      },
      mpu6050: {
        accel_x_ms2: row.accel_x_ms2 ?? null,
        accel_y_ms2: row.accel_y_ms2 ?? null,
        accel_z_ms2: row.accel_z_ms2 ?? null,
        gyro_x_rads: row.gyro_x_rads ?? null,
        gyro_y_rads: row.gyro_y_rads ?? null,
        gyro_z_rads: row.gyro_z_rads ?? null,
        temperature_c: row.mpu_temperature_c ?? null,
        valid: Boolean(row.mpu_valid),
      },
      servo: {
        commanded_angle_deg: row.servo_commanded_angle ?? 0,
        output_angle_deg: row.servo_output_angle ?? (180 - (row.servo_commanded_angle ?? 0)),
        test_active: Boolean(row.servo_test_active),
      },
      simulatedElectrical: electrical,
      status: 'LIVE',
      maxRpmSession: this.maxRpmSession,
    };

    this.telemetryCallbacks.forEach((cb) => cb(telemetry));
  }
}

export const supabaseProvider = new SupabaseSensorProvider();
