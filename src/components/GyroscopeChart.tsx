import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Compass, AlertCircle } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';

interface GyroscopeChartProps {
  history: UnifiedTelemetry[];
}

export const GyroscopeChart: React.FC<GyroscopeChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    'Gyro X': item.mpu6050.valid ? item.mpu6050.gyro_x_rads : null,
    'Gyro Y': item.mpu6050.valid ? item.mpu6050.gyro_y_rads : null,
    'Gyro Z': item.mpu6050.valid ? item.mpu6050.gyro_z_rads : null,
  }));

  const latest = history[history.length - 1]?.mpu6050;
  const isAvailable = latest && latest.valid;

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              MPU6050 Gyroscope — Angular Velocity (rad/s)
            </h3>
            <p className="text-xs text-slate-400">
              3-Axis rotational rate directly from Adafruit MPU6050 in rad/s
            </p>
          </div>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-sky-400">X: {latest.gyro_x_rads ?? '--'}</span>
            <span className="text-amber-400">Y: {latest.gyro_y_rads ?? '--'}</span>
            <span className="text-rose-400">Z: {latest.gyro_z_rads ?? '--'}</span>
            <span className="text-slate-400">rad/s</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Awaiting Real Gyroscope Data</span>
          </div>
        )}
      </div>

      <div className="w-full h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" rad/s" />
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
              dataKey="Gyro X"
              name="Gyro X (rad/s)"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Gyro Y"
              name="Gyro Y (rad/s)"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Gyro Z"
              name="Gyro Z (rad/s)"
              stroke="#f43f5e"
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
