import React from 'react';
import { LucideIcon } from 'lucide-react';
import { SensorStatus } from '../types/sensor';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  status?: SensorStatus | 'idle';
  statusLabel?: string;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  children?: React.ReactNode;
  badge?: string;
}

const ACCENT_MAP = {
  cyan: {
    iconBg: 'bg-sky-50 border-sky-200 text-sky-600',
    hover: 'hover:border-sky-300',
  },
  emerald: {
    iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    hover: 'hover:border-emerald-300',
  },
  amber: {
    iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
    hover: 'hover:border-amber-300',
  },
  rose: {
    iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
    hover: 'hover:border-rose-300',
  },
  blue: {
    iconBg: 'bg-blue-50 border-blue-200 text-blue-600',
    hover: 'hover:border-blue-300',
  },
  purple: {
    iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    hover: 'hover:border-indigo-300',
  },
} as const;

const STATUS_CHIP: Record<SensorStatus | 'idle', string> = {
  normal: 'ev-chip-ok',
  warning: 'ev-chip-warn',
  error: 'ev-chip-crit',
  offline: 'ev-chip-muted',
  idle: 'ev-chip-muted',
};

/**
 * Primary KPI card. Value + unit dominate; metadata explains provenance
 * (GPIO, interface, freshness) without competing with the reading.
 */
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
  const accent = ACCENT_MAP[accentColor];

  return (
    <article
      data-cursor="INSPECT"
      className={`ev-panel ev-panel-hover ev-panel-in group relative p-5 flex flex-col ${accent.hover}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-xl border ${accent.iconBg} shrink-0`}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </h3>
            {badge && <span className="ev-eyebrow inline-block mt-1">{badge}</span>}
          </div>
        </div>

        <span className={`ev-chip ${STATUS_CHIP[status]} shrink-0`} title={`Sensor state: ${statusLabel || status}`}>
          {statusLabel || status}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2" aria-live="polite" aria-atomic="true">
        <span className="ev-metric text-[2rem] leading-none font-bold">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{subtitle}</p>}

      {children && <div className="mt-4 pt-3 border-t border-slate-100">{children}</div>}
    </article>
  );
};
