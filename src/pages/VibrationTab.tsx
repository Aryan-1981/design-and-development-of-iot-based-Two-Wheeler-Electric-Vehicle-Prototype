import React from 'react';
import { TelemetryReading } from '../types/sensor';
import {
  Vibrate,
  Activity,
  Compass,
  AlertTriangle,
  Layers,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface VibrationTabProps {
  reading: TelemetryReading | null;
  history: TelemetryReading[];
}

export const VibrationTab: React.FC<VibrationTabProps> = ({ reading, history }) => {
  if (!reading) return null;
  const { mpu6050 } = reading;

  const accelHistory = history.map((item) => ({
    time: item.timestamp,
    X: item.mpu6050.accel.x,
    Y: item.mpu6050.accel.y,
    Z: item.mpu6050.accel.z,
    Magnitude: item.mpu6050.accelMagnitude,
  }));

  const gyroHistory = history.map((item) => ({
    time: item.timestamp,
    'Gyro X': item.mpu6050.gyro.x,
    'Gyro Y': item.mpu6050.gyro.y,
    'Gyro Z': item.mpu6050.gyro.z,
  }));

  const intensityColor = {
    LOW: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    MODERATE: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
    ELEVATED: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    CRITICAL: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
  }[mpu6050.vibrationIntensity];

  return (
    <div className="space-y-6">
      {/* Top Banner & Methodological Disclaimer */}
      <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <Vibrate className="w-5 h-5 text-purple-400" />
            MPU6050 6-Axis Inertial Measurement & Dynamic Vibration Analysis
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Real-time triaxial accelerometer (X, Y, Z in m/s²) and gyroscope (angular rate in °/s).
            Acceleration magnitude calculates chassis vibration levels induced by motor harmonic
            rotation and road anomalies.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400">
          <span className="text-purple-400 font-bold">I2C BUS:</span> Addr 0x68
        </div>
      </div>

      {/* Axis Cards & Magnitude KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accel Magnitude */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TOTAL ACCEL MAGNITUDE</span>
            <span className={`px-2 py-0.5 rounded border text-[10px] ${intensityColor}`}>
              {mpu6050.vibrationIntensity}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {mpu6050.accelMagnitude}
            </span>
            <span className="text-sm font-mono text-slate-400">m/s²</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400">
            Formula: √(Ax² + Ay² + Az²)
          </div>
        </div>

        {/* Accel X */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs font-mono text-slate-400">ACCELERATION (X-AXIS)</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">
              {mpu6050.accel.x > 0 ? `+${mpu6050.accel.x}` : mpu6050.accel.x}
            </span>
            <span className="text-sm font-mono text-slate-400">m/s²</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Lateral acceleration</div>
        </div>

        {/* Accel Y */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs font-mono text-slate-400">ACCELERATION (Y-AXIS)</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {mpu6050.accel.y > 0 ? `+${mpu6050.accel.y}` : mpu6050.accel.y}
            </span>
            <span className="text-sm font-mono text-slate-400">m/s²</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Longitudinal (braking/accel)</div>
        </div>

        {/* Accel Z */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs font-mono text-slate-400">ACCELERATION (Z-AXIS)</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-purple-400">
              {mpu6050.accel.z > 0 ? `+${mpu6050.accel.z}` : mpu6050.accel.z}
            </span>
            <span className="text-sm font-mono text-slate-400">m/s²</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Vertical road vibration + 1G</div>
        </div>
      </div>

      {/* Triaxial Accelerometer Chart */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Triaxial Accelerometer Waveform
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous live samples over time (m/s²)
            </p>
          </div>
        </div>

        <div className="w-full h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accelHistory}>
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
              <Legend />
              <Line type="monotone" dataKey="X" stroke="#06b6d4" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Y" stroke="#10b981" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Z" stroke="#a855f7" dot={false} strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="Magnitude"
                stroke="#f43f5e"
                dot={false}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gyroscope Rates Chart */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              3-Axis Angular Velocity (Gyroscope)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pitch, roll, and yaw rotational rate in degrees per second (°/s)
            </p>
          </div>
        </div>

        <div className="w-full h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gyroHistory}>
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
              <Legend />
              <Line type="monotone" dataKey="Gyro X" stroke="#38bdf8" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Gyro Y" stroke="#fbbf24" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Gyro Z" stroke="#ec4899" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technical Note on Vibration Calculation */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 font-mono">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-bold">Engineering Measurement Note:</span> Acceleration
          magnitude and dynamic variations are displayed in calibrated physical units (m/s²). True
          spectral FFT or ISO 10816 RMS vibration velocity calculation requires high-frequency
          hardware sampling (typically &gt; 1 kHz on the ESP32), which can be added in Phase 2 via
          ESP-IDF FreeRTOS DMA ring buffers.
        </div>
      </div>
    </div>
  );
};
