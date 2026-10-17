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
    <div data-cursor="TELEMETRY" className="glass-panel rounded-2xl p-6 flex flex-col shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider">
              MPU6050 Gyroscope — Angular Velocity (rad/s)
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              3-Axis rotational rate directly from Adafruit MPU6050 in rad/s
            </p>
          </div>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
              X: {latest.gyro_x_rads ?? '--'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
              Y: {latest.gyro_y_rads ?? '--'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
              Z: {latest.gyro_z_rads ?? '--'}
            </span>
            <span className="text-slate-400 font-semibold">rad/s</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Awaiting Real Gyroscope Data</span>
          </div>
        )}
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
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              unit=" rad/s"
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
            <Legend
              wrapperStyle={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                paddingTop: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="Gyro X"
              name="Gyro X (rad/s)"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Gyro Y"
              name="Gyro Y (rad/s)"
              stroke="#d97706"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Gyro Z"
              name="Gyro Z (rad/s)"
              stroke="#e11d48"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
