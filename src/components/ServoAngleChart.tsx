import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Compass } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';

interface ServoAngleChartProps {
  history: UnifiedTelemetry[];
}

export const ServoAngleChart: React.FC<ServoAngleChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    LogicalAngle: item.servo.commanded_angle_deg,
    OutputAngle: item.servo.output_angle_deg,
  }));

  const latest = history[history.length - 1]?.servo;
  const logicalAngle = latest?.commanded_angle_deg ?? 0;
  const outputAngle = latest?.output_angle_deg ?? 180;
  const remainingSec = latest?.remaining_duration_ms
    ? Math.round(latest.remaining_duration_ms / 1000)
    : 0;

  return (
    <div data-cursor="TELEMETRY" className="glass-panel rounded-2xl p-6 flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider">
              Servo Commanded Angle
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              ESP32 actuator — Physical command = 180 − angle (GPIO 18)
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${
            latest?.test_active
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {latest?.test_active ? '10-MIN TEST ACTIVE' : 'IDLE'}
        </span>
      </div>

      {/* Servo Gauge — centred above chart */}
      <div className="flex flex-col items-center pt-6 pb-2">
        {/* Semicircle dial */}
        <div className="relative w-52 h-28 flex items-end justify-center overflow-hidden">
          <svg className="w-52 h-52 -rotate-90 transform" viewBox="0 0 200 200">
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
              strokeDasharray="220 440"
            />
            {/* Active arc */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#d97706"
              strokeWidth="10"
              strokeDasharray={`${(logicalAngle / 30) * 220} 440`}
              className="transition-all duration-300"
              style={{ filter: 'drop-shadow(0 0 6px rgba(217,119,6,0.35))' }}
            />
          </svg>
          {/* Needle */}
          <div
            className="absolute bottom-2 w-1.5 h-20 bg-amber-500 origin-bottom transition-transform duration-300 rounded shadow-md"
            style={{ transform: `rotate(${(logicalAngle / 30) * 180 - 90}deg)` }}
          />
          <div className="absolute bottom-0 w-4 h-4 rounded-full bg-amber-600 ring-4 ring-white shadow-sm" />
        </div>

        {/* Angle readout */}
        <div className="mt-4 text-center">
          <div className="text-3xl font-extrabold font-mono text-slate-900">
            {logicalAngle}°
            <span className="text-xs text-slate-500 font-sans ml-1 font-semibold">
              (Output: {outputAngle}°)
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber-700 font-semibold mt-1">
            {latest?.current_stage || 'RUNNING SEQUENCE'}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-3 text-xs font-mono">
          <div className="bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/80 text-center">
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Logical Range</span>
            <span className="text-slate-900 font-bold">0° to 30°</span>
          </div>
          <div className="bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/80 text-center">
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Time Remaining</span>
            <span className="text-indigo-600 font-bold">{remainingSec}s</span>
          </div>
        </div>
      </div>

      {/* Servo Angle History Chart — below gauge */}
      <div className="w-full h-52 mt-4 border-t border-slate-200/80 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
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
              domain={[0, 35]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              unit="°"
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
            <Line
              type="stepAfter"
              dataKey="LogicalAngle"
              name="Commanded Angle (°)"
              stroke="#d97706"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#d97706' }}
              activeDot={{ r: 5, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
