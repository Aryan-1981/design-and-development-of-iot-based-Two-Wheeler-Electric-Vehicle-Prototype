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
  let strokeColor = '#4f46e5'; // electric indigo
  if (percentage > 70) strokeColor = '#d97706'; // warm amber
  if (percentage > 88) strokeColor = '#e11d48'; // vibrant rose

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
            stroke="#e2e8f0"
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
              filter: `drop-shadow(0 0 6px ${strokeColor}44)`,
            }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-3">
          <div className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 flex items-baseline">
            {rpm}
            <span className="text-xs text-slate-500 font-sans ml-1 font-semibold">RPM</span>
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isRotating ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'
              }`}
            />
            <span className="text-[11px] font-mono font-medium text-slate-600">
              {isRotating ? 'MOTOR SPINNING' : 'STANDSTILL'}
            </span>
          </div>

          <div className="text-[10px] font-mono text-slate-400 mt-1 font-medium">
            PEAK SCALE: {maxRpm} RPM
          </div>
        </div>
      </div>

      {/* Scale tick labels */}
      <div className="w-full flex justify-between px-6 text-[10px] font-mono text-slate-400 -mt-2 font-medium">
        <span>0</span>
        <span>{Math.round(maxRpm * 0.25)}</span>
        <span>{Math.round(maxRpm * 0.5)}</span>
        <span>{Math.round(maxRpm * 0.75)}</span>
        <span>{maxRpm}</span>
      </div>
    </div>
  );
};
