import React, { useState } from 'react';
import { TelemetryReading } from '../types/sensor';
import { RpmGauge } from '../components/RpmGauge';
import {
  Gauge,
  Sliders,
  RotateCw,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface MotorRpmTabProps {
  reading: TelemetryReading | null;
  history: TelemetryReading[];
  pulsesPerRev: number;
  onUpdatePulsesPerRev: (pulses: number) => void;
  onCommandServo: (angle: number) => void;
}

export const MotorRpmTab: React.FC<MotorRpmTabProps> = ({
  reading,
  history,
  pulsesPerRev,
  onUpdatePulsesPerRev,
  onCommandServo,
}) => {
  const [customPulsesInput, setCustomPulsesInput] = useState<string>(String(pulsesPerRev));

  if (!reading) return null;
  const { rpm, servo } = reading;

  const rpmChartData = history.map((item) => ({
    time: item.timestamp,
    rpm: item.rpm.currentRpm,
    avgRpm: item.rpm.averageRpm,
  }));

  const handleApplyPulses = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customPulsesInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 120) {
      onUpdatePulsesPerRev(val);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Description / Hardware Note */}
      <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-cyan-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            NPN Hall / Optical RPM Sensor & 40 kg-cm Actuator Interface
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            RPM is derived dynamically from hardware interrupt pulses over a calibrated sampling
            window. Pulses-per-revolution (PPR) is fully configurable according to your target
            sprocket or magnetic pole configuration.
          </p>
        </div>

        {/* Configurable Pulses per Revolution form */}
        <form
          onSubmit={handleApplyPulses}
          className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700 font-mono text-xs"
        >
          <span className="text-slate-400">Pulses/Rev:</span>
          <input
            type="number"
            min="1"
            max="120"
            value={customPulsesInput}
            onChange={(e) => setCustomPulsesInput(e.target.value)}
            className="w-16 bg-slate-950 border border-slate-700 px-2 py-1 rounded text-cyan-400 font-bold focus:outline-none focus:border-cyan-400 text-center"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Main Motor Cards & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Tachometer Gauge */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400">Motor Rotation</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                rpm.isRotating
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {rpm.isRotating ? 'ACTIVE ROTATION' : 'IDLE / STOPPED'}
            </span>
          </div>

          <RpmGauge rpm={rpm.currentRpm} maxRpm={3000} isRotating={rpm.isRotating} />

          <div className="w-full grid grid-cols-2 gap-3 text-xs font-mono pt-3 border-t border-slate-800">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">PEAK RECORDED</span>
              <span className="text-white font-bold">{rpm.maxRpm} RPM</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">RUNNING AVERAGE</span>
              <span className="text-cyan-300 font-bold">{rpm.averageRpm} RPM</span>
            </div>
          </div>
        </div>

        {/* Center: Realtime RPM History Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                RPM Velocity Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic instantaneous versus windowed average motor speed
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400">
              Total Interrupt Pulses: <span className="text-white font-bold">{rpm.pulseCount}</span>
            </div>
          </div>

          <div className="w-full h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rpmChartData}>
                <defs>
                  <linearGradient id="rpmMotorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rpm"
                  name="Instant RPM"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#rpmMotorGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actuator & Servo Detailed Control Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                40 kg-cm High-Torque Servo Actuator Module
              </h3>
              <p className="text-xs text-slate-400">
                Aerodynamic flap / throttle linkage / mechanical bypass position controller
              </p>
            </div>
          </div>

          {/* Torque specification badge */}
          <div className="px-3 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono">
            RATING: 40 kg-cm Stall Torque (Not Load Weight)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Actuator Visual Position Dial */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-xl border border-slate-800">
            <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="10"
                  strokeDasharray="220 440"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="10"
                  strokeDasharray={`${(servo.commandedAngle / 180) * 220} 440`}
                  className="transition-all duration-300"
                  style={{ filter: 'drop-shadow(0 0 6px #f59e0b88)' }}
                />
              </svg>
              <div
                className="absolute bottom-2 w-1 h-20 bg-amber-400 origin-bottom transition-transform duration-300 rounded"
                style={{ transform: `rotate(${servo.commandedAngle - 90}deg)` }}
              />
              <div className="absolute bottom-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-slate-900" />
            </div>

            <div className="mt-3 text-center">
              <div className="text-2xl font-bold font-mono text-white">
                {servo.commandedAngle}°
              </div>
              <div className="text-[11px] font-mono text-slate-400">COMMANDED ANGLE (0-180°)</div>
              <div className="text-[10px] text-slate-500 mt-1 italic">
                *Open-loop PWM control. Measured position requires analog feedback line.
              </div>
            </div>
          </div>

          {/* Interactive Presets & Sliders */}
          <div className="flex flex-col justify-between">
            <div>
              <label className="text-xs font-mono font-medium text-slate-300 block mb-2">
                Set Target Servo Angle:
              </label>
              <input
                type="range"
                min="0"
                max="180"
                value={servo.commandedAngle}
                onChange={(e) => onCommandServo(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                <span>0° (Min)</span>
                <span>90° (Neutral)</span>
                <span>180° (Max)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-6">
              <span className="text-xs font-mono text-slate-400 block mb-2">
                Actuator Quick Presets:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[0, 45, 90, 180].map((val) => (
                  <button
                    key={val}
                    onClick={() => onCommandServo(val)}
                    className={`py-2 px-3 rounded-lg border font-mono text-xs transition-all ${
                      servo.commandedAngle === val
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    {val}°
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Torque Note</span>
              </div>
              The 40 kg rating denotes peak mechanical stall torque (40 kg-cm at 6.0V), not a weight
              sensor. Position feedback requires an external rotary encoder or tapped potentiometer.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
