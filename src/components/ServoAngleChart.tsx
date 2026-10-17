import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SlidersHorizontal } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryPanel } from './TelemetryPanel';
import { CHART_GRID, CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from './chartTheme';

interface ServoAngleChartProps {
  history: UnifiedTelemetry[];
}

export const ServoAngleChart: React.FC<ServoAngleChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    LogicalAngle: item.servo.commanded_angle_deg,
    OutputAngle: item.servo.output_angle_deg,
  }));

  const latest = history[history.length - 1]?.servo;
  const logicalAngle = latest?.commanded_angle_deg ?? 0;
  const outputAngle = latest?.output_angle_deg ?? 180;
  const remainingSec = latest?.remaining_duration_ms
    ? Math.round(latest.remaining_duration_ms / 1000)
    : 0;
  const hasData = history.length > 0;

  return (
    <TelemetryPanel
      icon={SlidersHorizontal}
      accent="warn"
      title="Servo Commanded Angle"
      subtitle="Actuator on GPIO 18 — logical test angle 0–30°; physical command = 180 − angle"
      chartHeight="h-52"
      actions={
        <span className={`ev-chip ${latest?.test_active ? 'ev-chip-warn' : 'ev-chip-ok'}`}>
          {latest?.test_active ? '10-Min Test Active' : 'Idle'}
        </span>
      }
      isEmpty={!hasData}
      emptyMessage="No servo packets yet. The commanded-angle sequence appears once the actuator state is published."
    >
      {/* Servo dial */}
      <div className="flex flex-col items-center pb-1">
        <div className="relative w-52 h-28 flex items-end justify-center overflow-hidden">
          <svg className="w-52 h-52 -rotate-90 transform" viewBox="0 0 200 200" aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="10"
              strokeDasharray="220 440"
            />
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#D97706"
              strokeWidth="10"
              strokeDasharray={`${(logicalAngle / 30) * 220} 440`}
              className="transition-all duration-300"
              style={{ filter: 'drop-shadow(0 0 6px rgba(217,119,6,0.35))' }}
            />
          </svg>
          <div
            className="absolute bottom-2 w-1.5 h-20 bg-amber-500 origin-bottom transition-transform duration-300 rounded shadow-md"
            style={{ transform: `rotate(${(logicalAngle / 30) * 180 - 90}deg)` }}
          />
          <div className="absolute bottom-0 w-4 h-4 rounded-full bg-amber-600 ring-4 ring-white shadow-sm" />
        </div>

        <div className="mt-4 text-center">
          <div className="ev-metric text-3xl font-bold text-slate-900" aria-live="polite">
            {logicalAngle}°
            <span className="text-xs text-slate-500 font-sans ml-1.5 font-semibold">
              command · output {outputAngle}°
            </span>
          </div>
          <div className="ev-eyebrow text-amber-700 mt-1.5">
            {latest?.current_stage || 'Running Sequence'}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs">
          <div className="ev-panel-muted px-4 py-2 text-center">
            <span className="ev-eyebrow block">Logical Range</span>
            <span className="ev-metric text-sm font-bold text-slate-900 block mt-0.5">0°–30°</span>
          </div>
          <div className="ev-panel-muted px-4 py-2 text-center">
            <span className="ev-eyebrow block">Time Remaining</span>
            <span className="ev-metric text-sm font-bold text-sky-700 block mt-0.5">
              {remainingSec}s
            </span>
          </div>
        </div>
      </div>

      {/* Commanded angle trend */}
      <div className="w-full border-t border-slate-200/80 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
            <YAxis {...CHART_AXIS_PROPS} domain={[0, 35]} unit="°" width={44} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(val) => [`${val}°`, 'Commanded Angle']}
            />
            <Line
              type="stepAfter"
              dataKey="LogicalAngle"
              name="Commanded Angle (°)"
              stroke="#D97706"
              strokeWidth={2.25}
              dot={false}
              activeDot={{ r: 4, fill: '#D97706', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </TelemetryPanel>
  );
};
