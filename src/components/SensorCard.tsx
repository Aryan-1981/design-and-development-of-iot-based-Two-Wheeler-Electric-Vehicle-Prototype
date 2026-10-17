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
      text: 'text-sky-600',
      border: 'hover:border-sky-300',
      iconBg: 'bg-sky-50 border-sky-200 text-sky-600',
      glow: 'group-hover:bg-sky-50/30',
    },
    emerald: {
      text: 'text-emerald-600',
      border: 'hover:border-emerald-300',
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      glow: 'group-hover:bg-emerald-50/30',
    },
    amber: {
      text: 'text-amber-600',
      border: 'hover:border-amber-300',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
      glow: 'group-hover:bg-amber-50/30',
    },
    rose: {
      text: 'text-rose-600',
      border: 'hover:border-rose-300',
      iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
      glow: 'group-hover:bg-rose-50/30',
    },
    blue: {
      text: 'text-blue-600',
      border: 'hover:border-blue-300',
      iconBg: 'bg-blue-50 border-blue-200 text-blue-600',
      glow: 'group-hover:bg-blue-50/30',
    },
    purple: {
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300',
      iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      glow: 'group-hover:bg-indigo-50/30',
    },
  };

  const statusBadge = {
    normal: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    offline: 'bg-slate-100 border-slate-200 text-slate-500',
  }[status];

  const currentTheme = colorMap[accentColor];

  return (
    <div
      data-cursor="INSPECT"
      className={`group relative rounded-2xl glass-panel glass-panel-hover card-glow p-5 transition-all duration-300 ${currentTheme.border} ${currentTheme.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${currentTheme.iconBg} transition-transform duration-300 group-hover:scale-105 shadow-sm`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 mt-1 inline-block font-medium">
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Status indicator pill */}
        <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-semibold ${statusBadge}`}>
          {statusLabel || status.toUpperCase()}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight font-mono text-slate-900">
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-slate-500 font-mono">{unit}</span>}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 font-sans">{subtitle}</p>}

      {children && <div className="mt-4 pt-3 border-t border-slate-100">{children}</div>}
    </div>
  );
};
