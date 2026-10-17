/**
 * TypeScript Data Models for EV IoT Prototype
 * Strictly distinguishes real hardware sensor values from simulated electrical meters.
 */

export type HardwareStatus = 'LIVE' | 'CONNECTING' | 'OFFLINE' | 'STALE' | 'ERROR';

export interface DHT11Reading {
  temperature_c: number | null;
  humidity_percent: number | null;
  valid: boolean;
}

export interface RpmReading {
  value: number | null;
  pulse_count: number;
  pulses_per_revolution: number;
  motor_rotating: boolean;
  valid: boolean;
}

export interface Mpu6050Reading {
  accel_x_ms2: number | null;
  accel_y_ms2: number | null;
  accel_z_ms2: number | null;
  gyro_x_rads: number | null;
  gyro_y_rads: number | null;
  gyro_z_rads: number | null;
  temperature_c: number | null; // Internal chip die temperature
  valid: boolean;
}

export interface ServoReading {
  commanded_angle_deg: number; // 0-60° logical test angle
  output_angle_deg: number;    // 180 - logicalAngle physical command
  test_active: boolean;
  current_stage?: string;
  remaining_duration_ms?: number;
}

/**
 * Raw JSON payload returned by ESP32 GET /api/sensors
 */
export interface Esp32SensorPayload {
  device_id: string;
  uptime_ms: number;
  timestamp_ms: number;
  dht11: DHT11Reading;
  rpm: RpmReading;
  mpu6050: Mpu6050Reading;
  servo: ServoReading;
}

/**
 * Device status payload returned by ESP32 GET /api/status
 */
export interface Esp32StatusPayload {
  device_id: string;
  online: boolean;
  uptime_ms: number;
  firmware_version: string;
  wifi: {
    ssid: string;
    ip: string;
    rssi: number;
  };
  hardware: {
    dht11_initialized: boolean;
    mpu6050_initialized: boolean;
    servo_attached: boolean;
  };
  last_data_timestamp_ms: number;
}

/**
 * Only Voltage and Current are permitted to be simulated
 */
export interface SimulatedElectricalValues {
  voltage_v: number;
  current_a: number;
  power_w: number;
  isSimulated: true;
}

/**
 * Normalized UI Telemetry snapshot for charts and KPI cards
 */
export interface UnifiedTelemetry {
  timestamp: string;          // Formatted HH:MM:SS
  timestamp_ms: number;
  dht11: DHT11Reading;
  rpm: RpmReading;
  mpu6050: Mpu6050Reading;
  servo: ServoReading;
  simulatedElectrical: SimulatedElectricalValues;
  status: HardwareStatus;
  maxRpmSession: number;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  category: 'ESP32' | 'DHT11' | 'RPM' | 'MPU6050' | 'SERVO' | 'NETWORK' | 'SYSTEM';
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}
