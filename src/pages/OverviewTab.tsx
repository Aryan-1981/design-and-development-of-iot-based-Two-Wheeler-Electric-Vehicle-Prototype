import React from 'react';
import { TelemetryReading } from '../types/sensor';
import { SensorCard } from '../components/SensorCard';
import { RpmGauge } from '../components/RpmGauge';
import {
  Thermometer,
  Droplets,
  Gauge,
  Compass,
  Activity,
  AlertTriangle,
  Zap,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface OverviewTabProps {
  reading: TelemetryReading | null;
  history: TelemetryReading[];
  onCommandServo: (angle: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  reading,
  history,
  onCommandServo,
}) => {
  if (!reading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Activity className="w-10 h-10 text-cyan-400 animate-spin-slow mb-3" />
        <p className="font-mono text-sm">Awaiting initial telemetry stream from ESP32...</p>
      </div>
    );
  }

  const { dht11, rpm, servo, mpu6050 } = reading;

  // Prepare chart data bounded
  const chartData = history.map((item) => ({
    time: item.timestamp,
    rpm: item.rpm.currentRpm,
    temp: item.dht11.temperature,
    humidity: item.dht11.humidity,
    accel: item.mpu6050.accelMagnitude,
  }));

  return (
    <div className="space-y-6">
      {/* Top Telemetry Alert / Health Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-cyan-500">
          <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Telemetry Cycle</div>
            <div className="text-sm font-bold font-mono text-white">Active Stream (1 Hz)</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-emerald-500">
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">System State</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {reading.systemHealth}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-amber-500">
          <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Aux Battery Pack</div>
            <div className="text-sm font-bold font-mono text-white">
              {reading.batteryVoltage?.toFixed(1) || '48.2'} V DC
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-blue-500">
          <div className="p-2 rounded-lg bg-blue-950/60 text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Operating Mode</div>
            <div className="text-sm font-bold font-mono text-cyan-300">
              {mpu6050.motionState}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Motor RPM */}
        <SensorCard
          title="Motor Shaft RPM"
          value={rpm.currentRpm}
          unit="RPM"
          subtitle={`Max: ${rpm.maxRpm} RPM | Avg: ${rpm.averageRpm} RPM`}
          icon={Gauge}
          status={rpm.status}
          accentColor="cyan"
          badge="NPN SENSOR"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Cumulative Pulses:</span>
            <span className="text-cyan-300 font-bold">{rpm.pulseCount}</span>
          </div>
        </SensorCard>

        {/* Card 2: Environmental Temperature */}
        <SensorCard
          title="Ambient / Controller Temp"
          value={dht11.temperature}
          unit="°C"
          subtitle="Monitored via digital DHT11"
          icon={Thermometer}
          status={dht11.status}
          accentColor="emerald"
          badge="DHT11"
        >
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (dht11.temperature / 60) * 100)}%` }}
            />
          </div>
        </SensorCard>

        {/* Card 3: Environmental Humidity */}
        <SensorCard
          title="Relative Humidity"
          value={dht11.humidity}
          unit="%"
          subtitle="Atmospheric moisture content"
          icon={Droplets}
          status={dht11.status}
          accentColor="blue"
          badge="DHT11"
        >
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${dht11.humidity}%` }}
            />
          </div>
        </SensorCard>

        {/* Card 4: Actuator Position */}
        <SensorCard
          title="Actuator Deflection"
          value={servo.commandedAngle}
          unit="°"
          subtitle="40 kg-cm Torque Servo (Open-Loop PWM)"
          icon={Compass}
          status={servo.status}
          accentColor="amber"
          badge="SERVO"
        >
          <div className="text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Commanded: {servo.commandedAngle}°</span>
            <span className="text-amber-400">0–180° Range</span>
          </div>
        </SensorCard>
      </div>

      {/* Primary Analytics Section: RPM Gauge & Realtime Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: RPM Circular Gauge & Actuator Control */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  Live Tachometer
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PULSES/REV: {rpm.pulsesPerRevolution}
              </span>
            </div>

            <RpmGauge rpm={rpm.currentRpm} maxRpm={3000} isRotating={rpm.isRotating} />
          </div>

          {/* Quick Actuator Test Slider */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono font-medium text-slate-300">
                Actuator Angle Command:
              </label>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {servo.commandedAngle}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              value={servo.commandedAngle}
              onChange={(e) => onCommandServo(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0° (Retracted)</span>
              <span>90° (Neutral)</span>
              <span>180° (Extended)</span>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Realtime Dynamic Telemetry Stream Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Real-Time Multi-Sensor Telemetry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic continuous stream (Last {chartData.length} data frames)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-300">RPM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Temp (°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-slate-300">Humidity (%)</span>
              </div>
            </div>
          </div>

          <div className="w-full h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rpmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rpm"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rpmGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stat Footer Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">ACCEL MAGNITUDE</span>
              <span className="text-white font-bold">{mpu6050.accelMagnitude} m/s²</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">VIBRATION SEVERITY</span>
              <span
                className={`font-bold ${
                  mpu6050.vibrationIntensity === 'LOW'
                    ? 'text-emerald-400'
                    : mpu6050.vibrationIntensity === 'MODERATE'
                    ? 'text-cyan-400'
                    : 'text-amber-400'
                }`}
              >
                {mpu6050.vibrationIntensity}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">LAST PACKET TS</span>
              <span className="text-slate-200">{reading.timestamp}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">INGESTION TRANSPORT</span>
              <span className="text-cyan-400">ESP32 Telemetry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
