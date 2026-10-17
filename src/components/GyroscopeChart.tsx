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
import { RotateCcw } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryPanel } from './TelemetryPanel';
import { CHART_GRID, CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from './chartTheme';

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
  const isAvailable = Boolean(latest?.valid);

  return (
    <TelemetryPanel
      icon={RotateCcw}
      accent="accent"
      title="MPU6050 Gyroscope"
      subtitle="Rotational rate per axis (rad/s) — angular velocity, not orientation"
      actions={
        isAvailable ? (
          <>
            <span className="ev-chip ev-chip-ok">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 signal-live" aria-hidden="true" />
              Live
            </span>
            <span className="ev-chip" style={{ background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.28)', color: '#1D4ED8' }}>
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                X {latest?.gyro_x_rads ?? '--'}
              </span>
            </span>
            <span className="ev-chip" style={{ background: 'rgba(217,119,6,0.09)', borderColor: 'rgba(217,119,6,0.3)', color: '#B45309' }}>
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                Y {latest?.gyro_y_rads ?? '--'}
              </span>
            </span>
            <span className="ev-chip" style={{ background: 'rgba(225,29,72,0.08)', borderColor: 'rgba(225,29,72,0.28)', color: '#BE123C' }}>
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                Z {latest?.gyro_z_rads ?? '--'}
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 self-center">rad/s</span>
          </>
        ) : (
          <span className="ev-chip ev-chip-warn">Awaiting Gyroscope Data</span>
        )
      }
      isEmpty={history.length === 0 || !isAvailable}
      emptyMessage="No gyroscope samples yet. Angular-rate traces appear once the MPU6050 stream is valid."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
          <YAxis {...CHART_AXIS_PROPS} unit=" rad/s" width={68} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(val) => [`${val} rad/s`, 'Angular Rate']}
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
            name="Gyro X"
            stroke="#2563EB"
            strokeWidth={2.25}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="Gyro Y"
            name="Gyro Y"
            stroke="#D97706"
            strokeWidth={2.25}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="Gyro Z"
            name="Gyro Z"
            stroke="#E11D48"
            strokeWidth={2.25}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </TelemetryPanel>
  );
};
