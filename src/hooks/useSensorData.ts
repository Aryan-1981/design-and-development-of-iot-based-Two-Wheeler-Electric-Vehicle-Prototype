import { useState, useEffect } from 'react';
import { UnifiedTelemetry, HardwareStatus, SystemLogEntry } from '../types/sensors';
import { esp32Provider } from '../services/esp32SensorProvider';
import { supabaseProvider } from '../services/supabaseSensorProvider';

const MAX_HISTORY_POINTS = 60;
const MAX_LOG_ENTRIES = 80;

export function useSensorData() {
  const [dataSource, setDataSource] = useState<'ESP32_WIFI' | 'SUPABASE'>('ESP32_WIFI');
  const [telemetry, setTelemetry] = useState<UnifiedTelemetry | null>(null);
  const [history, setHistory] = useState<UnifiedTelemetry[]>([]);
  const [status, setStatus] = useState<HardwareStatus>('CONNECTING');
  const [statusDetails, setStatusDetails] = useState<string>('Initializing sensor provider...');
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);

  // Configuration values
  const [esp32Url, setEsp32Url] = useState<string>(esp32Provider.getBaseUrl());
  const [supabaseUrl, setSupabaseUrl] = useState<string>(
    import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [supabaseKey, setSupabaseKey] = useState<string>(
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  const [isDemoMode, setIsDemoMode] = useState<boolean>(esp32Provider.isDemoMode());

  useEffect(() => {
    let unsubTelemetry: () => void;
    let unsubStatus: () => void;
    let unsubLog: () => void;

    if (dataSource === 'ESP32_WIFI') {
      supabaseProvider.stop();
      esp32Provider.start();

      unsubTelemetry = esp32Provider.onTelemetry((reading) => {
        setTelemetry(reading);
        setHistory((prev) => {
          const next = [...prev, reading];
          return next.length > MAX_HISTORY_POINTS
            ? next.slice(next.length - MAX_HISTORY_POINTS)
            : next;
        });
      });

      unsubStatus = esp32Provider.onStatus((newStatus, details) => {
        setStatus(newStatus);
        if (details) setStatusDetails(details);
      });

      unsubLog = esp32Provider.onLog((entry) => {
        setLogs((prev) => [entry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)]);
      });
    } else {
      esp32Provider.stop();
      supabaseProvider.start();

      unsubTelemetry = supabaseProvider.onTelemetry((reading) => {
        setTelemetry(reading);
        setHistory((prev) => {
          const next = [...prev, reading];
          return next.length > MAX_HISTORY_POINTS
            ? next.slice(next.length - MAX_HISTORY_POINTS)
            : next;
        });
      });

      unsubStatus = supabaseProvider.onStatus((newStatus, details) => {
        setStatus(newStatus);
        if (details) setStatusDetails(details);
      });

      unsubLog = supabaseProvider.onLog((entry) => {
        setLogs((prev) => [entry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)]);
      });
    }

    return () => {
      if (unsubTelemetry) unsubTelemetry();
      if (unsubStatus) unsubStatus();
      if (unsubLog) unsubLog();
    };
  }, [dataSource]);

  const updateBaseUrl = (newUrl: string) => {
    setEsp32Url(newUrl);
    esp32Provider.setBaseUrl(newUrl);
  };

  const saveSupabaseConfig = (url: string, key: string) => {
    setSupabaseUrl(url);
    setSupabaseKey(key);
    supabaseProvider.configure(url, key);
    setDataSource('SUPABASE');
  };

  const toggleDemoMode = (enable: boolean) => {
    setIsDemoMode(enable);
    esp32Provider.setDemoMode(enable);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    dataSource,
    setDataSource,
    telemetry,
    history,
    status,
    statusDetails,
    logs,
    esp32Url,
    supabaseUrl,
    supabaseKey,
    isDemoMode,
    updateBaseUrl,
    saveSupabaseConfig,
    toggleDemoMode,
    clearLogs,
  };
}
