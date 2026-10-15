import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { SimulatedElectricalValues } from '../types/sensors';

interface ElectricalMetersProps {
  electrical: SimulatedElectricalValues;
}

export const ElectricalMeters: React.FC<ElectricalMetersProps> = ({ electrical }) => {
  // Voltage Gauge: 40V to 56V scale
  const vMin = 40;
  const vMax = 56;
  const vPct = Math.min(100, Math.max(0, ((electrical.voltage_v - vMin) / (vMax - vMin)) * 100));

  // Current Gauge: 0A to 30A scale
  const aMax = 30;
  const aPct = Math.min(100, Math.max(0, (electrical.current_a / aMax) * 100));

  return (
    <div className="space-y-4">
      {/* Mandatory Disclaimer Badge */}
      <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3 text-xs font-mono text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider block text-amber-300">
            Simulated Electrical Values Notice
          </span>
          Voltage and current are not connected to real sensors. These values are dynamically
          modeled to demonstrate simulated battery load and motor power consumption.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voltmeter Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400">Pack Voltage (Simulated)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950/60 text-amber-300 border border-amber-600/40">
              SIMULATED METER
            </span>
          </div>

          {/* Radial Voltage Gauge */}
          <div className="relative w-48 h-32 flex items-end justify-center overflow-hidden my-4">
            <svg className="w-48 h-48 -rotate-[135deg] transform" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeDasharray="330 440"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="10"
                strokeDasharray={`${(vPct / 100) * 330} 440`}
                className="transition-all duration-300"
                style={{ filter: 'drop-shadow(0 0 6px #06b6d488)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
              <span className="text-3xl font-extrabold font-mono text-white">
                {electrical.voltage_v.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">VOLTS DC</span>
            </div>
          </div>

          <div className="w-full flex justify-between text-[10px] font-mono text-slate-500 px-4">
            <span>40V (Cutoff)</span>
            <span>48V (Nominal)</span>
            <span>54.6V (Full)</span>
          </div>
        </div>

        {/* Ammeter Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400">Motor Current (Simulated)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950/60 text-amber-300 border border-amber-600/40">
              SIMULATED METER
            </span>
          </div>

          {/* Radial Ammeter Gauge */}
          <div className="relative w-48 h-32 flex items-end justify-center overflow-hidden my-4">
            <svg className="w-48 h-48 -rotate-[135deg] transform" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeDasharray="330 440"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeDasharray={`${(aPct / 100) * 330} 440`}
                className="transition-all duration-300"
                style={{ filter: 'drop-shadow(0 0 6px #f59e0b88)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
              <span className="text-3xl font-extrabold font-mono text-white">
                {electrical.current_a.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">AMPERES</span>
            </div>
          </div>

          <div className="w-full flex justify-between text-[10px] font-mono text-slate-500 px-4">
            <span>0A (Idle)</span>
            <span>15A (Cruise)</span>
            <span>30A (Max Draw)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
