import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryPanel } from './TelemetryPanel';
import { CHART_GRID, CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from './chartTheme';

interface ServoAngleChartProps {
  history: UnifiedTelemetry[];
}

/** Logical test range of the actuator sequence (degrees). */
const SERVO_MAX_DEG = 60;

export const ServoAngleChart: React.FC<ServoAngleChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    LogicalAngle: item.servo.commanded_angle_deg,
  }));

  const latest = history[history.length - 1]?.servo;
  const logicalAngle = latest?.commanded_angle_deg ?? 0;
  const hasData = history.length > 0;

  return (
    <TelemetryPanel
      icon={Activity}
      accent="warn"
      title="Servo Command Trend"
      subtitle={`Commanded logical angle over time (0–${SERVO_MAX_DEG}°) — stepped actuator sequence`}
      actions={
        hasData ? (
          <>
            <span className="ev-chip ev-chip-ok">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 signal-live" aria-hidden="true" />
              Live
            </span>
            <span
              className="ev-chip"
              style={{ background: 'rgba(217,119,6,0.09)', borderColor: 'rgba(217,119,6,0.3)', color: '#B45309' }}
            >
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                Logical {logicalAngle}°
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 self-center">deg</span>
          </>
        ) : (
          <span className="ev-chip ev-chip-warn">Awaiting Servo Data</span>
        )
      }
      isEmpty={!hasData}
      emptyMessage="No servo packets yet. The commanded-angle sequence appears once the actuator state is published."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
          <YAxis {...CHART_AXIS_PROPS} domain={[0, SERVO_MAX_DEG + 5]} unit="°" width={44} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(val) => [`${val}°`, 'Commanded Angle']}
          />
          <Line
            type="stepAfter"
            dataKey="LogicalAngle"
            name="Commanded Angle"
            stroke="#D97706"
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 4, fill: '#D97706', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </TelemetryPanel>
  );
};
