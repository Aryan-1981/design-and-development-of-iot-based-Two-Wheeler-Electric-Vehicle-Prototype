import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Gauge } from 'lucide-react';
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
        <div data-cursor="GAUGE" className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between shadow-sm">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-xs font-mono uppercase text-slate-500 font-semibold">NPN Tachometer</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                latest?.motor_rotating
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
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

          <div className="w-full grid grid-cols-2 gap-3 text-xs font-mono pt-3 border-t border-slate-200/80">
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">PEAK RECORDED</span>
              <span className="text-slate-900 font-extrabold text-sm">{maxRpmSession} RPM</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">PULSE COUNTER</span>
              <span className="text-indigo-600 font-extrabold text-sm">{latest?.pulse_count ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Velocity Profile Line Graph */}
        <div data-cursor="TELEMETRY" className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-600" />
                Motor Shaft RPM Velocity Profile
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Calculated from NPN sensor pulses over elapsed time: RPM = (pulses × 60000) / (PPR × Δt)
              </p>
            </div>
            <div className="text-xs font-mono px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              PPR: <span className="font-bold">{latest?.pulses_per_revolution ?? 1}</span>
            </div>
          </div>

          <div className="w-full h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rpmStreamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  unit=" RPM"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(226, 232, 240, 0.9)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                    color: '#0f172a',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="RPM"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
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
