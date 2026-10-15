import React from 'react';
import {
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Cloud,
  Monitor,
  Activity,
  HardDrive,
  Radio,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const AboutProjectPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>EV Engineering Research Project</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Design and Development of IoT-Based Two-Wheeler Electric Vehicle Prototype for
            Performance Monitoring
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            This project investigates the architectural integration of distributed Internet of
            Things (IoT) sensor nodes with an electric two-wheeler prototype. By harvesting real-time
            tachometric velocity, chassis 6-DOF vibration profiles, motor thermal dispersion, and
            actuator positions from a dedicated ESP32 microcontroller, the system provides
            proactive diagnostics, improves rider safety, and enhances electric powertrain
            efficiency.
          </p>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-800">
          <Layers className="w-5 h-5 text-cyan-400" />
          End-to-End System Architecture Pipeline
        </h3>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Node 1 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 mb-3 border border-cyan-800">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">1. Sensors</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • DHT11 (GPIO 4)<br />
                • NPN RPM (GPIO 5)<br />
                • MPU6050 (I2C 21/22)<br />
                • Servo (GPIO 18)
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 mt-3 pt-2 border-t border-slate-800">
              Hardware Layer
            </span>
          </div>

          {/* Node 2 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 flex flex-col justify-between shadow-glow-cyan/10">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 mb-3 border border-cyan-600">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">2. ESP32 Node</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • Non-blocking state machine<br />
                • Hardware interrupt RPM<br />
                • 10-Min servo sequence<br />
                • 115200 Baud debugging
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 mt-3 pt-2 border-t border-slate-800">
              Single ESP32 Unit
            </span>
          </div>

          {/* Node 3 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-950 flex items-center justify-center text-purple-400 mb-3 border border-purple-800">
                <Radio className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">3. Wi-Fi HTTP API</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • Local 2.4 GHz Wi-Fi<br />
                • GET /api/status<br />
                • GET /api/sensors<br />
                • JSON with CORS
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 mt-3 pt-2 border-t border-slate-800">
              Zero Cloud Dependency
            </span>
          </div>

          {/* Node 4 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 mb-3 border border-blue-800">
                <Monitor className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">4. Web Dashboard</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • Scroll-controlled animation<br />
                • Real sensor charts<br />
                • Simulated V & A meters<br />
                • Stale & Offline detection
              </p>
            </div>
            <span className="text-[10px] font-mono text-blue-400 mt-3 pt-2 border-t border-slate-800">
              Vite + React + TS
            </span>
          </div>

          {/* Node 5 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between opacity-80">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-800">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-white uppercase">5. Future Cloud</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                • Supabase PostgreSQL<br />
                • Realtime telemetry sync<br />
                • Vercel Edge Hosting<br />
                • Remote fleet tracking
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-3 pt-2 border-t border-slate-800">
              Phase 2 Ready
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
          <span className="text-cyan-400 font-bold">Hardware Note:</span> Real ESP32 readings
          power every physical sensor (DHT11, NPN RPM, MPU6050, and Servo). Voltage and current are
          isolated simulated meters.
        </div>
      </div>

      {/* Hardware Pins and Specifications */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-800">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          Hardware Pin Assignments & Diagnostic Calibration
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Sensor / Actuator</th>
                <th className="pb-3 font-semibold">ESP32 Pin</th>
                <th className="pb-3 font-semibold">Interface Type</th>
                <th className="pb-3 font-semibold">Range / Calibration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 text-cyan-400 font-bold">NPN RPM Proximity Sensor</td>
                <td className="py-3 text-white font-bold">GPIO 5</td>
                <td className="py-3">Hardware Interrupt (FALLING)</td>
                <td className="py-3">PPR = 1, RPM = (pulses × 60000) / (PPR × Δt)</td>
              </tr>
              <tr>
                <td className="py-3 text-emerald-400 font-bold">DHT11 Climatic Sensor</td>
                <td className="py-3 text-white font-bold">GPIO 4</td>
                <td className="py-3">Digital 1-Wire Single-Bus</td>
                <td className="py-3">0-50°C, 20-90% RH (read every 2500ms)</td>
              </tr>
              <tr>
                <td className="py-3 text-purple-400 font-bold">MPU6050 6-Axis IMU</td>
                <td className="py-3 text-white font-bold">GPIO 21 (SDA) / 22 (SCL)</td>
                <td className="py-3">I2C (0x68) at 400kHz</td>
                <td className="py-3">±8g Accel (m/s²), ±500°/s Gyro (rad/s), 21Hz Filter</td>
              </tr>
              <tr>
                <td className="py-3 text-amber-400 font-bold">Servo Actuator</td>
                <td className="py-3 text-white font-bold">GPIO 18</td>
                <td className="py-3">PWM (50Hz, 500-2500µs)</td>
                <td className="py-3">Logical 0-30° (Output: 180 - angle), 10-Min Test</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase Future Integration */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-800">
          <Database className="w-5 h-5 text-emerald-400" />
          Proposed Supabase PostgreSQL Schema (Phase 2)
        </h3>

        <div className="mt-4 p-4 rounded-xl bg-[#060a14] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
          <pre>{`-- Supabase PostgreSQL Schema for Real ESP32 Telemetry History
CREATE TABLE public.vehicle_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    device_id VARCHAR(64) NOT NULL DEFAULT 'ev-esp32-01',
    uptime_ms BIGINT NOT NULL,
    -- DHT11 Real Sensor Data
    temperature_c NUMERIC(5, 2),
    humidity_percent NUMERIC(5, 2),
    dht_valid BOOLEAN DEFAULT false,
    -- NPN RPM Real Sensor Data
    rpm INTEGER,
    pulse_count BIGINT,
    pulses_per_revolution INTEGER DEFAULT 1,
    -- MPU6050 Real Sensor Data
    accel_x_ms2 NUMERIC(7, 3),
    accel_y_ms2 NUMERIC(7, 3),
    accel_z_ms2 NUMERIC(7, 3),
    gyro_x_rads NUMERIC(8, 4),
    gyro_y_rads NUMERIC(8, 4),
    gyro_z_rads NUMERIC(8, 4),
    mpu_temperature_c NUMERIC(5, 2),
    mpu_valid BOOLEAN DEFAULT false,
    -- Servo Actuator State
    servo_commanded_angle SMALLINT,
    servo_output_angle SMALLINT,
    servo_test_active BOOLEAN
);

CREATE INDEX idx_vehicle_telemetry_created_at ON public.vehicle_telemetry (created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_telemetry;`}</pre>
        </div>
      </div>
    </div>
  );
};
