import { TelemetryReading, SystemLogEntry } from '../types/sensor';

export type TelemetryListener = (reading: TelemetryReading) => void;
export type LogListener = (log: SystemLogEntry) => void;
export type StatusListener = (isOnline: boolean) => void;

export interface ISensorProvider {
  /**
   * Initializes connection or simulation pipeline
   */
  connect(): Promise<void>;

  /**
   * Disconnects data feed
   */
  disconnect(): Promise<void>;

  /**
   * Set callback for telemetry packets
   */
  onTelemetry(listener: TelemetryListener): () => void;

  /**
   * Set callback for system log entries
   */
  onLog(listener: LogListener): () => void;

  /**
   * Set callback for connectivity updates
   */
  onStatusChange(listener: StatusListener): () => void;

  /**
   * Command servo target angle (if hardware or simulation allows)
   */
  commandServoAngle(angle: number): Promise<boolean>;

  /**
   * Configure RPM pulses per revolution
   */
  setPulsesPerRev(pulses: number): void;

  /**
   * Set telemetry generation interval (ms)
   */
  setInterval(ms: number): void;

  /**
   * Toggle simulated connection drop
   */
  toggleSimulatedDisconnect(): void;

  /**
   * Is currently connected
   */
  isConnected(): boolean;

  /**
   * Provider identifier
   */
  getProviderType(): 'MOCK' | 'ESP32_WEBSOCKET' | 'ESP32_MQTT' | 'SUPABASE_REALTIME';
}
