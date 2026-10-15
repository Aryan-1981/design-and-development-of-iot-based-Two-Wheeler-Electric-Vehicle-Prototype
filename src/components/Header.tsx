import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cpu, RefreshCw, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { TelemetryReading } from '../types/sensor';

interface HeaderProps {
  currentReading: TelemetryReading | null;
  isOnline: boolean;
  onToggleConnection: () => void;
  onReplayIntro: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentReading,
  isOnline,
  onToggleConnection,
  onReplayIntro,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const health = currentReading?.systemHealth || (isOnline ? 'OPTIMAL' : 'OFFLINE');

  return (
    <header className="sticky top-0 z-40 bg-[#080d1a]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Project Title and Branding */}
        <div className="flex items-center gap-3.5">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 shadow-glow-cyan/20">
            <Cpu className="w-6 h-6 animate-pulse-subtle" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#080d1a]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
                Design & Development of IoT-Based Two-Wheeler Electric Vehicle Prototype
              </h1>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                ESP32 Node
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="text-cyan-400 font-mono font-medium">Research & Telemetry Lab</span>
              <span>•</span>
              <span className="text-slate-400">Performance Monitoring System</span>
            </p>
          </div>
        </div>

        {/* Status Indicators, Clocks, & Interactive Quick-Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* DEMO MODE Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>DEMO MODE</span>
          </div>

          {/* System Health Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-medium ${
              health === 'OPTIMAL'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : health === 'DEGRADED'
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            {health === 'OPTIMAL' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{health}</span>
          </div>

          {/* ESP32 Hardware Connection Toggle button */}
          <button
            onClick={onToggleConnection}
            title={isOnline ? 'Simulate Connection Drop' : 'Simulate Reconnect'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200 ${
              isOnline
                ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 hover:bg-slate-800 hover:border-cyan-400 shadow-sm'
                : 'bg-rose-950/50 border-rose-500/50 text-rose-300 hover:bg-rose-900/50'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>ESP32 ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>ESP32 OFFLINE</span>
              </>
            )}
          </button>

          {/* Intro Replay Button */}
          <button
            onClick={onReplayIntro}
            title="Replay Video Intro"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Intro Animation</span>
          </button>

          {/* Real-time Clock */}
          <div className="flex flex-col items-end pl-2 border-l border-slate-800 text-xs font-mono">
            <span className="text-white font-bold tracking-wider">{time}</span>
            <span className="text-slate-400 text-[10px]">{date}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
