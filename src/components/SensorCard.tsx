import React from 'react';
import { LucideIcon } from 'lucide-react';
import { SensorStatus } from '../types/sensor';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  status?: SensorStatus;
  statusLabel?: string;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  children?: React.ReactNode;
  badge?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  status = 'normal',
  statusLabel,
  accentColor = 'cyan',
  children,
  badge,
}) => {
  const colorMap = {
    cyan: {
      text: 'text-cyan-400',
      border: 'hover:border-cyan-500/40',
      bgGlow: 'group-hover:bg-cyan-500/5',
      iconBg: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400',
    },
    emerald: {
      text: 'text-emerald-400',
      border: 'hover:border-emerald-500/40',
      bgGlow: 'group-hover:bg-emerald-500/5',
      iconBg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400',
    },
    amber: {
      text: 'text-amber-400',
      border: 'hover:border-amber-500/40',
      bgGlow: 'group-hover:bg-amber-500/5',
      iconBg: 'bg-amber-950/60 border-amber-500/30 text-amber-400',
    },
    rose: {
      text: 'text-rose-400',
      border: 'hover:border-rose-500/40',
      bgGlow: 'group-hover:bg-rose-500/5',
      iconBg: 'bg-rose-950/60 border-rose-500/30 text-rose-400',
    },
    blue: {
      text: 'text-blue-400',
      border: 'hover:border-blue-500/40',
      bgGlow: 'group-hover:bg-blue-500/5',
      iconBg: 'bg-blue-950/60 border-blue-500/30 text-blue-400',
    },
    purple: {
      text: 'text-purple-400',
      border: 'hover:border-purple-500/40',
      bgGlow: 'group-hover:bg-purple-500/5',
      iconBg: 'bg-purple-950/60 border-purple-500/30 text-purple-400',
    },
  };

  const statusBadge = {
    normal: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
    warning: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
    error: 'bg-rose-950/60 border-rose-500/30 text-rose-300',
    offline: 'bg-slate-800/80 border-slate-700 text-slate-400',
  }[status];

  const currentTheme = colorMap[accentColor];

  return (
    <div
      className={`group relative rounded-2xl glass-panel p-5 transition-all duration-300 ${currentTheme.border} ${currentTheme.bgGlow}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${currentTheme.iconBg} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 mt-1 inline-block">
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Status indicator pill */}
        <div className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-medium ${statusBadge}`}>
          {statusLabel || status.toUpperCase()}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight font-mono text-white">
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-slate-400 font-mono">{unit}</span>}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400 font-sans">{subtitle}</p>}

      {children && <div className="mt-4 pt-3 border-t border-slate-800/60">{children}</div>}
    </div>
  );
};
