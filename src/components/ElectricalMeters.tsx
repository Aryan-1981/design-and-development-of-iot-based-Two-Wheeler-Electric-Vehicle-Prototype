import React from 'react';
import { AlertTriangle, Zap, Activity, BatteryCharging } from 'lucide-react';
import { SimulatedElectricalValues } from '../types/sensors';

interface ElectricalMetersProps {
  electrical: SimulatedElectricalValues;
}

/**
 * Voltage / current / derived power meters.
 * STRICTLY SIMULATED: no physical voltage or current sensor is connected —
 * every value here is modelled and must stay visibly labelled as such.
 */
export const ElectricalMeters: React.FC<ElectricalMetersProps> = ({ electrical }) => {
  // Voltage Gauge: 40V to 56V scale
  const vMin = 40;
  const vMax = 56;
  const vPct = Math.min(100, Math.max(0, ((electrical.voltage_v - vMin) / (vMax - vMin)) * 100));

  // Current Gauge: 0A to 30A scale
  const aMax = 30;
  const aPct = Math.min(100, Math.max(0, (electrical.current_a / aMax) * 100));

  // Power is arithmetic on the two simulated channels (P = V × I)
  const pMax = 1400;
  const pPct = Math.min(100, Math.max(0, (electrical.power_w / pMax) * 100));

  return (
    <section className="space-y-4" aria-label="Simulated electrical monitoring">
      {/* Mandatory simulated-data disclaimer */}
      <div
        className="rounded-card border border-amber-300/80 bg-amber-50/80 p-3.5 flex items-start gap-3 text-xs leading-relaxed text-amber-900"
        role="note"
      >
        <span className="ev-chip ev-chip-warn shrink-0 mt-0.5">
          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
          Simulated
        </span>
        <p>
          <span className="font-bold uppercase tracking-wide">Simulated electrical values.</span>{' '}
          No voltage or current sensor is connected to the prototype. These channels are modelled
          from motor activity to demonstrate battery-load behaviour — they are{' '}
          <span className="font-semibold">not hardware measurements</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Voltmeter */}
        <MeterCard
          title="Pack Voltage"
          icon={BatteryCharging}
          value={electrical.voltage_v.toFixed(1)}
          unit="V DC"
          pct={vPct}
          stroke="#2563EB"
          glow="rgba(37, 99, 235, 0.3)"
          minLabel="40V Cutoff"
          midLabel="48V Nominal"
          maxLabel="54.6V Full"
        />

        {/* Ammeter */}
        <MeterCard
          title="Motor Current"
          icon={Activity}
          value={electrical.current_a.toFixed(1)}
          unit="A"
          pct={aPct}
          stroke="#D97706"
          glow="rgba(217, 119, 6, 0.3)"
          minLabel="0A Idle"
          midLabel="15A Cruise"
          maxLabel="30A Max"
        />

        {/* Derived power */}
        <MeterCard
          title="Derived Power"
          icon={Zap}
          value={electrical.power_w.toFixed(0)}
          unit="W"
          pct={pPct}
          stroke="#0284C7"
          glow="rgba(2, 132, 199, 0.3)"
          minLabel="0 W"
          midLabel="P = V × I"
          maxLabel={`${pMax} W`}
          note="Calculated from the two simulated channels"
        />
      </div>
    </section>
  );
};

interface MeterCardProps {
  title: string;
  icon: React.ElementType;
  value: string;
  unit: string;
  pct: number;
  stroke: string;
  glow: string;
  minLabel: string;
  midLabel: string;
  maxLabel: string;
  note?: string;
}

const MeterCard: React.FC<MeterCardProps> = ({
  title,
  icon: Icon,
  value,
  unit,
  pct,
  stroke,
  glow,
  minLabel,
  midLabel,
  maxLabel,
  note,
}) => (
  <div className="ev-panel p-5 flex flex-col items-center justify-between" data-cursor="METERS">
    <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200/80">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className="w-4 h-4 text-slate-400" aria-hidden="true" />
        {title}
      </span>
      <span className="ev-chip ev-chip-warn">Simulated</span>
    </div>

    {/* Radial gauge */}
    <div className="relative w-44 h-28 flex items-end justify-center overflow-hidden my-4">
      <svg className="w-44 h-44 -rotate-[135deg] transform" viewBox="0 0 200 200" aria-hidden="true">
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="10"
          strokeDasharray="330 440"
        />
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeDasharray={`${(pct / 100) * 330} 440`}
          className="transition-all duration-300"
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-5">
        <span className="ev-metric text-3xl font-bold text-slate-900" aria-live="polite">
          {value}
        </span>
        <span className="ev-eyebrow mt-0.5">{unit}</span>
      </div>
    </div>

    <div className="w-full flex justify-between text-[10px] font-mono text-slate-400 px-1">
      <span>{minLabel}</span>
      <span>{midLabel}</span>
      <span>{maxLabel}</span>
    </div>

    {note && <p className="mt-3 text-[10px] font-mono text-slate-400 text-center">{note}</p>}
  </div>
);
