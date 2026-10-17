import React, { useRef } from 'react';
import { ScrollAnimation } from './components/ScrollAnimation';
import { ConnectionStatus } from './components/ConnectionStatus';
import { DashboardNav, NavSection } from './components/DashboardNav';
import { OverviewPage } from './pages/OverviewPage';
import { TemperatureHumidityChart } from './components/TemperatureHumidityChart';
import { AccelerometerChart } from './components/AccelerometerChart';
import { GyroscopeChart } from './components/GyroscopeChart';
import { RpmChart } from './components/RpmChart';
import { ServoAngleChart } from './components/ServoAngleChart';
import { ElectricalMeters } from './components/ElectricalMeters';
import { LogsTab } from './pages/LogsTab';
import { AboutProjectPage } from './pages/AboutProjectPage';
import { CustomCursor } from './components/CustomCursor';
import { MitsLogo } from './components/MitsLogo';
import { AnimatedBackground } from './components/AnimatedBackground';
import { useSensorData } from './hooks/useSensorData';
import { Cpu } from 'lucide-react';

export function App() {
  const [activeSection, setActiveSection] = React.useState<NavSection>('overview');
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  const {
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
  } = useSensorData();

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Premium animated EV dashboard background — sits behind all content */}
      <AnimatedBackground />

      {/* Interactive Glassmorphism Spring Physics Custom Cursor */}
      <CustomCursor />

      {/* 1. Cinematic Scroll-Controlled Opening Animation Section (Preserved Completely) */}
      <ScrollAnimation />

      {/* 2. Main IoT Performance Monitoring Dashboard (Devnio Light Glassmorphism Architecture) */}
      <div id="dashboard" ref={dashboardRef} className="relative z-30 flex-1 flex flex-col">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-8 py-3.5 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
            {/* Title & Branding — crest centered directly above the main title */}
            <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
              <MitsLogo />

              <div className="flex items-center gap-3">
                <div className="relative p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm">
                  <Cpu className="w-5 h-5 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                    IoT-Based Performance Monitoring of Two-Wheeler Electric Vehicles
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                    <span className="text-indigo-700 font-mono font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {dataSource === 'SUPABASE' ? 'Supabase Realtime Stream' : 'ESP32 Wi-Fi HTTP API'}
                    </span>
                    <span>•</span>
                    <span>Live Physical Sensors + Isolated Simulated V/A</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Live Connection Status & Controls with Supabase Switcher */}
            <ConnectionStatus
              status={status}
              statusDetails={statusDetails}
              esp32Url={esp32Url}
              onUpdateUrl={updateBaseUrl}
              isDemoMode={isDemoMode}
              onToggleDemoMode={toggleDemoMode}
              lastUpdateTimestamp={telemetry?.timestamp}
              dataSource={dataSource}
              onToggleDataSource={setDataSource}
              supabaseUrl={supabaseUrl}
              supabaseKey={supabaseKey}
              onSaveSupabaseConfig={saveSupabaseConfig}
            />
          </div>
        </header>

        {/* Dashboard Navigation Bar */}
        <DashboardNav
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          unreadLogsCount={logs.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeSection === 'overview' && (
            <OverviewPage telemetry={telemetry} history={history} />
          )}

          {activeSection === 'temp-humidity' && (
            <div className="space-y-6">
              <TemperatureHumidityChart history={history} />
            </div>
          )}

          {activeSection === 'accelerometer' && (
            <div className="space-y-6">
              <AccelerometerChart history={history} />
            </div>
          )}

          {activeSection === 'gyroscope' && (
            <div className="space-y-6">
              <GyroscopeChart history={history} />
            </div>
          )}

          {activeSection === 'rpm' && (
            <div className="space-y-6">
              <RpmChart
                history={history}
                maxRpmSession={telemetry?.maxRpmSession ?? 0}
              />
            </div>
          )}

          {activeSection === 'servo' && (
            <div className="space-y-6">
              <ServoAngleChart history={history} />
            </div>
          )}

          {activeSection === 'voltage-current' && (
            <div className="space-y-6">
              <ElectricalMeters
                electrical={
                  telemetry?.simulatedElectrical || {
                    voltage_v: 48.0,
                    current_a: 0.0,
                    power_w: 0.0,
                    isSimulated: true,
                  }
                }
              />
            </div>
          )}

          {activeSection === 'logs' && <LogsTab logs={logs as any} onClearLogs={clearLogs} />}

          {activeSection === 'about' && <AboutProjectPage />}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-4 px-4 sm:px-8 text-center text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
          <div>
            <span>IoT-Based Performance Monitoring of Two-Wheeler Electric Vehicles</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-indigo-600 font-semibold">
              {dataSource === 'SUPABASE' ? 'Supabase Realtime Cloud' : 'ESP32 Wi-Fi HTTP API'}
            </span>
            <span>•</span>
            <span>Vite + React + TS</span>
            <span>•</span>
            <span className="text-slate-600 font-medium">Research & Telemetry Lab</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
