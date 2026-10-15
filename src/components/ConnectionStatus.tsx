import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Cpu, Database, Check, Settings2, AlertCircle } from 'lucide-react';
import { HardwareStatus } from '../types/sensors';

interface ConnectionStatusProps {
  status: HardwareStatus;
  statusDetails: string;
  esp32Url: string;
  onUpdateUrl: (url: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  lastUpdateTimestamp?: string;
  dataSource: 'ESP32_WIFI' | 'SUPABASE';
  onToggleDataSource: (source: 'ESP32_WIFI' | 'SUPABASE') => void;
  supabaseUrl: string;
  supabaseKey: string;
  onSaveSupabaseConfig: (url: string, key: string) => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  statusDetails,
  esp32Url,
  onUpdateUrl,
  isDemoMode,
  onToggleDemoMode,
  lastUpdateTimestamp,
  dataSource,
  onToggleDataSource,
  supabaseUrl,
  supabaseKey,
  onSaveSupabaseConfig,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(esp32Url);
  const [tempSbUrl, setTempSbUrl] = useState(supabaseUrl);
  const [tempSbKey, setTempSbKey] = useState(supabaseKey);

  const statusConfig = {
    LIVE: {
      label: dataSource === 'SUPABASE' ? 'SUPABASE LIVE' : 'ESP32 LIVE',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-glow-green/20',
      icon: dataSource === 'SUPABASE' ? (
        <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
      ) : (
        <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
      ),
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
    if (tempSbUrl && tempSbKey) {
      onSaveSupabaseConfig(tempSbUrl, tempSbKey);
    }
    setShowConfig(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        {/* Source Switcher: Direct Wi-Fi vs Supabase Cloud */}
        <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900/80 p-0.5">
          <button
            onClick={() => onToggleDataSource('ESP32_WIFI')}
            className={`px-2 py-1 rounded-md transition-all ${
              dataSource === 'ESP32_WIFI'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wi-Fi Direct
          </button>
          <button
            onClick={() => onToggleDataSource('SUPABASE')}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
              dataSource === 'SUPABASE'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>Supabase</span>
          </button>
        </div>

        {/* Live Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold transition-all ${statusConfig.badgeClass}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>

        {/* Last Timestamp */}
        {lastUpdateTimestamp && (
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Sync: <span className="text-slate-200">{lastUpdateTimestamp}</span>
          </span>
        )}

        {/* Demo Mode Button */}
        <button
          onClick={() => onToggleDemoMode(!isDemoMode)}
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
            isDemoMode
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Optional Simulated Demo Mode"
        >
          {isDemoMode ? 'DEMO: ON' : 'DEMO: OFF'}
        </button>

        {/* Configuration Modal Trigger */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-[11px] font-mono"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Config</span>
        </button>
      </div>

      {/* Popover Settings Dialog */}
      {showConfig && (
        <form
          onSubmit={handleSave}
          className="absolute right-0 top-10 mt-2 z-50 w-96 bg-slate-900/98 border border-slate-700 p-5 rounded-2xl shadow-2xl backdrop-blur-xl font-mono text-xs text-slate-200"
        >
          <div className="font-bold text-white text-sm pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Data Ingestion Settings</span>
            <span className="text-[10px] text-cyan-400 uppercase font-normal">Dual Transport</span>
          </div>

          {/* Section 1: ESP32 Wi-Fi IP */}
          <div className="mt-3">
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
              1. Local ESP32 IP Address (Direct Wi-Fi):
            </label>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://192.168.1.100"
              className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Section 2: Supabase Credentials */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <label className="text-[11px] text-emerald-400 block mb-1 font-semibold flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>2. Supabase Project URL:</span>
            </label>
            <input
              type="text"
              value={tempSbUrl}
              onChange={(e) => setTempSbUrl(e.target.value)}
              placeholder="https://xxxxxxxx.supabase.co"
              className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-emerald-300 focus:outline-none focus:border-emerald-400 mb-2"
            />

            <label className="text-[11px] text-emerald-400 block mb-1 font-semibold">
              Supabase Anon / Public API Key:
            </label>
            <input
              type="password"
              value={tempSbKey}
              onChange={(e) => setTempSbKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-emerald-300 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-500">Live Realtime Sync</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
