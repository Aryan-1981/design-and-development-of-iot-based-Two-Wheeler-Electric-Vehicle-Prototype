import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Compass, Clock, CheckCircle2, RotateCw } from 'lucide-react';
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
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400">Actuator Command</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                latest?.test_active
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
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
                stroke="#1e293b"
                strokeWidth="10"
                strokeDasharray="220 440"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeDasharray={`${(logicalAngle / 30) * 220} 440`}
                className="transition-all duration-300"
                style={{ filter: 'drop-shadow(0 0 6px #f59e0b88)' }}
              />
            </svg>
            <div
              className="absolute bottom-2 w-1.5 h-20 bg-amber-400 origin-bottom transition-transform duration-300 rounded shadow-glow-rose"
              style={{ transform: `rotate(${(logicalAngle / 30) * 180 - 90}deg)` }}
            />
            <div className="absolute bottom-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-slate-900" />
          </div>

          <div className="w-full text-center">
            <div className="text-3xl font-extrabold font-mono text-white">
              {logicalAngle}°
              <span className="text-xs text-slate-400 font-sans ml-1">
                (Output: {outputAngle}°)
              </span>
            </div>
            <div className="text-[10px] font-mono text-amber-400 mt-0.5">
              Current Stage: {latest?.current_stage || 'RUNNING SEQUENCE'}
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 text-xs font-mono pt-3 border-t border-slate-800 mt-2">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">LOGICAL RANGE</span>
              <span className="text-white font-bold">0° to 30°</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">TIME REMAINING</span>
              <span className="text-cyan-300 font-bold">{remainingSec}s</span>
            </div>
          </div>
        </div>

        {/* Right: Servo Command Angle History Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                Servo Commanded Angle Tracking
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays commanded angles executed by the ESP32 (Physical command = 180 - angle)
              </p>
            </div>
            <div className="text-xs font-mono text-amber-400">
              Actuator Pin: <span className="text-white font-bold">GPIO 18</span>
            </div>
          </div>

          <div className="w-full h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis
                  stroke="#64748b"
                  domain={[0, 35]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  unit="°"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="stepAfter"
                  dataKey="LogicalAngle"
                  name="Logical Angle (°)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
