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
    <div className="glass-panel rounded-2xl p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              MPU6050 Internal Temperature (°C)
            </h3>
            <p className="text-xs text-slate-400">
              Silicon die-temperature from MPU6050 internal sensor (Distinct from DHT11 ambient)
            </p>
          </div>
        </div>

        {isAvailable ? (
          <span className="text-cyan-400 font-bold font-mono text-sm">
            Die Temp: {latest.temperature_c !== null ? `${latest.temperature_c} °C` : '--'}
          </span>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Awaiting MPU6050 Die Data</span>
          </div>
        )}
      </div>

      <div className="w-full h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="mpuTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis
              stroke="#64748b"
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              unit="°C"
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
            <Area
              type="monotone"
              dataKey="Temperature"
              name="MPU6050 Temp (°C)"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#mpuTempGrad)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
