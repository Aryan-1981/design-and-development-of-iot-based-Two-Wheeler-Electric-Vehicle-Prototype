import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Database, Settings2, AlertCircle, Cloud, X } from 'lucide-react';
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
  const panelRef = useRef<HTMLFormElement | null>(null);

  // Close the config popover on Escape
  useEffect(() => {
    if (!showConfig) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConfig(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfig]);

  const statusConfig = {
    LIVE: {
      label: dataSource === 'SUPABASE' ? 'Supabase Live' : 'ESP32 Live',
      chipClass: 'ev-chip-ok',
      icon:
        dataSource === 'SUPABASE' ? (
          <Database className="w-3 h-3" aria-hidden="true" />
        ) : (
          <Wifi className="w-3 h-3" aria-hidden="true" />
        ),
    },
    CONNECTING: {
      label: 'Connecting',
      chipClass: 'ev-chip-info',
      icon: <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" />,
    },
    STALE: {
      label: 'Stale Data',
      chipClass: 'ev-chip-warn',
      icon: <AlertCircle className="w-3 h-3" aria-hidden="true" />,
    },
    OFFLINE: {
      label: 'Offline',
      chipClass: 'ev-chip-muted',
      icon: <WifiOff className="w-3 h-3" aria-hidden="true" />,
    },
    ERROR: {
      label: 'Sensor Error',
      chipClass: 'ev-chip-crit',
      icon: <AlertCircle className="w-3 h-3" aria-hidden="true" />,
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
    <div className="relative flex flex-wrap items-center justify-end gap-2 text-xs">
      {/* Data-source switcher */}
      <div
        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100/90 p-0.5"
        role="group"
        aria-label="Telemetry data source"
      >
        <button
          type="button"
          onClick={() => onToggleDataSource('ESP32_WIFI')}
          data-cursor="SWITCH"
          aria-pressed={dataSource === 'ESP32_WIFI'}
          title="Poll the ESP32 directly over local Wi-Fi"
          className={`px-3 py-1.5 rounded-full transition-all text-[11px] font-semibold flex items-center gap-1.5 ${
            dataSource === 'ESP32_WIFI'
              ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
              : 'text-slate-500 hover:text-slate-800 border border-transparent'
          }`}
        >
          <Wifi className="w-3 h-3" aria-hidden="true" />
          <span>Wi-Fi Direct</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleDataSource('SUPABASE')}
          data-cursor="SWITCH"
          aria-pressed={dataSource === 'SUPABASE'}
          title="Stream telemetry from Supabase realtime"
          className={`px-3 py-1.5 rounded-full transition-all text-[11px] font-semibold flex items-center gap-1.5 ${
            dataSource === 'SUPABASE'
              ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
              : 'text-slate-500 hover:text-slate-800 border border-transparent'
          }`}
        >
          <Cloud className="w-3 h-3" aria-hidden="true" />
          <span>Supabase</span>
        </button>
      </div>

      {/* Live status badge */}
      <span
        className={`ev-chip ${statusConfig.chipClass} py-1.5`}
        title={statusDetails || `Telemetry link: ${statusConfig.label}`}
        aria-live="polite"
      >
        {statusConfig.icon}
        {statusConfig.label}
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
      </span>

      {/* Last synchronization time */}
      {lastUpdateTimestamp && (
        <span className="hidden md:inline text-[11px] font-mono text-slate-500">
          Sync{' '}
          <span className="text-slate-800 font-semibold tabular-nums">{lastUpdateTimestamp}</span>
        </span>
      )}

      {/* Demo mode toggle */}
      <button
        type="button"
        onClick={() => onToggleDemoMode(!isDemoMode)}
        data-cursor="TOGGLE"
        aria-pressed={isDemoMode}
        title="Toggle explicitly simulated demo measurements"
        className={`ev-chip py-1.5 cursor-pointer transition-colors ${
          isDemoMode ? 'ev-chip-warn' : 'ev-chip-muted hover:border-slate-300'
        }`}
      >
        {isDemoMode ? 'Demo On' : 'Demo Off'}
      </button>

      {/* Config trigger */}
      <button
        type="button"
        onClick={() => setShowConfig(!showConfig)}
        data-cursor="CONFIG"
        aria-expanded={showConfig}
        aria-haspopup="dialog"
        className="ev-chip ev-chip-info py-1.5 cursor-pointer hover:bg-sky-50"
      >
        <Settings2 className="w-3 h-3" aria-hidden="true" />
        Config
      </button>

      {/* Config dialog */}
      {showConfig && (
        <form
          ref={panelRef}
          onSubmit={handleSave}
          role="dialog"
          aria-label="Data ingestion settings"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(24rem,calc(100vw-2rem))] ev-panel p-5 shadow-pop font-mono text-xs text-slate-800"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-sans font-bold text-slate-900">Data Ingestion Settings</h2>
              <p className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider mt-0.5">
                Dual transport
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              aria-label="Close settings"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* ESP32 Wi-Fi IP */}
          <div className="mt-4">
            <label htmlFor="cfg-esp32-url" className="text-[11px] text-slate-600 block mb-1.5 font-semibold">
              1. Local ESP32 IP (direct Wi-Fi)
            </label>
            <input
              id="cfg-esp32-url"
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://192.168.1.100"
              className="ev-input"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Supabase credentials */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <label htmlFor="cfg-sb-url" className="text-[11px] text-slate-600 block mb-1.5 font-semibold flex items-center gap-1.5">
              <Database className="w-3 h-3 text-sky-600" aria-hidden="true" />
              <span>2. Supabase project URL</span>
            </label>
            <input
              id="cfg-sb-url"
              type="text"
              value={tempSbUrl}
              onChange={(e) => setTempSbUrl(e.target.value)}
              placeholder="https://xxxxxxxx.supabase.co"
              className="ev-input mb-2.5"
              autoComplete="off"
              spellCheck={false}
            />

            <label htmlFor="cfg-sb-key" className="text-[11px] text-slate-600 block mb-1.5 font-semibold">
              Supabase anon / public key
            </label>
            <input
              id="cfg-sb-key"
              type="password"
              value={tempSbKey}
              onChange={(e) => setTempSbKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="ev-input"
              autoComplete="off"
            />
            <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
              Stored in this browser only (localStorage). Never hard-code credentials in the bundle.
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="ev-btn ev-btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="ev-btn ev-btn-primary">
              Save &amp; Connect
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
