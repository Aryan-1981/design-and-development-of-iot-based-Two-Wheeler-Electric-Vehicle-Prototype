import React from 'react';

interface RpmGaugeProps {
  rpm: number;
  maxRpm?: number;
  isRotating: boolean;
}

export const RpmGauge: React.FC<RpmGaugeProps> = ({ rpm, maxRpm = 3000, isRotating }) => {
  const percentage = Math.min(100, Math.max(0, (rpm / maxRpm) * 100));
  // 240 degree gauge arc (-120 to +120)
  const angle = (percentage / 100) * 240 - 120;

  // Determine color based on threshold
  let strokeColor = '#06b6d4'; // cyan
  if (percentage > 70) strokeColor = '#f59e0b'; // amber
  if (percentage > 88) strokeColor = '#f43f5e'; // rose

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // Arc is 240/360 = 2/3 of circle
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="relative w-52 h-44 flex items-center justify-center">
        <svg className="w-52 h-52 -rotate-[210deg] transform" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Dynamic Active Gauge Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${strokeColor}88)`,
            }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-3">
          <div className="text-3xl font-extrabold font-mono tracking-tight text-white flex items-baseline">
            {rpm}
            <span className="text-xs text-slate-400 font-sans ml-1">RPM</span>
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isRotating ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-400">
              {isRotating ? 'MOTOR SPINNING' : 'STANDSTILL'}
            </span>
          </div>

          <div className="text-[10px] font-mono text-slate-400 mt-1">
            PEAK SCALE: {maxRpm} RPM
          </div>
        </div>
      </div>

      {/* Scale tick labels */}
      <div className="w-full flex justify-between px-6 text-[10px] font-mono text-slate-400 -mt-2">
        <span>0</span>
        <span>{Math.round(maxRpm * 0.25)}</span>
        <span>{Math.round(maxRpm * 0.5)}</span>
        <span>{Math.round(maxRpm * 0.75)}</span>
        <span>{maxRpm}</span>
      </div>
    </div>
  );
};
