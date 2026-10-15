import React, { useState } from 'react';
import { TelemetryReading } from '../types/sensor';
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
import {
  Activity,
  Sliders,
  Filter,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

interface LiveSensorsTabProps {
  reading: TelemetryReading | null;
  history: TelemetryReading[];
  samplingRate: number;
  onUpdateSamplingRate: (rate: number) => void;
}

export const LiveSensorsTab: React.FC<LiveSensorsTabProps> = ({
  reading,
  history,
  samplingRate,
  onUpdateSamplingRate,
}) => {
  const [windowPoints, setWindowPoints] = useState<number>(30);
  const [activeSensors, setActiveSensors] = useState({
    rpm: true,
    temp: true,
    humidity: true,
    accel: true,
    gyro: false,
  });

  const displayData = history.slice(-windowPoints).map((item) => ({
    time: item.timestamp,
    RPM: item.rpm.currentRpm,
    'Temp (°C)': item.dht11.temperature,
    'Humidity (%)': item.dht11.humidity,
    'Accel Mag (m/s²)': item.mpu6050.accelMagnitude,
    'Gyro Z (°/s)': item.mpu6050.gyro.z,
  }));

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Real-Time Oscilloscope & Multi-Sensor Graph
            </h2>
            <p className="text-xs text-slate-400">
              Interactive high-resolution synchronized time-series analysis
            </p>
          </div>
        </div>

        {/* Sampling Interval & Window controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sampling Rate:</span>
            <select
              value={samplingRate}
              onChange={(e) => onUpdateSamplingRate(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value={200}>200ms (High Freq 5Hz)</option>
              <option value={500}>500ms (2Hz)</option>
              <option value={1000}>1000ms (Standard 1Hz)</option>
              <option value={2000}>2000ms (Eco 0.5Hz)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Window:</span>
            <select
              value={windowPoints}
              onChange={(e) => setWindowPoints(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value={15}>Last 15 frames</option>
              <option value={30}>Last 30 frames</option>
              <option value={40}>Last 40 frames</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sensor toggle filter pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Toggle Channels:
        </span>
        <button
          onClick={() => setActiveSensors((s) => ({ ...s, rpm: !s.rpm }))}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            activeSensors.rpm
              ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-glow-cyan/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          Motor RPM
        </button>
        <button
          onClick={() => setActiveSensors((s) => ({ ...s, temp: !s.temp }))}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            activeSensors.temp
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          Temperature (°C)
        </button>
        <button
          onClick={() => setActiveSensors((s) => ({ ...s, humidity: !s.humidity }))}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            activeSensors.humidity
              ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          Humidity (%)
        </button>
        <button
          onClick={() => setActiveSensors((s) => ({ ...s, accel: !s.accel }))}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            activeSensors.accel
              ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          MPU6050 Accel Mag
        </button>
        <button
          onClick={() => setActiveSensors((s) => ({ ...s, gyro: !s.gyro }))}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            activeSensors.gyro
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
        >
          MPU6050 Gyro Z
        </button>
      </div>

      {/* Main Multi-Channel Chart */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
              {activeSensors.rpm && (
                <Line
                  type="monotone"
                  dataKey="RPM"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activeSensors.temp && (
                <Line
                  type="monotone"
                  dataKey="Temp (°C)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activeSensors.humidity && (
                <Line
                  type="monotone"
                  dataKey="Humidity (%)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activeSensors.accel && (
                <Line
                  type="monotone"
                  dataKey="Accel Mag (m/s²)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {activeSensors.gyro && (
                <Line
                  type="monotone"
                  dataKey="Gyro Z (°/s)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
