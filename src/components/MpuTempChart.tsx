import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Cpu } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryPanel } from './TelemetryPanel';
import { CHART_GRID, CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from './chartTheme';

interface MpuTempChartProps {
  history: UnifiedTelemetry[];
}

export const MpuTempChart: React.FC<MpuTempChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    Temperature: item.mpu6050.valid ? item.mpu6050.temperature_c : null,
  }));

  const latest = history[history.length - 1]?.mpu6050;
  const dieTemp = latest?.valid ? latest.temperature_c : null;
  const isAvailable = dieTemp !== null;

  return (
    <TelemetryPanel
      icon={Cpu}
      accent="accent"
      title="MPU6050 Die Temperature"
      subtitle="Internal silicon temperature (°C) — distinct from ambient DHT11 air reading"
      actions={
        isAvailable ? (
          <>
            <span className="ev-chip ev-chip-ok">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 signal-live" aria-hidden="true" />
              Live
            </span>
            <span className="ev-chip ev-chip-info">
              <span className="ev-metric text-[11px] normal-case tracking-normal">{dieTemp} °C</span>
            </span>
          </>
        ) : (
          <span className="ev-chip ev-chip-warn">Awaiting Die Temp</span>
        )
      }
      isEmpty={history.length === 0 || !isAvailable}
      emptyMessage="No IMU die-temperature samples yet. This channel is reported by the MPU6050 over I²C."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="mpuStandaloneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284C7" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
          <YAxis {...CHART_AXIS_PROPS} domain={['auto', 'auto']} unit="°C" width={54} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(val) => [`${val} °C`, 'Die Temp']}
          />
          <Area
            type="monotone"
            dataKey="Temperature"
            name="MPU6050 Temp (°C)"
            stroke="#0284C7"
            strokeWidth={2.25}
            fill="url(#mpuStandaloneGrad)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, fill: '#0284C7', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </TelemetryPanel>
  );
};
