import React, { useRef } from 'react';
import { ScrollAnimation } from './components/ScrollAnimation';
import { ConnectionStatus } from './components/ConnectionStatus';
import { DashboardNav, NavSection } from './components/DashboardNav';
import { OverviewPage } from './pages/OverviewPage';
import { TemperatureHumidityChart } from './components/TemperatureHumidityChart';
import { AccelerometerChart } from './components/AccelerometerChart';
import { GyroscopeChart } from './components/GyroscopeChart';
import { MpuTempChart } from './components/MpuTempChart';
import { RpmChart } from './components/RpmChart';
import { ServoAngleChart } from './components/ServoAngleChart';
import { ElectricalMeters } from './components/ElectricalMeters';
import { LogsTab } from './pages/LogsTab';
import { AboutProjectPage } from './pages/AboutProjectPage';
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
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Cinematic Scroll-Controlled Opening Animation Section */}
      <ScrollAnimation />

      {/* 2. Main IoT Performance Monitoring Dashboard */}
      <div id="dashboard" ref={dashboardRef} className="relative z-30 flex-1 flex flex-col">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-40 bg-[#080d1a]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Title & Branding */}
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 shadow-glow-cyan/20">
                <Cpu className="w-5 h-5 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#080d1a]" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">
                  Design and Development of IoT-Based Two-Wheeler Electric Vehicle Prototype for
                  Performance Monitoring
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span className="text-cyan-400 font-mono font-medium">
                    {dataSource === 'SUPABASE' ? 'Supabase Realtime Stream' : 'ESP32 Wi-Fi HTTP API'}
                  </span>
                  <span>•</span>
                  <span>Real Hardware Sensors + Isolated Simulated V/A</span>
                </p>
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
        <footer className="mt-auto border-t border-slate-800/80 bg-[#060a14] py-4 px-4 sm:px-8 text-center text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Design and Development of IoT-Based Two-Wheeler Electric Vehicle Prototype</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400">
              {dataSource === 'SUPABASE' ? 'Supabase Realtime Cloud' : 'ESP32 Wi-Fi HTTP API'}
            </span>
            <span>•</span>
            <span>Vite + React + TS</span>
            <span>•</span>
            <span className="text-slate-400">Research & Telemetry Lab</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
