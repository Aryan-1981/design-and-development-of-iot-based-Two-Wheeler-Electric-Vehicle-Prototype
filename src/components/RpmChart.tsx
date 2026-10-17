import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Gauge } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { RpmGauge } from './RpmGauge';
import { TelemetryPanel } from './TelemetryPanel';
import { CHART_GRID, CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from './chartTheme';

interface RpmChartProps {
  history: UnifiedTelemetry[];
  maxRpmSession: number;
  /** Hides the bottom trend chart on dense overview layouts */
  compact?: boolean;
}

export const RpmChart: React.FC<RpmChartProps> = ({ history, maxRpmSession, compact = false }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    RPM: item.rpm.valid ? item.rpm.value : null,
  }));

  const latest = history[history.length - 1]?.rpm;
  const isAvailable = latest && latest.valid;
  const currentRpm = latest?.value ?? 0;

  return (
    <TelemetryPanel
      icon={Gauge}
      accent="accent"
      title="Motor Shaft RPM"
      subtitle="NPN proximity tachometer on GPIO 5 — RPM = (pulses × 60000) ÷ (PPR × Δt)"
      chartHeight={compact ? 'h-44' : 'h-52'}
      actions={
        <>
          <span
            className={`ev-chip ${
              !isAvailable
                ? 'ev-chip-muted'
                : latest?.motor_rotating
                ? 'ev-chip-ok'
                : 'ev-chip-muted'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                latest?.motor_rotating ? 'bg-emerald-500 signal-live' : 'bg-slate-400'
              }`}
              aria-hidden="true"
            />
            {isAvailable ? (latest?.motor_rotating ? 'Spinning' : 'Stopped') : 'No Signal'}
          </span>
          <span className="ev-chip ev-chip-accent">PPR {latest?.pulses_per_revolution ?? 1}</span>
        </>
      }
      isEmpty={history.length === 0}
      emptyMessage="No RPM samples yet. A zero reading with a connected sensor is valid — connect the stream to record live shaft speed."
    >
      {/* Gauge — centred above chart */}
      <div className="flex flex-col items-center pb-2">
        <RpmGauge
          rpm={isAvailable && currentRpm !== null ? currentRpm : 0}
          maxRpm={3000}
          isRotating={latest?.motor_rotating ?? false}
          isStale={!isAvailable}
        />
        <div className="flex flex-wrap justify-center gap-3 mt-1 text-xs">
          <div className="ev-panel-muted px-4 py-2 text-center min-w-[7.5rem]">
            <span className="ev-eyebrow block">Session Peak</span>
            <span className="ev-metric text-sm font-bold text-slate-900 block mt-0.5">
              {maxRpmSession}
              <span className="text-[10px] text-slate-500 font-sans ml-1">RPM</span>
            </span>
          </div>
          <div className="ev-panel-muted px-4 py-2 text-center min-w-[7.5rem]">
            <span className="ev-eyebrow block">Pulse Count</span>
            <span className="ev-metric text-sm font-bold text-sky-700 block mt-0.5">
              {latest?.pulse_count ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* RPM History Trend */}
      {!compact && (
        <div className="w-full border-t border-slate-200/80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="rpmStreamGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
              <YAxis {...CHART_AXIS_PROPS} unit=" " width={54} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(val) => [`${val} RPM`, 'Shaft Speed']}
              />
              <Area
                type="monotone"
                dataKey="RPM"
                name="RPM"
                stroke="#0EA5E9"
                strokeWidth={2.25}
                fill="url(#rpmStreamGrad)"
                connectNulls={false}
                dot={false}
                activeDot={{ r: 4, fill: '#0284C7', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </TelemetryPanel>
  );
};
