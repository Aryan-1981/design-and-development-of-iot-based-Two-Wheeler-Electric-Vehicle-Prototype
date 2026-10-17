import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Database, Settings2, AlertCircle } from 'lucide-react';
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
  statusDetails: _statusDetails,
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
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm',
      icon: dataSource === 'SUPABASE' ? (
        <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
      ) : (
        <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
      ),
    },
    CONNECTING: {
      label: 'CONNECTING',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />,
    },
    STALE: {
      label: 'STALE DATA',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />,
    },
    OFFLINE: {
      label: 'OFFLINE',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
      icon: <WifiOff className="w-3.5 h-3.5 text-slate-500" />,
    },
    ERROR: {
      label: 'SENSOR ERROR',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
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
        <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-100/90 p-0.5 shadow-sm">
          <button
            onClick={() => onToggleDataSource('ESP32_WIFI')}
            data-cursor="SWITCH"
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
              dataSource === 'ESP32_WIFI'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wi-Fi Direct
          </button>
          <button
            onClick={() => onToggleDataSource('SUPABASE')}
            data-cursor="SWITCH"
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-semibold ${
              dataSource === 'SUPABASE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>Supabase</span>
          </button>
        </div>

        {/* Live Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-bold transition-all ${statusConfig.badgeClass}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>

        {/* Last Timestamp */}
        {lastUpdateTimestamp && (
          <span className="hidden sm:inline text-slate-500 text-[11px] font-medium">
            Sync: <span className="text-slate-800 font-semibold">{lastUpdateTimestamp}</span>
          </span>
        )}

        {/* Demo Mode Button */}
        <button
          onClick={() => onToggleDemoMode(!isDemoMode)}
          data-cursor="TOGGLE"
          className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono font-semibold transition-all shadow-sm ${
            isDemoMode
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          title="Toggle Optional Simulated Demo Mode"
        >
          {isDemoMode ? 'DEMO: ON' : 'DEMO: OFF'}
        </button>

        {/* Configuration Modal Trigger */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          data-cursor="CONFIG"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-[11px] font-mono font-semibold shadow-sm transition-all"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Config</span>
        </button>
      </div>

      {/* Popover Settings Dialog */}
      {showConfig && (
        <form
          onSubmit={handleSave}
          className="absolute right-0 top-11 mt-2 z-50 w-96 bg-white/95 border border-slate-200 p-5 rounded-2xl shadow-2xl backdrop-blur-xl font-mono text-xs text-slate-800"
        >
          <div className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center justify-between">
            <span>Data Ingestion Settings</span>
            <span className="text-[10px] text-indigo-600 font-bold uppercase">Dual Transport</span>
          </div>

          {/* Section 1: ESP32 Wi-Fi IP */}
          <div className="mt-3">
            <label className="text-[11px] text-slate-600 block mb-1 font-semibold">
              1. Local ESP32 IP Address (Direct Wi-Fi):
            </label>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://192.168.1.100"
              className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Section 2: Supabase Credentials */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <label className="text-[11px] text-indigo-700 block mb-1 font-semibold flex items-center gap-1">
              <Database className="w-3 h-3 text-indigo-600" />
              <span>2. Supabase Project URL:</span>
            </label>
            <input
              type="text"
              value={tempSbUrl}
              onChange={(e) => setTempSbUrl(e.target.value)}
              placeholder="https://xxxxxxxx.supabase.co"
              className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white mb-2"
            />

            <label className="text-[11px] text-indigo-700 block mb-1 font-semibold">
              Supabase Anon / Public API Key:
            </label>
            <input
              type="password"
              value={tempSbKey}
              onChange={(e) => setTempSbKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium">Live Realtime Sync</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
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
