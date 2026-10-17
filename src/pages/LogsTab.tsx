import React, { useState } from 'react';
import { SystemLogEntry } from '../types/sensors';
import {
  Terminal,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Download,
} from 'lucide-react';

interface LogsTabProps {
  logs: SystemLogEntry[];
  onClearLogs: () => void;
}

const LEVEL_ICON: Record<SystemLogEntry['level'], React.ReactNode> = {
  INFO: <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />,
  SUCCESS: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />,
  WARN: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />,
  ERROR: <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />,
};

const LEVEL_BADGE: Record<SystemLogEntry['level'], string> = {
  INFO: 'bg-sky-950/80 text-sky-300 border-sky-800',
  SUCCESS: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
  WARN: 'bg-amber-950/80 text-amber-300 border-amber-800',
  ERROR: 'bg-rose-950/80 text-rose-300 border-rose-800',
};

/** Categories match SystemLogEntry['category'] from types/sensors.ts */
const CATEGORIES: SystemLogEntry['category'][] = [
  'SYSTEM',
  'NETWORK',
  'RPM',
  'DHT11',
  'MPU6050',
  'SERVO',
];

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterCategory !== 'ALL' && log.category !== filterCategory) return false;
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    return true;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ev-telemetry-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const selectClass =
    'bg-white border border-slate-200 text-xs font-mono text-slate-700 font-medium rounded-control px-3 py-1.5 focus:outline-none focus:border-sky-500 shadow-sm cursor-pointer';

  return (
    <div className="space-y-5">
      {/* Console header & filters */}
      <div className="ev-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-600" aria-hidden="true" />
            Diagnostic System Event Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hardware interrupts, sensor updates, and connectivity events from the live session
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="sr-only" htmlFor="log-category-filter">
            Filter by category
          </label>
          <select
            id="log-category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            data-cursor="FILTER"
            className={selectClass}
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="log-level-filter">
            Filter by severity
          </label>
          <select
            id="log-level-filter"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            data-cursor="FILTER"
            className={selectClass}
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Success</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
          </select>

          <button
            type="button"
            onClick={exportLogsAsJson}
            title="Export logs as JSON"
            data-cursor="EXPORT"
            className="ev-btn ev-btn-ghost"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            data-cursor="CLEAR"
            className="ev-btn ev-btn-danger"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear Console</span>
          </button>
        </div>
      </div>

      {/* Terminal console surface */}
      <div className="rounded-card border border-slate-800 bg-[#0B1220] p-5 font-mono text-xs overflow-hidden shadow-panel">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" aria-hidden="true" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" aria-hidden="true" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" aria-hidden="true" />
            <span className="ml-2 text-slate-300 font-medium">telemetry-stdout // ESP32 session log</span>
          </div>
          <div className="tabular-nums">{filteredLogs.length} entries</div>
        </div>

        <div
          className="space-y-2 max-h-[460px] overflow-y-auto pr-2"
          role="log"
          aria-live="polite"
          aria-label="System event log"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center py-14 text-slate-500">
              <p>No log messages match the current filters.</p>
              <p className="mt-1 text-[11px] text-slate-600">
                Events appear here as the telemetry link reports status changes.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-colors"
              >
                <div className="mt-0.5">{LEVEL_ICON[log.level]}</div>
                <span className="text-slate-500 shrink-0 tabular-nums">[{log.timestamp}]</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                    LEVEL_BADGE[log.level]
                  }`}
                >
                  {log.category}
                </span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
