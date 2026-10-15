import React from 'react';
import { TelemetryReading } from '../types/sensor';
import { SensorCard } from '../components/SensorCard';
import {
  Thermometer,
  Droplets,
  CloudSun,
  Flame,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface TempHumidityTabProps {
  reading: TelemetryReading | null;
  history: TelemetryReading[];
}

export const TempHumidityTab: React.FC<TempHumidityTabProps> = ({ reading, history }) => {
  if (!reading) return null;
  const { dht11 } = reading;

  const tempChartData = history.map((item) => ({
    time: item.timestamp,
    Temperature: item.dht11.temperature,
    Humidity: item.dht11.humidity,
  }));

  // Heat Index approximation (Steadman formula simplified)
  const heatIndex = (
    dht11.temperature +
    0.05 * dht11.humidity +
    (dht11.temperature > 27 ? 1.5 : 0)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-emerald-400" />
            DHT11 Climatic & Battery Compartment Environmental Diagnostics
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Continuous ambient temperature (°C) and relative humidity (%) acquisition. Crucial for
            detecting thermal runaway risks in EV lithium battery enclosures and motor controller
            inverters.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400">
          <span className="text-emerald-400 font-bold">SENSOR:</span> Digital 1-Wire DHT11
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SensorCard
          title="Ambient Temperature"
          value={dht11.temperature}
          unit="°C"
          subtitle="Controller Compartment Ambient"
          icon={Thermometer}
          status={dht11.status}
          accentColor="emerald"
          badge="CELSIUS"
        >
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Operating Limit:</span>
            <span className="text-emerald-400">0°C to 50°C</span>
          </div>
        </SensorCard>

        <SensorCard
          title="Relative Humidity"
          value={dht11.humidity}
          unit="%"
          subtitle="Non-condensing RH"
          icon={Droplets}
          status={dht11.status}
          accentColor="blue"
          badge="RH"
        >
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Enclosure Spec:</span>
            <span className="text-blue-400">20% to 90% RH</span>
          </div>
        </SensorCard>

        <SensorCard
          title="Apparent Heat Index"
          value={heatIndex}
          unit="°C"
          subtitle="Combined Thermal Index"
          icon={Flame}
          status={dht11.status}
          accentColor="amber"
          badge="ESTIMATED"
        >
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Thermal Comfort:</span>
            <span className="text-amber-400">Nominal EV Range</span>
          </div>
        </SensorCard>
      </div>

      {/* Split Charts: Temperature History & Humidity History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature History Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-400" />
                Temperature Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Continuous thermal recording (°C)</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Current: {dht11.temperature}°C
            </span>
          </div>

          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempChartData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Temperature"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#tempGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity History Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                Relative Humidity Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Atmospheric moisture recording (%)</p>
            </div>
            <span className="text-xs font-mono text-blue-400 font-bold">
              Current: {dht11.humidity}%
            </span>
          </div>

          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempChartData}>
                <defs>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Humidity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#humGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
