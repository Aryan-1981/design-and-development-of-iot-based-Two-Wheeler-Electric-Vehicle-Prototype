import React from 'react';

interface RpmGaugeProps {
  rpm: number;
  maxRpm?: number;
  isRotating: boolean;
  /** True when the RPM reading is invalid / stream has no samples */
  isStale?: boolean;
}

export const RpmGauge: React.FC<RpmGaugeProps> = ({
  rpm,
  maxRpm = 3000,
  isRotating,
  isStale = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (rpm / maxRpm) * 100));

  // Threshold colors: cyan (normal) → amber (elevated) → rose (critical)
  let strokeColor = '#0EA5E9';
  if (percentage > 70) strokeColor = '#D97706';
  if (percentage > 88) strokeColor = '#E11D48';

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // 240 degree gauge arc
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className="relative w-52 h-44 flex items-center justify-center">
        <svg className="w-52 h-52 -rotate-[210deg] transform" viewBox="0 0 200 200" aria-hidden="true">
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="11"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Dynamic active arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={isStale ? '#94A3B8' : strokeColor}
            strokeWidth="11"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            style={{
              filter: isStale ? undefined : `drop-shadow(0 0 6px ${strokeColor}55)`,
            }}
          />
        </svg>

        {/* Center readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-3">
          <div
            className="ev-metric text-3xl font-bold text-slate-900 flex items-baseline"
            aria-live="polite"
            aria-atomic="true"
          >
            {isStale ? '--' : rpm}
            <span className="text-[11px] text-slate-500 font-sans ml-1 font-semibold">RPM</span>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStale ? 'bg-slate-300' : isRotating ? 'bg-emerald-500 signal-live' : 'bg-slate-300'
              }`}
              aria-hidden="true"
            />
            <span className="ev-eyebrow">
              {isStale ? 'No Reading' : isRotating ? 'Motor Spinning' : 'Standstill'}
            </span>
          </div>
        </div>
      </div>

      {/* Scale tick labels */}
      <div className="w-full flex justify-between px-6 text-[10px] font-mono text-slate-400 -mt-1">
        <span>0</span>
        <span>{Math.round(maxRpm * 0.25)}</span>
        <span>{Math.round(maxRpm * 0.5)}</span>
        <span>{Math.round(maxRpm * 0.75)}</span>
        <span>{maxRpm}</span>
      </div>
    </div>
  );
};
