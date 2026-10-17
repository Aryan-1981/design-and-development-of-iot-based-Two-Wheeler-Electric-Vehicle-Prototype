import { useState, useEffect } from 'react';
import { UnifiedTelemetry, HardwareStatus, SystemLogEntry } from '../types/sensors';
import { esp32Provider } from '../services/esp32SensorProvider';
import { supabaseProvider } from '../services/supabaseSensorProvider';
import { defaultSupabaseUrl, defaultSupabaseAnonKey } from '../services/supabaseClient';

const MAX_HISTORY_POINTS = 60;
const MAX_LOG_ENTRIES = 80;

export function useSensorData() {
  // Check if user previously saved a data source preference or if Supabase credentials exist
  const getInitialDataSource = (): 'ESP32_WIFI' | 'SUPABASE' => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ev_data_source');
      if (saved === 'ESP32_WIFI' || saved === 'SUPABASE') {
        return saved;
      }
    }
    // Default to SUPABASE if Supabase URL is available or in production cloud deployment
    if (defaultSupabaseUrl || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
      return 'SUPABASE';
    }
    return 'ESP32_WIFI';
  };

  const [dataSource, setDataSourceState] = useState<'ESP32_WIFI' | 'SUPABASE'>(getInitialDataSource);
  const [telemetry, setTelemetry] = useState<UnifiedTelemetry | null>(null);
  const [history, setHistory] = useState<UnifiedTelemetry[]>([]);
  const [status, setStatus] = useState<HardwareStatus>('CONNECTING');
  const [statusDetails, setStatusDetails] = useState<string>('Initializing sensor provider...');
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);

  // Configuration values
  const [esp32Url, setEsp32Url] = useState<string>(esp32Provider.getBaseUrl());
  const [supabaseUrl, setSupabaseUrl] = useState<string>(defaultSupabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState<string>(defaultSupabaseAnonKey);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(esp32Provider.isDemoMode());

  const setDataSource = (source: 'ESP32_WIFI' | 'SUPABASE') => {
    setDataSourceState(source);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ev_data_source', source);
    }
  };

  useEffect(() => {
    let unsubTelemetry: () => void;
    let unsubHistory: (() => void) | undefined;
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

      unsubHistory = supabaseProvider.onHistory((initialHistory) => {
        if (initialHistory && initialHistory.length > 0) {
          setHistory(initialHistory.slice(-MAX_HISTORY_POINTS));
        }
      });

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
      if (unsubHistory) unsubHistory();
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

