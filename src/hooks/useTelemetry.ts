import { useState, useEffect, useRef } from 'react';
import { TelemetryReading, SystemLogEntry } from '../types/sensor';
import { getSensorProvider } from '../services/providerFactory';

const MAX_HISTORY_POINTS = 40;
const MAX_LOGS = 60;

export function useTelemetry() {
  const provider = useRef(getSensorProvider()).current;
  const [currentReading, setCurrentReading] = useState<TelemetryReading | null>(null);
  const [history, setHistory] = useState<TelemetryReading[]>([]);
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [samplingRate, setSamplingRate] = useState<number>(1000);
  const [pulsesPerRev, setPulsesPerRev] = useState<number>(2);

  useEffect(() => {
    // Connect to sensor stream
    provider.connect();

    // Telemetry handler with bounded history buffer to prevent memory leaks
    const unsubTelemetry = provider.onTelemetry((reading) => {
      setCurrentReading(reading);
      setHistory((prev) => {
        const next = [...prev, reading];
        if (next.length > MAX_HISTORY_POINTS) {
          return next.slice(next.length - MAX_HISTORY_POINTS);
        }
        return next;
      });
    });

    // System logs handler
    const unsubLogs = provider.onLog((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, MAX_LOGS - 1)]);
    });

    // Status handler
    const unsubStatus = provider.onStatusChange((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubTelemetry();
      unsubLogs();
      unsubStatus();
      provider.disconnect();
    };
  }, [provider]);

  const commandServo = async (angle: number) => {
    return provider.commandServoAngle(angle);
  };

  const updatePulsesPerRev = (pulses: number) => {
    setPulsesPerRev(pulses);
    provider.setPulsesPerRev(pulses);
  };

  const updateSamplingRate = (ms: number) => {
    setSamplingRate(ms);
    provider.setInterval(ms);
  };

  const toggleConnection = () => {
    provider.toggleSimulatedDisconnect();
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    currentReading,
    history,
    logs,
    isOnline,
    samplingRate,
    pulsesPerRev,
    commandServo,
    updatePulsesPerRev,
    updateSamplingRate,
    toggleConnection,
    clearLogs,
    providerType: provider.getProviderType(),
  };
}
