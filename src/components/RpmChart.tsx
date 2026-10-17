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
import { TrendingUp } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryPanel } from './TelemetryPanel';
import { CHART_GRID, CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from './chartTheme';

interface RpmChartProps {
  history: UnifiedTelemetry[];
}

/**
 * Shaft-speed trend, styled like the temperature/gyro telemetry charts:
 * header LIVE + current-value chips, cyan gradient area, dashed grid.
 */
export const RpmChart: React.FC<RpmChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    RPM: item.rpm.valid ? item.rpm.value : null,
  }));

  const latest = history[history.length - 1]?.rpm;
  const isAvailable = Boolean(latest && latest.valid);
  const currentRpm = isAvailable ? latest?.value ?? 0 : 0;

  return (
    <TelemetryPanel
      icon={TrendingUp}
      accent="accent"
      title="Motor Shaft RPM Trend"
      subtitle="Tachometer samples over the sampling window — scroll-linked history from the live stream"
      actions={
        isAvailable ? (
          <>
            <span className="ev-chip ev-chip-ok">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 signal-live" aria-hidden="true" />
              Live
            </span>
            <span className="ev-chip ev-chip-info">
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                {currentRpm.toLocaleString()} RPM
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 self-center">RPM</span>
          </>
        ) : (
          <span className="ev-chip ev-chip-warn">Awaiting RPM Data</span>
        )
      }
      isEmpty={history.length === 0 || !isAvailable}
      emptyMessage="No RPM samples yet. A zero reading with a connected sensor is valid — connect the stream to record live shaft speed."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="rpmStreamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
          <YAxis {...CHART_AXIS_PROPS} domain={['auto', 'auto']} unit=" RPM" width={74} tickMargin={4} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(val) => [`${val} RPM`, 'Shaft Speed']}
          />
          <Area
            type="monotone"
            dataKey="RPM"
            name="Shaft RPM"
            stroke="#0EA5E9"
            strokeWidth={2.25}
            fill="url(#rpmStreamGrad)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, fill: '#0284C7', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </TelemetryPanel>
  );
};
