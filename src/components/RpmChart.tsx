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
    <div data-cursor="TELEMETRY" className="glass-panel rounded-2xl p-6 flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider">
              Motor Shaft RPM
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              NPN tachometer — RPM = (pulses × 60000) / (PPR × Δt)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`px-2.5 py-1 rounded-full font-semibold border ${
              latest?.motor_rotating
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {latest?.motor_rotating ? 'SPINNING' : 'STOPPED'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
            PPR: {latest?.pulses_per_revolution ?? 1}
          </span>
        </div>
      </div>

      {/* Gauge — centred above chart */}
      <div className="flex flex-col items-center pt-4 pb-2">
        <RpmGauge
          rpm={isAvailable && currentRpm !== null ? currentRpm : 0}
          maxRpm={3000}
          isRotating={latest?.motor_rotating ?? false}
        />
        {/* Peak & Pulse stats below gauge */}
        <div className="flex gap-4 mt-1 text-xs font-mono">
          <div className="bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/80 text-center">
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Peak Session</span>
            <span className="text-slate-900 font-extrabold">{maxRpmSession} RPM</span>
          </div>
          <div className="bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/80 text-center">
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Pulse Count</span>
            <span className="text-indigo-600 font-extrabold">{latest?.pulse_count ?? 0}</span>
          </div>
        </div>
      </div>

      {/* RPM History Chart — below gauge */}
      <div className="w-full h-52 mt-4 border-t border-slate-200/80 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
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
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(226,232,240,0.9)',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
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
              dot={false}
              activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
