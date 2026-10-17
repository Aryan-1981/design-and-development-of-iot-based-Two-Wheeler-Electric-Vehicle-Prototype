import React from 'react';
import { Gauge } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { RpmGauge } from './RpmGauge';
import { TelemetryPanel } from './TelemetryPanel';

interface RpmGaugePanelProps {
  history: UnifiedTelemetry[];
  maxRpmSession: number;
}

/**
 * Gauge-first telemetry card: live tachometer dial plus session statistics.
 * The trend chart lives in its own example-style panel (RpmChart).
 */
export const RpmGaugePanel: React.FC<RpmGaugePanelProps> = ({ history, maxRpmSession }) => {
  const latest = history[history.length - 1]?.rpm;
  const isAvailable = Boolean(latest && latest.valid);
  const currentRpm = isAvailable ? latest?.value ?? 0 : 0;

  return (
    <TelemetryPanel
      icon={Gauge}
      accent="accent"
      title="Motor Shaft RPM"
      subtitle="NPN proximity tachometer on GPIO 5 — RPM = (pulses × 60000) ÷ (PPR × Δt)"
      chartHeight="h-auto min-h-[11rem]"
      actions={
        <>
          <span
            className={`ev-chip ${
              !isAvailable ? 'ev-chip-muted' : latest?.motor_rotating ? 'ev-chip-ok' : 'ev-chip-muted'
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
      <div className="flex flex-col items-center">
        <RpmGauge
          rpm={currentRpm}
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
    </TelemetryPanel>
  );
};
