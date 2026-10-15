import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Gauge, AlertCircle, CheckCircle } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { RpmGauge } from './RpmGauge';

interface RpmChartProps {
  history: UnifiedTelemetry[];
  maxRpmSession: number;
}

export const RpmChart: React.FC<RpmChartProps> = ({ history, maxRpmSession }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    RPM: item.rpm.valid ? item.rpm.value : null,
  }));

  const latest = history[history.length - 1]?.rpm;
  const isAvailable = latest && latest.valid;
  const currentRpm = latest?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tachometer Visual Gauge */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400">NPN Tachometer</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                latest?.motor_rotating
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {latest?.motor_rotating ? 'MOTOR SPINNING' : 'MOTOR STOPPED'}
            </span>
          </div>

          <RpmGauge
            rpm={isAvailable && currentRpm !== null ? currentRpm : 0}
            maxRpm={3000}
            isRotating={latest?.motor_rotating ?? false}
          />

          <div className="w-full grid grid-cols-2 gap-3 text-xs font-mono pt-3 border-t border-slate-800">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">PEAK RECORDED</span>
              <span className="text-white font-bold">{maxRpmSession} RPM</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">PULSE COUNTER</span>
              <span className="text-cyan-300 font-bold">{latest?.pulse_count ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Velocity Profile Line Graph */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-400" />
                Motor Shaft RPM Velocity Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated from NPN sensor pulses over elapsed time: RPM = (pulses × 60000) / (PPR × Δt)
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400">
              PPR: <span className="text-white font-bold">{latest?.pulses_per_revolution ?? 1}</span>
            </div>
          </div>

          <div className="w-full h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rpmStreamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" RPM" />
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
                  dataKey="RPM"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#rpmStreamGrad)"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
