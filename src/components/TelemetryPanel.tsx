import React from 'react';
import { LucideIcon, AlertCircle, Inbox } from 'lucide-react';

export type PanelAccent = 'accent' | 'cobalt' | 'ok' | 'warn' | 'crit' | 'violet';

interface TelemetryPanelProps {
  icon: LucideIcon;
  accent?: PanelAccent;
  title: string;
  subtitle?: string;
  /** Right-aligned status chips in the panel header */
  actions?: React.ReactNode;
  /** Optional secondary row (live axis readouts, units) */
  meta?: React.ReactNode;
  /** Renders a centered empty state instead of the chart body */
  isEmpty?: boolean;
  emptyMessage?: string;
  chartHeight?: string;
  className?: string;
  children: React.ReactNode;
}

const ACCENT_MAP: Record<
  PanelAccent,
  { iconBg: string; iconText: string }
> = {
  accent: { iconBg: 'bg-sky-50 border-sky-200', iconText: 'text-sky-600' },
  cobalt: { iconBg: 'bg-blue-50 border-blue-200', iconText: 'text-blue-600' },
  ok: { iconBg: 'bg-emerald-50 border-emerald-200', iconText: 'text-emerald-600' },
  warn: { iconBg: 'bg-amber-50 border-amber-200', iconText: 'text-amber-600' },
  crit: { iconBg: 'bg-rose-50 border-rose-200', iconText: 'text-rose-600' },
  violet: { iconBg: 'bg-violet-50 border-violet-200', iconText: 'text-violet-600' },
};

/**
 * Shared engineering panel used by every live chart section.
 * Header anatomy: sensor icon · title + mono subtitle · status actions
 * Empty / disconnected data renders a labeled state, never a blank plot.
 */
export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  icon: Icon,
  accent = 'accent',
  title,
  subtitle,
  actions,
  meta,
  isEmpty = false,
  emptyMessage = 'Awaiting live sensor data. Connect the ESP32 or Supabase stream to populate this chart.',
  chartHeight = 'h-72',
  className = '',
  children,
}) => {
  const tone = ACCENT_MAP[accent];

  return (
    <section
      data-cursor="TELEMETRY"
      className={`ev-panel ev-panel-in p-5 sm:p-6 flex flex-col ${className}`}
    >
      {/* Panel header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2 rounded-xl border ${tone.iconBg} ${tone.iconText} shrink-0`}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </header>

      {/* Live value strip */}
      {meta && <div className="pt-3">{meta}</div>}

      {/* Chart body or empty state */}
      {isEmpty ? (
        <div
          className={`flex-1 ${chartHeight} mt-4 flex flex-col items-center justify-center text-center px-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60`}
          role="status"
        >
          <Inbox className="w-6 h-6 text-slate-400 mb-2" aria-hidden="true" />
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{emptyMessage}</span>
          </p>
        </div>
      ) : (
        <div className={`w-full ${chartHeight} mt-4`}>{children}</div>
      )}
    </section>
  );
};
