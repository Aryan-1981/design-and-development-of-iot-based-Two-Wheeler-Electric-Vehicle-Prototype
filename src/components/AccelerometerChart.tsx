import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Vibrate, AlertCircle } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';

interface AccelerometerChartProps {
  history: UnifiedTelemetry[];
}

export const AccelerometerChart: React.FC<AccelerometerChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    X: item.mpu6050.valid ? item.mpu6050.accel_x_ms2 : null,
    Y: item.mpu6050.valid ? item.mpu6050.accel_y_ms2 : null,
    Z: item.mpu6050.valid ? item.mpu6050.accel_z_ms2 : null,
  }));

  const latest = history[history.length - 1]?.mpu6050;
  const isAvailable = latest && latest.valid;

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
            <Vibrate className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              MPU6050 Accelerometer — Acceleration (m/s²)
            </h3>
            <p className="text-xs text-slate-400">
              Triaxial dynamic chassis acceleration (±8g scale from Adafruit MPU6050)
            </p>
          </div>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-cyan-400">X: {latest.accel_x_ms2 ?? '--'}</span>
            <span className="text-emerald-400">Y: {latest.accel_y_ms2 ?? '--'}</span>
            <span className="text-purple-400">Z: {latest.accel_z_ms2 ?? '--'}</span>
            <span className="text-slate-400">m/s²</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Awaiting Real Accelerometer Data</span>
          </div>
        )}
      </div>

      <div className="w-full h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" m/s²" />
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
            <Line
              type="monotone"
              dataKey="X"
              name="Accel X (m/s²)"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Y"
              name="Accel Y (m/s²)"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Z"
              name="Accel Z (m/s²)"
              stroke="#c084fc"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
