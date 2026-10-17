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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Actuator Angle Dial */}
        <div data-cursor="DIAL" className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between shadow-sm">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Actuator Command</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                latest?.test_active
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {latest?.test_active ? '10-MIN TEST ACTIVE' : 'TEST COMPLETE / IDLE'}
            </span>
          </div>

          <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden my-4">
            <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
                strokeDasharray="220 440"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#d97706"
                strokeWidth="10"
                strokeDasharray={`${(logicalAngle / 30) * 220} 440`}
                className="transition-all duration-300"
                style={{ filter: 'drop-shadow(0 0 6px rgba(217, 119, 6, 0.3))' }}
              />
            </svg>
            <div
              className="absolute bottom-2 w-1.5 h-20 bg-amber-500 origin-bottom transition-transform duration-300 rounded shadow-md"
              style={{ transform: `rotate(${(logicalAngle / 30) * 180 - 90}deg)` }}
            />
            <div className="absolute bottom-0 w-4 h-4 rounded-full bg-amber-600 ring-4 ring-white shadow-sm" />
          </div>

          <div className="w-full text-center">
            <div className="text-3xl font-extrabold font-mono text-slate-900">
              {logicalAngle}°
              <span className="text-xs text-slate-500 font-sans ml-1 font-semibold">
                (Output: {outputAngle}°)
              </span>
            </div>
            <div className="text-[10px] font-mono text-amber-700 font-semibold mt-0.5">
              Current Stage: {latest?.current_stage || 'RUNNING SEQUENCE'}
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 text-xs font-mono pt-3 border-t border-slate-200/80 mt-2">
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">LOGICAL RANGE</span>
              <span className="text-slate-900 font-bold">0° to 30°</span>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">TIME REMAINING</span>
              <span className="text-indigo-600 font-bold">{remainingSec}s</span>
            </div>
          </div>
        </div>

        {/* Right: Servo Command Angle History Chart */}
        <div data-cursor="TELEMETRY" className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                Servo Commanded Angle Tracking
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Displays commanded angles executed by the ESP32 (Physical command = 180 - angle)
              </p>
            </div>
            <div className="text-xs font-mono px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              Actuator Pin: <span className="font-bold">GPIO 18</span>
            </div>
          </div>

          <div className="w-full h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <Line
                  type="stepAfter"
                  dataKey="LogicalAngle"
                  name="Logical Angle (°)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#d97706' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
