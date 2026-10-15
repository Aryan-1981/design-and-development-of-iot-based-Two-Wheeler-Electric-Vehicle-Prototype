import React from 'react';
import { UnifiedTelemetry } from '../types/sensors';
import { SensorCard } from '../components/SensorCard';
import { TemperatureHumidityChart } from '../components/TemperatureHumidityChart';
import { AccelerometerChart } from '../components/AccelerometerChart';
import { GyroscopeChart } from '../components/GyroscopeChart';
import { MpuTempChart } from '../components/MpuTempChart';
import { RpmChart } from '../components/RpmChart';
import { ServoAngleChart } from '../components/ServoAngleChart';
import { ElectricalMeters } from '../components/ElectricalMeters';
import {
  Thermometer,
  Gauge,
  Cpu,
  Compass,
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

interface OverviewPageProps {
  telemetry: UnifiedTelemetry | null;
  history: UnifiedTelemetry[];
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ telemetry, history }) => {
  const dht = telemetry?.dht11;
  const rpm = telemetry?.rpm;
  const mpu = telemetry?.mpu6050;
  const servo = telemetry?.servo;
  const electrical = telemetry?.simulatedElectrical || {
    voltage_v: 48.0,
    current_a: 0.0,
    power_w: 0.0,
    isSimulated: true,
  };

  const isDhtValid = dht && dht.valid;
  const isRpmValid = rpm && rpm.valid;
  const isMpuValid = mpu && mpu.valid;

  return (
    <div className="space-y-6">
      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ambient Temperature & Humidity (DHT11) */}
        <SensorCard
          title="Ambient Temp & Humidity"
          value={isDhtValid && dht.temperature_c !== null ? `${dht.temperature_c}°C` : '--'}
          subtitle={
            isDhtValid && dht.humidity_percent !== null
              ? `Relative Humidity: ${dht.humidity_percent}%`
              : 'DHT11 Offline'
          }
          icon={Thermometer}
          status={isDhtValid ? 'normal' : 'offline'}
          accentColor="emerald"
          badge="GPIO 4 (DHT11)"
        >
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Sensor Status:</span>
            <span className={isDhtValid ? 'text-emerald-400' : 'text-slate-500'}>
              {isDhtValid ? 'REAL READING' : 'UNAVAILABLE'}
            </span>
          </div>
        </SensorCard>

        {/* Card 2: Motor RPM (NPN Sensor) */}
        <SensorCard
          title="Motor Shaft RPM"
          value={isRpmValid && rpm.value !== null ? rpm.value : 0}
          unit="RPM"
          subtitle={`Max Session: ${telemetry?.maxRpmSession ?? 0} RPM`}
          icon={Gauge}
          status={isRpmValid ? 'normal' : 'offline'}
          accentColor="cyan"
          badge="GPIO 5 (NPN)"
        >
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Cumulative Pulses:</span>
            <span className="text-cyan-300 font-bold">{rpm?.pulse_count ?? 0}</span>
          </div>
        </SensorCard>

        {/* Card 3: MPU6050 Silicon Die Temp */}
        <SensorCard
          title="MPU6050 Die Temp"
          value={isMpuValid && mpu.temperature_c !== null ? `${mpu.temperature_c}°C` : '--'}
          subtitle="Internal IMU Sensor Die"
          icon={Cpu}
          status={isMpuValid ? 'normal' : 'offline'}
          accentColor="purple"
          badge="I2C 0x68"
        >
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Distinct from DHT11:</span>
            <span className={isMpuValid ? 'text-purple-400' : 'text-slate-500'}>
              {isMpuValid ? 'CALIBRATED' : 'UNAVAILABLE'}
            </span>
          </div>
        </SensorCard>

        {/* Card 4: Servo Commanded Angle */}
        <SensorCard
          title="Servo Angle"
          value={`${servo?.commanded_angle_deg ?? 0}°`}
          subtitle={`Physical Command: ${servo?.output_angle_deg ?? 180}°`}
          icon={Compass}
          status={servo?.test_active ? 'warning' : 'normal'}
          statusLabel={servo?.test_active ? 'TESTING' : 'IDLE'}
          accentColor="amber"
          badge="GPIO 18"
        >
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>10-Min Sequence:</span>
            <span className="text-amber-400">
              {servo?.test_active ? 'IN PROGRESS' : 'READY / COMPLETED'}
            </span>
          </div>
        </SensorCard>
      </div>

      {/* Two Prominent Simulated Electrical Meters */}
      <ElectricalMeters electrical={electrical} />

      {/* Real-time Dynamic Charts Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureHumidityChart history={history} />
        <MpuTempChart history={history} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccelerometerChart history={history} />
        <GyroscopeChart history={history} />
      </div>
    </div>
  );
};
