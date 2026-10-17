import React, { useRef } from 'react';
import { ScrollAnimation } from './components/ScrollAnimation';
import { ConnectionStatus } from './components/ConnectionStatus';
import { DashboardNav, NavSection } from './components/DashboardNav';
import { OverviewPage } from './pages/OverviewPage';
import { TemperatureHumidityChart } from './components/TemperatureHumidityChart';
import { MpuTempChart } from './components/MpuTempChart';
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
    <div className="min-h-screen text-slate-900 flex flex-col font-sans">
      {/* Ambient dashboard background — sits behind all content */}
      <AnimatedBackground />

      {/* Spring-physics custom cursor (fine-pointer devices only) */}
      <CustomCursor />

      {/* 1. Scroll-controlled motorcycle frame animation (preserved) */}
      <ScrollAnimation />

      {/* 2. Live IoT performance-monitoring dashboard */}
      <div id="dashboard" ref={dashboardRef} className="relative z-30 flex-1 flex flex-col">
        {/* Dashboard header — identity + telemetry link controls */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
            {/* Identity: crest + title + verified hardware stack */}
            <div className="flex items-center gap-3 min-w-0">
              <MitsLogo />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
                  IoT-Based Performance Monitoring of Two-Wheeler Electric Vehicles
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700">
                    <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                    MITS Gwalior · ESP32 Prototype
                  </span>
                  <span className="text-slate-300" aria-hidden="true">/</span>
                  <span className="font-mono">
                    {dataSource === 'SUPABASE' ? 'Supabase realtime stream' : 'ESP32 Wi-Fi HTTP API'}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">/</span>
                  <span className="font-mono">
                    Live sensors + simulated V·A
                  </span>
                </p>
              </div>
            </div>

            {/* Link status, source switch, demo mode, configuration */}
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

        {/* Section navigation (sticky) */}
        <DashboardNav
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          unreadLogsCount={logs.length}
        />

        {/* Section content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeSection === 'overview' && (
            <OverviewPage
              telemetry={telemetry}
              history={history}
              status={status}
              statusDetails={statusDetails}
              dataSource={dataSource}
              isDemoMode={isDemoMode}
            />
          )}

          {activeSection === 'temp-humidity' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
              <TemperatureHumidityChart history={history} />
              <MpuTempChart history={history} />
            </div>
          )}

          {activeSection === 'accelerometer' && (
            <AccelerometerChart history={history} />
          )}

          {activeSection === 'gyroscope' && (
            <GyroscopeChart history={history} />
          )}

          {activeSection === 'rpm' && (
            <RpmChart history={history} maxRpmSession={telemetry?.maxRpmSession ?? 0} />
          )}

          {activeSection === 'servo' && (
            <ServoAngleChart history={history} />
          )}

          {activeSection === 'voltage-current' && (
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
          )}

          {activeSection === 'logs' && <LogsTab logs={logs} onClearLogs={clearLogs} />}

          {activeSection === 'about' && <AboutProjectPage />}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white/85 backdrop-blur-md py-4 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
            <span>IoT-Based Performance Monitoring of Two-Wheeler Electric Vehicles</span>
            <div className="flex items-center gap-3">
              <span className="text-sky-700 font-semibold">
                {dataSource === 'SUPABASE' ? 'Supabase Realtime Cloud' : 'ESP32 Wi-Fi HTTP API'}
              </span>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <span>Vite + React + TS</span>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <span>MITS Gwalior</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
