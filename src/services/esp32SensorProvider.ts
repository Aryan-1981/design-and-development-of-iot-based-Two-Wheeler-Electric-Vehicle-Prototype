import {
  Esp32SensorPayload,
  Esp32StatusPayload,
  UnifiedTelemetry,
  HardwareStatus,
  SystemLogEntry,
} from '../types/sensors';
import { electricalSimulator } from './electricalSimulator';

export type TelemetryCallback = (telemetry: UnifiedTelemetry) => void;
export type StatusCallback = (status: HardwareStatus, details?: string) => void;
export type LogCallback = (log: SystemLogEntry) => void;

export class Esp32SensorProvider {
  private baseUrl: string;
  private pollingIntervalMs: number = 1000;
  private timer: any = null;
  private isRunning: boolean = false;
  private currentStatus: HardwareStatus = 'CONNECTING';

  private telemetryCallbacks: Set<TelemetryCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private logCallbacks: Set<LogCallback> = new Set();

  private lastSuccessfulReadMs: number = 0;
  private staleThresholdMs: number = 5000; // >5s without fresh packet is classified as STALE
  private maxRpmSession: number = 0;
  private demoModeEnabled: boolean = false; // Strictly false by default

  // Simulated internal values if explicitly activated in demo mode
  private demoTick: number = 0;

  constructor(defaultUrl?: string) {
    this.baseUrl =
      defaultUrl ||
      import.meta.env.VITE_ESP32_BASE_URL ||
      'http://192.168.1.100'; // Default fallback address
  }

  public setBaseUrl(url: string) {
    let clean = url.trim();
    if (clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    this.baseUrl = clean;
    this.emitLog('NETWORK', 'INFO', `ESP32 target address updated to: ${this.baseUrl}`);
    if (this.isRunning) {
      this.pollOnce();
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setPollingInterval(ms: number) {
    this.pollingIntervalMs = Math.max(250, ms);
    if (this.isRunning && this.timer) {
      clearInterval(this.timer);
      this.timer = setInterval(() => this.pollOnce(), this.pollingIntervalMs);
    }
  }

  public setDemoMode(enabled: boolean) {
    this.demoModeEnabled = enabled;
    this.emitLog(
      'SYSTEM',
      enabled ? 'WARN' : 'INFO',
      enabled
        ? 'EXPLICIT DEMO MODE ACTIVATED. Simulated test telemetry active.'
        : 'Demo mode deactivated. Polling real hardware on ESP32 Wi-Fi.'
    );
    this.pollOnce();
  }

  public isDemoMode(): boolean {
    return this.demoModeEnabled;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.setStatus('CONNECTING', 'Initiating communication with ESP32 Wi-Fi HTTP API...');
    this.emitLog('NETWORK', 'INFO', `Starting HTTP polling against ${this.baseUrl}/api/sensors`);

    this.pollOnce();
    this.timer = setInterval(() => this.pollOnce(), this.pollingIntervalMs);
  }

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setStatus('OFFLINE', 'Polling stopped by user');
  }

  public onTelemetry(cb: TelemetryCallback): () => void {
    this.telemetryCallbacks.add(cb);
    return () => this.telemetryCallbacks.delete(cb);
  }

  public onStatus(cb: StatusCallback): () => void {
    this.statusCallbacks.add(cb);
    cb(this.currentStatus);
    return () => this.statusCallbacks.delete(cb);
  }

  public onLog(cb: LogCallback): () => void {
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

  /**
   * Main fetch cycle: queries real ESP32 /api/sensors endpoint
   */
  private async pollOnce() {
    if (this.demoModeEnabled) {
      this.generateDemoTelemetry();
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.baseUrl}/api/sensors`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload: Esp32SensorPayload = await response.json();
      this.handleRealSensorPayload(payload);
    } catch (err: any) {
      // Check for stale data if last success was within tolerance
      const now = Date.now();
      if (this.lastSuccessfulReadMs > 0 && now - this.lastSuccessfulReadMs < this.staleThresholdMs) {
        this.setStatus('STALE', `Packet missed. Waiting for next window (${err.message})`);
      } else {
        if (this.currentStatus !== 'OFFLINE') {
          this.setStatus(
            'OFFLINE',
            `Cannot connect to ESP32 at ${this.baseUrl}. Verify IP & Wi-Fi connection.`
          );
          this.emitLog('NETWORK', 'ERROR', `Connection failed: ${err.message || 'Offline'}`);
        }
      }
    }
  }

  private handleRealSensorPayload(payload: Esp32SensorPayload) {
    this.lastSuccessfulReadMs = Date.now();
    if (this.currentStatus !== 'LIVE') {
      this.setStatus('LIVE', `Connected to ${payload.device_id || 'ESP32'} via Wi-Fi`);
      this.emitLog('NETWORK', 'SUCCESS', `ESP32 connection established. Device: ${payload.device_id}`);
    }

    // Track max RPM
    if (payload.rpm && typeof payload.rpm.value === 'number') {
      if (payload.rpm.value > this.maxRpmSession) {
        this.maxRpmSession = payload.rpm.value;
      }
    }

    // Calculate isolated simulated electrical values
    const isRotating = payload.rpm?.motor_rotating || (payload.rpm?.value || 0) > 0;
    const electrical = electricalSimulator.tick(isRotating, payload.rpm?.value ?? null);

    const telemetry: UnifiedTelemetry = {
      timestamp: new Date().toLocaleTimeString(),
      timestamp_ms: Date.now(),
      dht11: payload.dht11 || { temperature_c: null, humidity_percent: null, valid: false },
      rpm: payload.rpm || {
        value: null,
        pulse_count: 0,
        pulses_per_revolution: 1,
        motor_rotating: false,
        valid: false,
      },
      mpu6050: payload.mpu6050 || {
        accel_x_ms2: null,
        accel_y_ms2: null,
        accel_z_ms2: null,
        gyro_x_rads: null,
        gyro_y_rads: null,
        gyro_z_rads: null,
        temperature_c: null,
        valid: false,
      },
      servo: payload.servo || {
        commanded_angle_deg: 0,
        output_angle_deg: 180,
        test_active: false,
      },
      simulatedElectrical: electrical,
      status: 'LIVE',
      maxRpmSession: this.maxRpmSession,
    };

    this.telemetryCallbacks.forEach((cb) => cb(telemetry));
  }

  /**
   * Explicit Demo Mode telemetry generator (only when user checks "Enable Demo Mode")
   */
  private generateDemoTelemetry() {
    this.demoTick++;
    this.setStatus('LIVE', 'Explicit Demo Mode (Simulated for presentation)');

    const throttleCycle = Math.sin(this.demoTick * 0.15);
    const simulatedRpm = Math.max(0, Math.round(1400 + throttleCycle * 650 + (Math.random() - 0.5) * 40));
    if (simulatedRpm > this.maxRpmSession) this.maxRpmSession = simulatedRpm;

    const electrical = electricalSimulator.tick(simulatedRpm > 0, simulatedRpm);

    const telemetry: UnifiedTelemetry = {
      timestamp: new Date().toLocaleTimeString(),
      timestamp_ms: Date.now(),
      dht11: {
        temperature_c: parseFloat((31.5 + (Math.random() - 0.5) * 0.2).toFixed(1)),
        humidity_percent: parseFloat((58.0 + (Math.random() - 0.5) * 0.4).toFixed(1)),
        valid: true,
      },
      rpm: {
        value: simulatedRpm,
        pulse_count: this.demoTick * 25,
        pulses_per_revolution: 1,
        motor_rotating: simulatedRpm > 0,
        valid: true,
      },
      mpu6050: {
        accel_x_ms2: parseFloat(((Math.random() - 0.5) * 1.5).toFixed(3)),
        accel_y_ms2: parseFloat(((Math.random() - 0.5) * 1.2).toFixed(3)),
        accel_z_ms2: parseFloat((9.81 + (Math.random() - 0.5) * 1.8).toFixed(3)),
        gyro_x_rads: parseFloat(((Math.random() - 0.5) * 0.08).toFixed(4)),
        gyro_y_rads: parseFloat(((Math.random() - 0.5) * 0.06).toFixed(4)),
        gyro_z_rads: parseFloat(((Math.random() - 0.5) * 0.05 + throttleCycle * 0.03).toFixed(4)),
        temperature_c: parseFloat((35.2 + (Math.random() - 0.5) * 0.1).toFixed(1)),
        valid: true,
      },
      servo: {
        commanded_angle_deg: [20, 22, 28, 20, 15, 30, 28, 26, 15, 30, 0][
          Math.floor((this.demoTick / 10) % 11)
        ],
        output_angle_deg:
          180 -
          [20, 22, 28, 20, 15, 30, 28, 26, 15, 30, 0][
            Math.floor((this.demoTick / 10) % 11)
          ],
        test_active: true,
        current_stage: 'SIMULATED DEMO SEQUENCE',
        remaining_duration_ms: Math.max(0, 600000 - this.demoTick * 1000),
      },
      simulatedElectrical: electrical,
      status: 'LIVE',
      maxRpmSession: this.maxRpmSession,
    };

    this.telemetryCallbacks.forEach((cb) => cb(telemetry));
  }
}

export const esp32Provider = new Esp32SensorProvider();
