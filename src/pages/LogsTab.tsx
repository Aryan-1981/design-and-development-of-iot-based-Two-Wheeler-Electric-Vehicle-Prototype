import React, { useState } from 'react';
import { SystemLogEntry } from '../types/sensor';
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

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterCategory !== 'ALL' && log.category !== filterCategory) return false;
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    return true;
  });

  const levelIcon = {
    INFO: <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
    SUCCESS: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    WARN: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
    ERROR: <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
  };

  const levelBadge = {
    INFO: 'bg-sky-950/80 text-sky-300 border-sky-800',
    SUCCESS: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    WARN: 'bg-amber-950/80 text-amber-300 border-amber-800',
    ERROR: 'bg-rose-950/80 text-rose-300 border-rose-800',
  };

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ev-telemetry-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            Diagnostic System Event Console
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Real-time audit log of hardware interrupts, sensor updates, and connectivity events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            data-cursor="FILTER"
            className="bg-white border border-slate-200 text-xs font-mono text-slate-700 font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="ALL">All Categories</option>
            <option value="SYSTEM">System</option>
            <option value="RPM">RPM Sensor</option>
            <option value="SERVO">Servo Actuator</option>
            <option value="DHT11">DHT11 Climatic</option>
            <option value="MPU6050">MPU6050 Motion</option>
            <option value="CONNECTIVITY">Connectivity</option>
          </select>

          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            data-cursor="FILTER"
            className="bg-white border border-slate-200 text-xs font-mono text-slate-700 font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Success</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportLogsAsJson}
            title="Export JSON"
            data-cursor="EXPORT"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-mono text-slate-700 font-medium shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            data-cursor="CLEAR"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-mono text-rose-700 font-semibold shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Console</span>
          </button>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B0F19] p-5 font-mono text-xs overflow-hidden shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-slate-300 font-medium">telemetry-stdout // ESP32 FreeRTOS Kernel</span>
          </div>
          <div>Total entries: {filteredLogs.length}</div>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No log messages matching filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              >
                <div className="mt-0.5">{levelIcon[log.level]}</div>
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                    levelBadge[log.level]
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
