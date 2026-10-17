import React from 'react';
import {
  Cpu,
  Layers,
  Database,
  Monitor,
  Activity,
  HardDrive,
  Radio,
  Gauge,
  AlertTriangle,
  Rocket,
} from 'lucide-react';

export const AboutProjectPage: React.FC = () => {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & overview */}
      <section className="ev-panel ev-panel-in p-6 sm:p-8">
        <div className="max-w-4xl">
          <span className="ev-chip ev-chip-accent mb-4">
            <Cpu className="w-3 h-3" aria-hidden="true" />
            EV Engineering Research Project
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mt-3">
            IoT-Based Performance Monitoring of Two-Wheeler Electric Vehicles
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            This project investigates the integration of distributed Internet of Things sensor
            nodes with a two-wheeler electric vehicle prototype. A dedicated ESP32 microcontroller
            harvests motor shaft speed, chassis motion, ambient and sensor temperature, and servo
            actuator position, then streams the measurements to a live web dashboard for proactive
            diagnostics, rider-safety analysis, and powertrain-efficiency study.
          </p>
        </div>
      </section>

      {/* End-to-end architecture */}
      <section className="ev-panel p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-200/80">
          <Layers className="w-5 h-5 text-sky-600" aria-hidden="true" />
          End-to-End System Architecture
        </h3>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <ArchNode
            step="1. Sensors"
            tone="slate"
            icon={Activity}
            lines={['DHT11 ambient (GPIO 4)', 'NPN RPM (GPIO 5)', 'MPU6050 (I²C 21/22)', 'Servo (GPIO 18)']}
            footer="Hardware layer"
          />
          <ArchNode
            step="2. ESP32 Node"
            tone="accent"
            icon={Cpu}
            lines={['Non-blocking state machine', 'Hardware interrupt RPM', '10-min servo sequence', '115200 baud debug']}
            footer="Single ESP32 unit"
          />
          <ArchNode
            step="3. Wi-Fi HTTP API"
            tone="slate"
            icon={Radio}
            lines={['Local 2.4 GHz Wi-Fi', 'GET /api/status', 'GET /api/sensors', 'JSON + CORS']}
            footer="Direct Wi-Fi mode"
          />
          <ArchNode
            step="4. Web Dashboard"
            tone="slate"
            icon={Monitor}
            lines={['Scroll-controlled hero', 'Real sensor charts', 'Simulated V & A meters', 'Live status & logs']}
            footer="Vite + React + TS"
          />
          <ArchNode
            step="5. Supabase Cloud"
            tone="ok"
            icon={Database}
            lines={['PostgreSQL telemetry', 'Realtime INSERT stream', 'Polling fallback', 'Vercel edge hosting']}
            footer="Cloud ingestion"
          />
        </div>

        <div className="mt-6 p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs text-slate-700 leading-relaxed">
          <span className="text-sky-800 font-bold">Hardware note:</span> DHT11, NPN RPM, MPU6050,
          and servo readings come from real ESP32 sensors. Voltage and current are isolated
          simulated meters and are labelled as such everywhere in the dashboard.
        </div>
      </section>

      {/* Hardware pinout */}
      <section className="ev-panel p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-200/80">
          <HardDrive className="w-5 h-5 text-sky-600" aria-hidden="true" />
          Hardware Pin Assignments &amp; Calibration
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs min-w-[40rem]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-semibold">Sensor / Actuator</th>
                <th className="pb-3 font-semibold">ESP32 Pin</th>
                <th className="pb-3 font-semibold">Interface</th>
                <th className="pb-3 font-semibold">Range / Calibration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 text-sky-700 font-bold">NPN RPM Proximity</td>
                <td className="py-3 text-slate-900 font-bold">GPIO 5</td>
                <td className="py-3">Hardware interrupt (falling)</td>
                <td className="py-3">PPR = 1 · RPM = (pulses × 60000) ÷ (PPR × Δt)</td>
              </tr>
              <tr>
                <td className="py-3 text-emerald-700 font-bold">DHT11 Climatic</td>
                <td className="py-3 text-slate-900 font-bold">GPIO 4</td>
                <td className="py-3">Digital 1-wire single-bus</td>
                <td className="py-3">0–50 °C ambient · sampled every ~2500 ms</td>
              </tr>
              <tr>
                <td className="py-3 text-sky-700 font-bold">MPU6050 6-Axis IMU</td>
                <td className="py-3 text-slate-900 font-bold">GPIO 21 (SDA) / 22 (SCL)</td>
                <td className="py-3">I²C 0x68 at 400 kHz</td>
                <td className="py-3">±8 g accel (m/s²) · ±500 °/s gyro (rad/s) · die temp</td>
              </tr>
              <tr>
                <td className="py-3 text-amber-700 font-bold">Servo Actuator</td>
                <td className="py-3 text-slate-900 font-bold">GPIO 18</td>
                <td className="py-3">PWM 50 Hz (500–2500 µs)</td>
                <td className="py-3">Logical 0–60° (output = 180 − angle) · 10-min test</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Dashboard functionality + limitations + future scope */}
      <section className="ev-panel p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-200/80">
          <Gauge className="w-5 h-5 text-sky-600" aria-hidden="true" />
          Dashboard Functionality &amp; Current Scope
        </h3>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ScopeCard
            icon={Monitor}
            title="What the dashboard does"
            items={[
              'Scroll-controlled 300-frame motorcycle hero animation',
              'Live KPI cards for RPM, temperatures, and servo angle',
              'Real-time Recharts trends with session history buffer',
              'Dual data sources: ESP32 Wi-Fi HTTP and Supabase realtime',
              'Diagnostic event console with JSON export',
            ]}
          />
          <ScopeCard
            icon={AlertTriangle}
            title="Known implementation limits"
            tone="warn"
            items={[
              'Voltage & current are simulated — no V/A sensors connected',
              'Servo reports commanded angle; no physical position feedback',
              'DHT11 accuracy is ±2 °C class, sampled every ~2.5 s',
              'Direct Wi-Fi mode needs LAN; public HTTPS cannot reach private IPs',
              'Browser history buffer holds the 60 most recent samples',
            ]}
          />
          <ScopeCard
            icon={Rocket}
            title="Future scope"
            tone="accent"
            items={[
              'Real pack voltage / current sensing (e.g. INA219 or divider ADC)',
              'Servo position feedback via potentiometer or encoder',
              'MQTT transport and multi-vehicle fleet view',
              'Configurable alert thresholds and ride-session recording',
              'Authenticated dashboards and OTA firmware channels',
            ]}
          />
        </div>
      </section>

      {/* Supabase schema */}
      <section className="ev-panel p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-200/80">
          <Database className="w-5 h-5 text-sky-600" aria-hidden="true" />
          Supabase PostgreSQL Schema Reference
        </h3>

        <pre className="mt-4 p-5 rounded-xl bg-[#0B1220] border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto shadow-panel">{`-- Supabase PostgreSQL schema for real ESP32 telemetry history
CREATE TABLE public.vehicle_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    device_id VARCHAR(64) NOT NULL DEFAULT 'ev-esp32-01',
    uptime_ms BIGINT NOT NULL,
    -- DHT11 real sensor data
    temperature_c NUMERIC(5, 2),
    humidity_percent NUMERIC(5, 2),
    dht_valid BOOLEAN DEFAULT false,
    -- NPN RPM real sensor data
    rpm INTEGER,
    pulse_count BIGINT,
    pulses_per_revolution INTEGER DEFAULT 1,
    -- MPU6050 real sensor data
    accel_x_ms2 NUMERIC(7, 3),
    accel_y_ms2 NUMERIC(7, 3),
    accel_z_ms2 NUMERIC(7, 3),
    gyro_x_rads NUMERIC(8, 4),
    gyro_y_rads NUMERIC(8, 4),
    gyro_z_rads NUMERIC(8, 4),
    mpu_temperature_c NUMERIC(5, 2),
    mpu_valid BOOLEAN DEFAULT false,
    -- Servo actuator state
    servo_commanded_angle SMALLINT,
    servo_output_angle SMALLINT,
    servo_test_active BOOLEAN
);

CREATE INDEX idx_vehicle_telemetry_created_at ON public.vehicle_telemetry (created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_telemetry;`}</pre>
      </section>
    </div>
  );
};

/* ------------------------------------------------------------------ */

interface ArchNodeProps {
  step: string;
  icon: React.ElementType;
  lines: string[];
  footer: string;
  tone: 'slate' | 'accent' | 'ok';
}

const ArchNode: React.FC<ArchNodeProps> = ({ step, icon: Icon, lines, footer, tone }) => {
  const tones = {
    slate: {
      box: 'bg-slate-50 border-slate-200',
      icon: 'bg-white border-slate-200 text-slate-500',
      footer: 'text-slate-500 border-slate-200',
    },
    accent: {
      box: 'bg-sky-50/70 border-sky-200',
      icon: 'bg-white border-sky-200 text-sky-600',
      footer: 'text-sky-700 border-sky-200',
    },
    ok: {
      box: 'bg-emerald-50/60 border-emerald-200',
      icon: 'bg-white border-emerald-200 text-emerald-600',
      footer: 'text-emerald-700 border-emerald-200',
    },
  }[tone];

  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-between ${tones.box}`}>
      <div>
        <div
          className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${tones.icon}`}
          aria-hidden="true"
        >
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{step}</h4>
        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
          {lines.map((line) => (
            <React.Fragment key={line}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      </div>
      <span className={`text-[10px] font-mono font-semibold mt-3 pt-2 border-t ${tones.footer}`}>
        {footer}
      </span>
    </div>
  );
};

interface ScopeCardProps {
  icon: React.ElementType;
  title: string;
  items: string[];
  tone?: 'default' | 'warn' | 'accent';
}

const ScopeCard: React.FC<ScopeCardProps> = ({ icon: Icon, title, items, tone = 'default' }) => {
  const iconTone =
    tone === 'warn'
      ? 'bg-amber-50 border-amber-200 text-amber-600'
      : tone === 'accent'
      ? 'bg-sky-50 border-sky-200 text-sky-600'
      : 'bg-slate-50 border-slate-200 text-slate-500';

  return (
    <div className="ev-panel-muted p-4">
      <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
        <span className={`p-1.5 rounded-lg border ${iconTone}`} aria-hidden="true">
          <Icon className="w-3.5 h-3.5" />
        </span>
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-[11px] text-slate-600 leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[6px] w-1 h-1 rounded-full bg-slate-400 shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
