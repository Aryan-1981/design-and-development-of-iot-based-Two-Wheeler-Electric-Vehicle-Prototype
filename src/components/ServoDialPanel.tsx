import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryPanel } from './TelemetryPanel';

interface ServoDialPanelProps {
  history: UnifiedTelemetry[];
}

/** Logical test range of the actuator sequence (degrees). */
const SERVO_MAX_DEG = 60;

/**
 * Dial-first telemetry card: commanded-angle needle, range and countdown.
 * The two-series trend chart lives in its own panel (ServoAngleChart).
 */
export const ServoDialPanel: React.FC<ServoDialPanelProps> = ({ history }) => {
  const latest = history[history.length - 1]?.servo;
  const logicalAngle = Math.min(latest?.commanded_angle_deg ?? 0, SERVO_MAX_DEG);
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
      subtitle="Actuator on GPIO 18 — logical test angle 0–60°; physical command = 180 − angle"
      chartHeight="h-auto min-h-[11rem]"
      actions={
        <span className={`ev-chip ${latest?.test_active ? 'ev-chip-warn' : 'ev-chip-ok'}`}>
          {hasData ? (latest?.test_active ? '10-Min Test Active' : 'Idle') : 'Awaiting Servo Data'}
        </span>
      }
      isEmpty={!hasData}
      emptyMessage="No servo packets yet. The commanded-angle sequence appears once the actuator state is published."
    >
      {/* Servo dial */}
      <div className="flex flex-col items-center">
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
              strokeDasharray={`${(logicalAngle / SERVO_MAX_DEG) * 220} 440`}
              className="transition-all duration-300"
              style={{ filter: 'drop-shadow(0 0 6px rgba(217,119,6,0.35))' }}
            />
          </svg>
          <div
            className="absolute bottom-2 w-1.5 h-20 bg-amber-500 origin-bottom transition-transform duration-300 rounded shadow-md"
            style={{ transform: `rotate(${(logicalAngle / SERVO_MAX_DEG) * 180 - 90}deg)` }}
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
            <span className="ev-metric text-sm font-bold text-slate-900 block mt-0.5">0°–{SERVO_MAX_DEG}°</span>
          </div>
          <div className="ev-panel-muted px-4 py-2 text-center">
            <span className="ev-eyebrow block">Time Remaining</span>
            <span className="ev-metric text-sm font-bold text-sky-700 block mt-0.5">
              {remainingSec}s
            </span>
          </div>
        </div>
      </div>
    </TelemetryPanel>
  );
};
