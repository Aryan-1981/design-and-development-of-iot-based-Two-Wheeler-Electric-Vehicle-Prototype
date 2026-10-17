import React from 'react';
import { UnifiedTelemetry, HardwareStatus } from '../types/sensors';
import { SensorCard } from '../components/SensorCard';
import { TemperatureHumidityChart } from '../components/TemperatureHumidityChart';
import { AccelerometerChart } from '../components/AccelerometerChart';
import { GyroscopeChart } from '../components/GyroscopeChart';
import { MpuTempChart } from '../components/MpuTempChart';
import { RpmGaugePanel } from '../components/RpmGaugePanel';
import { RpmChart } from '../components/RpmChart';
import { ServoDialPanel } from '../components/ServoDialPanel';
import { ServoAngleChart } from '../components/ServoAngleChart';
import { ElectricalMeters } from '../components/ElectricalMeters';
import { SystemStatusStrip } from '../components/SystemStatusStrip';
import {
  Thermometer,
  Gauge,
  Cpu,
  Compass,
} from 'lucide-react';

interface OverviewPageProps {
  telemetry: UnifiedTelemetry | null;
  history: UnifiedTelemetry[];
  status: HardwareStatus;
  statusDetails: string;
  dataSource: 'ESP32_WIFI' | 'SUPABASE';
  isDemoMode: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  telemetry,
  history,
  status,
  statusDetails,
  dataSource,
  isDemoMode,
}) => {
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

  const isDhtValid = Boolean(dht && dht.valid);
  const isRpmValid = Boolean(rpm && rpm.valid);
  const isMpuValid = Boolean(mpu && mpu.valid);
  const isRotating = Boolean(rpm?.motor_rotating);

  const ambientTemp = isDhtValid ? dht?.temperature_c ?? null : null;
  const dieTemp = isMpuValid ? mpu?.temperature_c ?? null : null;
  const rpmValue = isRpmValid ? rpm?.value ?? 0 : 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Connectivity & data freshness — first thing an evaluator checks */}
      <SystemStatusStrip
        status={status}
        statusDetails={statusDetails}
        dataSource={dataSource}
        isDemoMode={isDemoMode}
        lastUpdateMs={telemetry?.timestamp_ms}
      />

      {/* 2. Primary live sensor readings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ambient temperature (DHT11) */}
        <SensorCard
          title="Ambient Temperature"
          value={ambientTemp !== null ? `${ambientTemp}°C` : '--'}
          subtitle={
            ambientTemp !== null
              ? 'DHT11 calibrated ambient air'
              : 'DHT11 offline or awaiting first packet'
          }
          icon={Thermometer}
          status={isDhtValid ? 'normal' : 'offline'}
          accentColor="emerald"
          badge="GPIO 4 · DHT11"
        >
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
            <span>Source</span>
            <span className={isDhtValid ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
              {isDhtValid ? 'REAL SENSOR' : 'UNAVAILABLE'}
            </span>
          </div>
        </SensorCard>

        {/* Motor shaft RPM (NPN tachometer) */}
        <SensorCard
          title="Motor Shaft RPM"
          value={rpmValue}
          unit="RPM"
          subtitle={`Session peak ${telemetry?.maxRpmSession ?? 0} RPM`}
          icon={Gauge}
          status={isRpmValid ? (isRotating ? 'normal' : 'idle') : 'offline'}
          statusLabel={
            !isRpmValid ? 'OFFLINE' : isRotating ? 'SPINNING' : 'STOPPED'
          }
          accentColor="cyan"
          badge="GPIO 5 · NPN"
        >
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
            <span>Cumulative pulses</span>
            <span className="text-sky-700 font-bold tabular-nums">{rpm?.pulse_count ?? 0}</span>
          </div>
        </SensorCard>

        {/* MPU6050 die temperature */}
        <SensorCard
          title="MPU6050 Die Temp"
          value={dieTemp !== null ? `${dieTemp}°C` : '--'}
          subtitle="IMU silicon die — not ambient air"
          icon={Cpu}
          status={isMpuValid ? 'normal' : 'offline'}
          accentColor="blue"
          badge="I²C 0x68"
        >
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
            <span>Channel</span>
            <span className={isMpuValid ? 'text-sky-700 font-bold' : 'text-slate-400'}>
              {isMpuValid ? 'CALIBRATED' : 'UNAVAILABLE'}
            </span>
          </div>
        </SensorCard>

        {/* Servo commanded angle */}
        <SensorCard
          title="Servo Angle"
          value={`${servo?.commanded_angle_deg ?? 0}°`}
          subtitle={`Physical command ${servo?.output_angle_deg ?? 180}° (180 − angle)`}
          icon={Compass}
          status={servo?.test_active ? 'warning' : 'normal'}
          statusLabel={servo?.test_active ? 'TESTING' : 'IDLE'}
          accentColor="amber"
          badge="GPIO 18 · PWM"
        >
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
            <span>10-min sequence</span>
            <span className="text-amber-700 font-bold">
              {servo?.test_active ? 'IN PROGRESS' : 'READY / DONE'}
            </span>
          </div>
        </SensorCard>
      </div>

      {/* 3. Electrical measurements — always labelled simulated */}
      <ElectricalMeters electrical={electrical} />

      {/* 4. RPM & servo gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <RpmGaugePanel history={history} maxRpmSession={telemetry?.maxRpmSession ?? 0} />
        <ServoDialPanel history={history} />
      </div>

      {/* 5. RPM & servo trend graphs — under the telemetry cards above */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <RpmChart history={history} />
        <ServoAngleChart history={history} />
      </div>

      {/* 6. Temperature trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <TemperatureHumidityChart history={history} />
        <MpuTempChart history={history} />
      </div>

      {/* 7. Motion trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <AccelerometerChart history={history} />
        <GyroscopeChart history={history} />
      </div>
    </div>
  );
};
