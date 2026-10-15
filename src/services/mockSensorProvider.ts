import { TelemetryReading, SystemLogEntry, SensorStatus, MPU6050Data } from '../types/sensor';
import { ISensorProvider, TelemetryListener, LogListener, StatusListener } from './sensorProvider';

export class MockSensorProvider implements ISensorProvider {
  private timer: any = null;
  private intervalMs: number = 1000;
  private isOnline: boolean = true;
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private logListeners: Set<LogListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();

  // Simulated internal state
  private pulseCount: number = 0;
  private pulsesPerRevolution: number = 2; // Default 2 pulses per revolution for standard optical/magnetic wheel target
  private commandedServoAngle: number = 45;
  private currentTemp: number = 31.4;
  private currentHumidity: number = 58.2;
  private baseRpm: number = 1450;
  private maxObservedRpm: number = 1850;
  private rpmHistoryWindow: number[] = [];
  private simTime: number = 0;

  constructor() {
    this.emitLog('SYSTEM', 'INFO', 'Mock Sensor Provider initialized for Two-Wheeler EV Prototype');
  }

  getProviderType(): 'MOCK' | 'ESP32_WEBSOCKET' | 'ESP32_MQTT' | 'SUPABASE_REALTIME' {
    return 'MOCK';
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  async connect(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.isOnline = true;
    this.notifyStatus(true);
    this.emitLog('CONNECTIVITY', 'SUCCESS', 'Connected to Telemetry Data Stream (DEMO MODE active)');

    this.timer = setInterval(() => {
      if (!this.isOnline) return;
      this.tick();
    }, this.intervalMs);
  }

  async disconnect(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isOnline = false;
    this.notifyStatus(false);
    this.emitLog('CONNECTIVITY', 'WARN', 'Telemetry Data Stream disconnected');
  }

  toggleSimulatedDisconnect(): void {
    this.isOnline = !this.isOnline;
    this.notifyStatus(this.isOnline);
    this.emitLog(
      'CONNECTIVITY',
      this.isOnline ? 'SUCCESS' : 'ERROR',
      this.isOnline ? 'ESP32 heartbeat restored (DEMO)' : 'ESP32 simulated connection timeout / packet loss'
    );
  }

  setInterval(ms: number): void {
    this.intervalMs = Math.max(200, ms);
    if (this.timer && this.isOnline) {
      clearInterval(this.timer);
      this.timer = setInterval(() => this.tick(), this.intervalMs);
      this.emitLog('SYSTEM', 'INFO', `Telemetry sampling rate adjusted to ${this.intervalMs}ms`);
    }
  }

  setPulsesPerRev(pulses: number): void {
    this.pulsesPerRevolution = Math.max(1, pulses);
    this.emitLog('RPM', 'INFO', `NPN Sensor configured: ${this.pulsesPerRevolution} pulses/rev`);
  }

  async commandServoAngle(angle: number): Promise<boolean> {
    const clamped = Math.max(0, Math.min(180, Math.round(angle)));
    this.commandedServoAngle = clamped;
    this.emitLog('SERVO', 'INFO', `PWM Command transmitted: Target Angle set to ${clamped}° (40 kg-cm actuator)`);
    return true;
  }

  onTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    return () => this.telemetryListeners.delete(listener);
  }

  onLog(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus(online: boolean) {
    this.statusListeners.forEach((l) => l(online));
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
    this.logListeners.forEach((l) => l(entry));
  }

  private tick() {
    this.simTime += 1;
    const now = new Date();
    const timestampStr = now.toLocaleTimeString();

    // 1. Realistic Temperature & Humidity simulation (DHT11)
    // Ambient drift with subtle thermal heating from motor load
    const tempNoise = (Math.random() - 0.48) * 0.2;
    this.currentTemp = parseFloat(Math.min(48, Math.max(24, this.currentTemp + tempNoise)).toFixed(1));
    const humNoise = (Math.random() - 0.5) * 0.4;
    this.currentHumidity = parseFloat(Math.min(85, Math.max(35, this.currentHumidity + humNoise)).toFixed(1));

    let dhtStatus: SensorStatus = 'normal';
    if (this.currentTemp > 42) dhtStatus = 'warning';
    if (this.currentTemp > 48) dhtStatus = 'error';

    // 2. Realistic RPM Simulation (NPN Hall / Optical sensor)
    // Vehicle throttle cycle: accelerating, cruising, coasting
    const throttleCycle = Math.sin(this.simTime * 0.15);
    const targetRpm = Math.max(0, this.baseRpm + throttleCycle * 600 + (Math.random() - 0.5) * 60);
    const currentRpm = Math.round(targetRpm);
    
    // Increment pulses based on RPM and pulsesPerRevolution
    const deltaSeconds = this.intervalMs / 1000;
    const revsThisTick = (currentRpm / 60) * deltaSeconds;
    this.pulseCount += Math.round(revsThisTick * this.pulsesPerRevolution);

    this.rpmHistoryWindow.push(currentRpm);
    if (this.rpmHistoryWindow.length > 30) this.rpmHistoryWindow.shift();
    const avgRpm = Math.round(
      this.rpmHistoryWindow.reduce((a, b) => a + b, 0) / this.rpmHistoryWindow.length
    );
    if (currentRpm > this.maxObservedRpm) {
      this.maxObservedRpm = currentRpm;
    }

    let rpmStatus: SensorStatus = 'normal';
    if (currentRpm > 2100) rpmStatus = 'warning';

    // 3. Servo Actuator (40 kg-cm load rating, 0-180 deg)
    // Note: 40 kg-cm is mechanical holding torque, NOT a weight load measurement
    // Position tracking: simulates slight dynamic lag towards commanded angle
    let servoStatus: SensorStatus = 'normal';

    // 4. MPU6050 6-DOF IMU (Accelerometer & Gyroscope)
    // Gravity vector on Z (~9.8 m/s²) + road vibrations proportional to RPM
    const vibrationAmp = (currentRpm / 2000) * 1.8 + 0.3;
    const ax = parseFloat(((Math.random() - 0.5) * vibrationAmp).toFixed(2));
    const ay = parseFloat(((Math.random() - 0.5) * vibrationAmp * 0.8).toFixed(2));
    const az = parseFloat((9.8 + (Math.random() - 0.5) * vibrationAmp * 1.2).toFixed(2));

    // Gyro (°/s)
    const gx = parseFloat(((Math.random() - 0.5) * 4.5).toFixed(2));
    const gy = parseFloat(((Math.random() - 0.5) * 4.0).toFixed(2));
    const gz = parseFloat(((Math.random() - 0.5) * 3.0 + throttleCycle * 2.0).toFixed(2));

    const accelMag = parseFloat(Math.sqrt(ax * ax + ay * ay + az * az).toFixed(2));

    let vibrationIntensity: MPU6050Data['vibrationIntensity'] = 'LOW';
    let motionState: MPU6050Data['motionState'] = 'CRUISING';

    if (currentRpm < 50) {
      motionState = 'STATIONARY';
      vibrationIntensity = 'LOW';
    } else if (throttleCycle > 0.6) {
      motionState = 'ACCELERATING';
      vibrationIntensity = 'MODERATE';
    } else if (throttleCycle < -0.6) {
      motionState = 'DECELERATING';
      vibrationIntensity = 'MODERATE';
    } else if (accelMag > 11.8) {
      motionState = 'BUMPY_ROAD';
      vibrationIntensity = 'ELEVATED';
    } else {
      motionState = 'CRUISING';
      vibrationIntensity = 'LOW';
    }

    let mpuStatus: SensorStatus = accelMag > 13.0 ? 'warning' : 'normal';

    // Periodic events / logging
    if (this.simTime % 15 === 0) {
      this.emitLog('RPM', 'INFO', `Speed pulse check: ${currentRpm} RPM | Total pulses: ${this.pulseCount}`);
    }
    if (this.simTime % 25 === 0) {
      this.emitLog('DHT11', 'INFO', `Climatic telemetry: ${this.currentTemp}°C, ${this.currentHumidity}% RH`);
    }

    const reading: TelemetryReading = {
      timestamp: timestampStr,
      unixTime: Date.now(),
      dht11: {
        temperature: this.currentTemp,
        humidity: this.currentHumidity,
        status: dhtStatus,
        lastUpdated: timestampStr,
      },
      rpm: {
        currentRpm,
        averageRpm: avgRpm,
        maxRpm: this.maxObservedRpm,
        pulseCount: this.pulseCount,
        pulsesPerRevolution: this.pulsesPerRevolution,
        isRotating: currentRpm > 10,
        status: rpmStatus,
        lastUpdated: timestampStr,
      },
      servo: {
        commandedAngle: this.commandedServoAngle,
        measuredPosition: undefined, // Explicitly undefined as prototype uses open-loop PWM without analog feedback tap
        hasHardwareFeedback: false,
        minAngle: 0,
        maxAngle: 180,
        torqueRatingKgCm: 40,
        status: servoStatus,
        lastUpdated: timestampStr,
      },
      mpu6050: {
        accel: { x: ax, y: ay, z: az },
        gyro: { x: gx, y: gy, z: gz },
        accelMagnitude: accelMag,
        vibrationIntensity,
        motionState,
        unit: 'm/s²',
        status: mpuStatus,
        lastUpdated: timestampStr,
      },
      batteryVoltage: 48.6,
      systemHealth: dhtStatus === 'warning' || rpmStatus === 'warning' ? 'DEGRADED' : 'OPTIMAL',
    };

    this.telemetryListeners.forEach((listener) => listener(reading));
  }
}

export const sensorProvider: ISensorProvider = new MockSensorProvider();
