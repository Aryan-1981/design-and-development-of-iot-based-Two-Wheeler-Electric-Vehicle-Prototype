import React from 'react';
import {
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Cloud,
  Monitor,
  Activity,
  CheckCircle2,
  Share2,
  HardDrive,
  Radio,
  FileCode,
} from 'lucide-react';

export const AboutTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Overview */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>EV Engineering Research Project</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Design & Development of IoT-Based Two-Wheeler Electric Vehicle Prototype for
            Performance Monitoring
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            This project investigates the architectural integration of distributed Internet of
            Things (IoT) sensor nodes with an electric two-wheeler prototype. By harvesting real-time
            tachometric velocity, chassis 6-DOF vibration profiles, motor thermal dispersion, and
            actuator positions, the system provides proactive diagnostics, improves rider safety,
            and enhances electric powertrain energy efficiency.
          </p>
        </div>
      </div>

      {/* System Architecture Diagram */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-800">
          <Layers className="w-5 h-5 text-cyan-400" />
          Hardware & Telemetry Architecture Pipeline
        </h3>

        {/* Diagram Flow */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Node 1: Physical Sensors */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 mb-3 border border-cyan-800">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">1. Sensors</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • DHT11 (Temp/RH)<br />
                • NPN Sensor (RPM)<br />
                • MPU6050 (6-DOF IMU)<br />
                • 40 kg-cm Servo
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 mt-3 pt-2 border-t border-slate-800">
              Raw Analog / I2C / Pulse
            </span>
          </div>

          {/* Node 2: Microcontroller Node */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 flex flex-col justify-between shadow-glow-cyan/10">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 mb-3 border border-cyan-600">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">2. ESP32 Node</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • Dual Xtensa LX6 240MHz<br />
                • Hardware Timer Interrupts<br />
                • FreeRTOS Queue System<br />
                • JSON Packet Serializer
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 mt-3 pt-2 border-t border-slate-800">
              Edge Processing
            </span>
          </div>

          {/* Node 3: Transport Layer */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-950 flex items-center justify-center text-purple-400 mb-3 border border-purple-800">
                <Radio className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">3. Transport</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • 2.4 GHz Wi-Fi / LTE-M<br />
                • WebSocket (Low-latency)<br />
                • MQTT Broker (QoS 1)<br />
                • HTTPS POST Ingestion
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 mt-3 pt-2 border-t border-slate-800">
              Bi-directional Comm
            </span>
          </div>

          {/* Node 4: Cloud / Supabase Ingestion */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-800">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">4. Supabase DB</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • PostgreSQL TimescaleDB<br />
                • Row-Level Security (RLS)<br />
                • Edge Functions Endpoint<br />
                • Realtime Change Stream
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-3 pt-2 border-t border-slate-800">
              Phase 2 Ready
            </span>
          </div>

          {/* Node 5: Web Dashboard */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 mb-3 border border-blue-800">
                <Monitor className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">5. Web Client</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • Vite + React + TS<br />
                • Real-time Telemetry Charts<br />
                • Responsive Lab Interface<br />
                • Vercel Edge Hosting
              </p>
            </div>
            <span className="text-[10px] font-mono text-blue-400 mt-3 pt-2 border-t border-slate-800">
              Interactive UI
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-400">
          <span className="text-cyan-400 font-bold">System Status:</span> Currently running in
          validated Phase 1 Frontend Telemetry mode with decoupled mock data provider. Seamlessly
          switches to live WebSocket or Supabase Realtime in Phase 2 via{' '}
          <code className="text-white bg-slate-800 px-1 py-0.5 rounded">VITE_DATA_SOURCE</code>.
        </div>
      </div>

      {/* Hardware Specifications Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-800">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          Hardware Component Matrix & Diagnostic Purpose
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Subsystem Component</th>
                <th className="pb-3 font-semibold">Sensor Interface</th>
                <th className="pb-3 font-semibold">Key Monitored Parameter</th>
                <th className="pb-3 font-semibold">Engineering Function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 text-cyan-400 font-bold">ESP32 Development Board</td>
                <td className="py-3">MicroUSB / GPIO / ADC / I2C</td>
                <td className="py-3">System Uptime, Core Freq</td>
                <td className="py-3">Central RTOS data aggregation and Wi-Fi streaming</td>
              </tr>
              <tr>
                <td className="py-3 text-emerald-400 font-bold">DHT11 Climatic Sensor</td>
                <td className="py-3">Digital 1-Wire Single-bus</td>
                <td className="py-3">Ambient Temp (°C), Humidity (%)</td>
                <td className="py-3">Battery enclosure & motor controller thermal monitoring</td>
              </tr>
              <tr>
                <td className="py-3 text-cyan-300 font-bold">NPN Proximity / Optical Sensor</td>
                <td className="py-3">Hardware Interrupt GPIO</td>
                <td className="py-3">Pulse frequency, Shaft RPM</td>
                <td className="py-3">Motor shaft angular speed & transmission velocity feedback</td>
              </tr>
              <tr>
                <td className="py-3 text-purple-400 font-bold">MPU6050 6-Axis IMU</td>
                <td className="py-3">I2C (SDA/SCL, Addr 0x68)</td>
                <td className="py-3">Ax, Ay, Az (m/s²), Gx, Gy, Gz (°/s)</td>
                <td className="py-3">Chassis dynamics, lean angle, suspension bump analysis</td>
              </tr>
              <tr>
                <td className="py-3 text-amber-400 font-bold">40 kg-cm High-Torque Servo</td>
                <td className="py-3">PWM (50Hz, 1000-2000µs)</td>
                <td className="py-3">Commanded Angle (0-180°)</td>
                <td className="py-3">Throttle linkage / dynamic aerodynamic flap control</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase Schema & Integration Docs for Phase 2 */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-800">
          <Database className="w-5 h-5 text-emerald-400" />
          Phase 2 Supabase Database Schema Specification
        </h3>

        <p className="mt-4 text-xs text-slate-300 font-mono">
          Below is the recommended PostgreSQL schema for storing high-frequency telemetry readings
          in Supabase. The table includes time-series indexing and JSONB payloads for 6-DOF IMU
          metrics:
        </p>

        <div className="mt-4 p-4 rounded-xl bg-[#060a14] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
          <pre>{`-- SQL Schema for Two-Wheeler EV Prototype Telemetry
CREATE TABLE public.ev_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    device_id VARCHAR(64) NOT NULL DEFAULT 'ESP32_EV_PROTOTYPE_01',
    temperature NUMERIC(5, 2) NOT NULL, -- in °C from DHT11
    humidity NUMERIC(5, 2) NOT NULL,    -- in % from DHT11
    rpm INTEGER NOT NULL,               -- derived from NPN sensor
    pulse_count BIGINT NOT NULL,        -- cumulative pulse counter
    servo_angle SMALLINT NOT NULL,      -- commanded 0-180 degrees
    accel_magnitude NUMERIC(6, 2) NOT NULL, -- sqrt(x^2 + y^2 + z^2)
    accel_data JSONB NOT NULL,          -- { "x": 0.12, "y": -0.04, "z": 9.81 }
    gyro_data JSONB NOT NULL,           -- { "x": 1.2, "y": -0.4, "z": 0.8 }
    battery_voltage NUMERIC(4, 2) DEFAULT 48.0
);

-- Index on created_at for fast time-series queries
CREATE INDEX idx_ev_telemetry_created_at ON public.ev_telemetry (created_at DESC);

-- Enable Supabase Realtime replication on ev_telemetry
ALTER PUBLICATION supabase_realtime ADD TABLE public.ev_telemetry;`}</pre>
        </div>
      </div>
    </div>
  );
};
