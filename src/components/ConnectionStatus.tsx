import React from 'react';
import { Wifi, WifiOff, RefreshCw, Cpu, Activity, AlertCircle, ShieldCheck } from 'lucide-react';
import { HardwareStatus } from '../types/sensors';

interface ConnectionStatusProps {
  status: HardwareStatus;
  statusDetails: string;
  esp32Url: string;
  onUpdateUrl: (url: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  lastUpdateTimestamp?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  statusDetails,
  esp32Url,
  onUpdateUrl,
  isDemoMode,
  onToggleDemoMode,
  lastUpdateTimestamp,
}) => {
  const [showConfig, setShowConfig] = React.useState(false);
  const [tempUrl, setTempUrl] = React.useState(esp32Url);

  const statusConfig = {
    LIVE: {
      label: 'ESP32 LIVE',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-glow-green/20',
      icon: <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />,
    },
    CONNECTING: {
      label: 'CONNECTING',
      badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
      icon: <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
    },
    STALE: {
      label: 'STALE DATA',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />,
    },
    OFFLINE: {
      label: 'OFFLINE',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
      icon: <WifiOff className="w-3.5 h-3.5 text-rose-400" />,
    },
    ERROR: {
      label: 'SENSOR ERROR',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
    },
  }[status];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUrl(tempUrl);
    setShowConfig(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold transition-all ${statusConfig.badgeClass}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>

        {/* Timestamp */}
        {lastUpdateTimestamp && (
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Sync: <span className="text-slate-200">{lastUpdateTimestamp}</span>
          </span>
        )}

        {/* Demo Mode Toggle */}
        <button
          onClick={() => onToggleDemoMode(!isDemoMode)}
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
            isDemoMode
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Optional Simulated Demo Mode"
        >
          {isDemoMode ? 'DEMO MODE: ON' : 'DEMO MODE: OFF'}
        </button>

        {/* IP Config Toggle */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-[11px] font-mono"
        >
          Config IP
        </button>
      </div>

      {/* Popover IP Config Dialog */}
      {showConfig && (
        <form
          onSubmit={handleSave}
          className="absolute right-0 top-10 mt-2 z-50 w-80 bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs text-slate-200"
        >
          <div className="font-bold text-white mb-1">ESP32 Wi-Fi Target Endpoint</div>
          <p className="text-[11px] text-slate-400 mb-3">
            Enter the local IP address printed in your ESP32 Serial Monitor:
          </p>

          <input
            type="text"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="http://192.168.1.100"
            className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-400 mb-3"
          />

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500">Port 80 HTTP API</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
