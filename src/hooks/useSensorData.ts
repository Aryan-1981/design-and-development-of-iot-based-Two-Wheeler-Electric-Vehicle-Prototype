import { useState, useEffect, useRef } from 'react';
import { UnifiedTelemetry, HardwareStatus, SystemLogEntry } from '../types/sensors';
import { esp32Provider } from '../services/esp32SensorProvider';

const MAX_HISTORY_POINTS = 60; // Up to ~15 minutes depending on polling rate
const MAX_LOG_ENTRIES = 80;

export function useSensorData() {
  const [telemetry, setTelemetry] = useState<UnifiedTelemetry | null>(null);
  const [history, setHistory] = useState<UnifiedTelemetry[]>([]);
  const [status, setStatus] = useState<HardwareStatus>('CONNECTING');
  const [statusDetails, setStatusDetails] = useState<string>('Initializing sensor provider...');
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [esp32Url, setEsp32Url] = useState<string>(esp32Provider.getBaseUrl());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(esp32Provider.isDemoMode());
  const [pollingMs, setPollingMs] = useState<number>(1000);

  useEffect(() => {
    esp32Provider.start();

    const unsubTelemetry = esp32Provider.onTelemetry((reading) => {
      setTelemetry(reading);
      setHistory((prev) => {
        const next = [...prev, reading];
        return next.length > MAX_HISTORY_POINTS
          ? next.slice(next.length - MAX_HISTORY_POINTS)
          : next;
      });
    });

    const unsubStatus = esp32Provider.onStatus((newStatus, details) => {
      setStatus(newStatus);
      if (details) setStatusDetails(details);
    });

    const unsubLog = esp32Provider.onLog((entry) => {
      setLogs((prev) => [entry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)]);
    });

    return () => {
      unsubTelemetry();
      unsubStatus();
      unsubLog();
      esp32Provider.stop();
    };
  }, []);

  const updateBaseUrl = (newUrl: string) => {
    setEsp32Url(newUrl);
    esp32Provider.setBaseUrl(newUrl);
  };

  const toggleDemoMode = (enable: boolean) => {
    setIsDemoMode(enable);
    esp32Provider.setDemoMode(enable);
  };

  const updatePollingRate = (ms: number) => {
    setPollingMs(ms);
    esp32Provider.setPollingInterval(ms);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    telemetry,
    history,
    status,
    statusDetails,
    logs,
    esp32Url,
    isDemoMode,
    pollingMs,
    updateBaseUrl,
    toggleDemoMode,
    updatePollingRate,
    clearLogs,
  };
}
