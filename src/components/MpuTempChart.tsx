import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Cpu, AlertCircle } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';

interface MpuTempChartProps {
  history: UnifiedTelemetry[];
}

export const MpuTempChart: React.FC<MpuTempChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    Temperature: item.mpu6050.valid ? item.mpu6050.temperature_c : null,
  }));

  const latest = history[history.length - 1]?.mpu6050;
  const isAvailable = latest && latest.valid;

  return (
    <div data-cursor="TELEMETRY" className="glass-panel rounded-2xl p-6 flex flex-col shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider">
              MPU6050 Internal Die Temperature (°C)
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Internal silicon die temperature via I2C (Register 0x41/0x42)
            </p>
          </div>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 font-mono font-bold text-xs">
            <span>Die Temp:</span>
            <span>{latest.temperature_c !== null ? `${latest.temperature_c} °C` : '--'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Awaiting MPU6050 Die Data</span>
          </div>
        )}
      </div>

      <div className="w-full h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="mpuStandaloneGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
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
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              unit="°C"
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
              dataKey="Temperature"
              name="MPU6050 Temp (°C)"
              stroke="#0284c7"
              strokeWidth={2.5}
              fill="url(#mpuStandaloneGrad)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
