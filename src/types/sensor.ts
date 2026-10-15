export type SensorStatus = 'normal' | 'warning' | 'error' | 'offline';

export interface DHT11Data {
  temperature: number; // in °C
  humidity: number; // in %
  status: SensorStatus;
  lastUpdated: string;
}

export interface RPMData {
  currentRpm: number;
  averageRpm: number;
  maxRpm: number;
  pulseCount: number;
  pulsesPerRevolution: number;
  isRotating: boolean;
  status: SensorStatus;
  lastUpdated: string;
}

export interface ServoData {
  commandedAngle: number; // 0-180°
  measuredPosition?: number; // Available only if analog/potentiometer feedback present
  hasHardwareFeedback: boolean;
  minAngle: number;
  maxAngle: number;
  torqueRatingKgCm: number; // e.g. 40 kg-cm rating, NOT a weight load measurement
  status: SensorStatus;
  lastUpdated: string;
}

export interface MPU6050Data {
  accel: {
    x: number; // in m/s² or g
    y: number;
    z: number;
  };
  gyro: {
    x: number; // in °/s
    y: number;
    z: number;
  };
  accelMagnitude: number; // sqrt(x^2 + y^2 + z^2)
  vibrationIntensity: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  motionState: 'STATIONARY' | 'CRUISING' | 'ACCELERATING' | 'DECELERATING' | 'BUMPY_ROAD';
  unit: 'm/s²' | 'g';
  status: SensorStatus;
  lastUpdated: string;
}

export interface TelemetryReading {
  timestamp: string;
  unixTime: number;
  dht11: DHT11Data;
  rpm: RPMData;
  servo: ServoData;
  mpu6050: MPU6050Data;
  batteryVoltage?: number; // Estimated 48V pack or 12V aux
  systemHealth: 'OPTIMAL' | 'DEGRADED' | 'CHECK_ENGINE' | 'OFFLINE';
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  category: 'SYSTEM' | 'DHT11' | 'RPM' | 'SERVO' | 'MPU6050' | 'CONNECTIVITY';
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}

export interface ConfigurableThresholds {
  tempWarning: number;
  tempCritical: number;
  humidityWarningHigh: number;
  rpmWarning: number;
  vibrationWarning: number;
}
