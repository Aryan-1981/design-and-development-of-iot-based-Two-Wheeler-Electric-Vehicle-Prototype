import React, { useEffect, useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  AlertCircle,
  FlaskConical,
  Clock,
} from 'lucide-react';
import { HardwareStatus } from '../types/sensors';

interface SystemStatusStripProps {
  status: HardwareStatus;
  statusDetails: string;
  dataSource: 'ESP32_WIFI' | 'SUPABASE';
  isDemoMode: boolean;
  lastUpdateMs?: number;
}

function formatAge(ms: number): string {
  if (ms < 1000) return 'just now';
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  return `${Math.round(ms / 3_600_000)}h ago`;
}

const STATUS_PRESENTATION: Record<
  HardwareStatus,
  { label: string; chip: string; icon: React.ElementType }
> = {
  LIVE: { label: 'Link Live', chip: 'ev-chip-ok', icon: Database },
  CONNECTING: { label: 'Connecting', chip: 'ev-chip-info', icon: RefreshCw },
  STALE: { label: 'Stale Data', chip: 'ev-chip-warn', icon: AlertCircle },
  OFFLINE: { label: 'Offline', chip: 'ev-chip-muted', icon: WifiOff },
  ERROR: { label: 'Error', chip: 'ev-chip-crit', icon: AlertCircle },
};

/**
 * Compact engineering strip answering, in order:
 * is the link up? · where is data from? · how fresh is the last packet?
 */
export const SystemStatusStrip: React.FC<SystemStatusStripProps> = ({
  status,
  statusDetails,
  dataSource,
  isDemoMode,
  lastUpdateMs,
}) => {
  // Tick once per second so packet age stays honest without re-rendering
  // the whole dashboard (this component owns its own clock).
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const presentation = STATUS_PRESENTATION[status];
  const StatusIcon = presentation.icon;
  const age = lastUpdateMs ? now - lastUpdateMs : null;
  const isStale = age !== null && age > 8000;

  return (
    <section
      className="ev-panel ev-panel-in px-4 sm:px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-2"
      aria-label="System connectivity status"
    >
      {/* Link state */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border ${presentation.chip} shrink-0`}
          aria-hidden="true"
        >
          <StatusIcon className={`w-4 h-4 ${status === 'CONNECTING' ? 'animate-spin' : ''}`} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{presentation.label}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'LIVE'
                  ? 'bg-emerald-500 signal-live'
                  : status === 'CONNECTING'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-slate-300'
              }`}
              aria-hidden="true"
            />
          </div>
          <p
            className="text-[11px] font-mono text-slate-500 truncate max-w-[22rem]"
            title={statusDetails}
          >
            {statusDetails}
          </p>
        </div>
      </div>

      <div className="h-8 w-px bg-slate-200 hidden md:block" aria-hidden="true" />

      {/* Data source */}
      <div className="flex items-center gap-2">
        <span className="ev-eyebrow">Source</span>
        <span className="ev-chip ev-chip-accent">
          {dataSource === 'SUPABASE' ? (
            <>
              <Database className="w-3 h-3" aria-hidden="true" />
              Supabase Realtime
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3" aria-hidden="true" />
              ESP32 Wi-Fi HTTP
            </>
          )}
        </span>
      </div>

      {/* Packet freshness */}
      <div className="flex items-center gap-2">
        <span className="ev-eyebrow">Last packet</span>
        <span className={`ev-chip ${isStale || age === null ? 'ev-chip-warn' : 'ev-chip-ok'}`}>
          <Clock className="w-3 h-3" aria-hidden="true" />
          {age === null ? 'No data yet' : formatAge(age)}
        </span>
      </div>

      {/* Demo mode is always explicitly surfaced */}
      {isDemoMode && (
        <span className="ev-chip ev-chip-warn" title="Demo mode generates simulated measurements">
          <FlaskConical className="w-3 h-3" aria-hidden="true" />
          Demo Measurements Active
        </span>
      )}
    </section>
  );
};
