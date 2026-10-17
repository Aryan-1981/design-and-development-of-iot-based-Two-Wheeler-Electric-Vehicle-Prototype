import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Vibrate } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryPanel } from './TelemetryPanel';
import { CHART_GRID, CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from './chartTheme';

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
  const isAvailable = Boolean(latest?.valid);

  return (
    <TelemetryPanel
      icon={Vibrate}
      accent="cobalt"
      title="MPU6050 Accelerometer"
      subtitle="Triaxial chassis acceleration (m/s²) from the IMU on I²C 0x68 — ±8 g scale"
      actions={
        isAvailable ? (
          <>
            <span className="ev-chip ev-chip-ok">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 signal-live" aria-hidden="true" />
              Live
            </span>
            <span className="ev-chip" style={{ background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.28)', color: '#1D4ED8' }}>
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                X {latest?.accel_x_ms2 ?? '--'}
              </span>
            </span>
            <span className="ev-chip" style={{ background: 'rgba(5,150,105,0.08)', borderColor: 'rgba(5,150,105,0.28)', color: '#047857' }}>
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                Y {latest?.accel_y_ms2 ?? '--'}
              </span>
            </span>
            <span className="ev-chip" style={{ background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.28)', color: '#6D28D9' }}>
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                Z {latest?.accel_z_ms2 ?? '--'}
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 self-center">m/s²</span>
          </>
        ) : (
          <span className="ev-chip ev-chip-warn">Awaiting Accelerometer Data</span>
        )
      }
      isEmpty={history.length === 0 || !isAvailable}
      emptyMessage="No accelerometer samples yet. Acceleration appears once the MPU6050 publishes valid motion packets."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
          <YAxis {...CHART_AXIS_PROPS} unit=" m/s²" width={64} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(val) => [`${val} m/s²`, 'Acceleration']}
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
            dataKey="X"
            name="Accel X"
            stroke="#2563EB"
            strokeWidth={2.25}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="Y"
            name="Accel Y"
            stroke="#059669"
            strokeWidth={2.25}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="Z"
            name="Accel Z"
            stroke="#7C3AED"
            strokeWidth={2.25}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </TelemetryPanel>
  );
};
