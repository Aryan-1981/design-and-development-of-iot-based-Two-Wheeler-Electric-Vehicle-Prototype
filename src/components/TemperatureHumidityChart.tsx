import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Thermometer, Droplets, AlertCircle } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';

interface TemperatureHumidityChartProps {
  history: UnifiedTelemetry[];
}

export const TemperatureHumidityChart: React.FC<TemperatureHumidityChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    Temperature: item.dht11.valid ? item.dht11.temperature_c : null,
    Humidity: item.dht11.valid ? item.dht11.humidity_percent : null,
  }));

  const latest = history[history.length - 1]?.dht11;
  const isAvailable = latest && latest.valid;

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              DHT11 Temperature & Relative Humidity
            </h3>
            <p className="text-xs text-slate-400">
              Combined time-series analysis (Nominal sensor refresh ~2.5s)
            </p>
          </div>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-400 font-bold">
              Temp: {latest.temperature_c !== null ? `${latest.temperature_c} °C` : '--'}
            </span>
            <span className="text-blue-400 font-bold">
              Humidity: {latest.humidity_percent !== null ? `${latest.humidity_percent} %` : '--'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Awaiting Real DHT11 Data</span>
          </div>
        )}
      </div>

      <div className="w-full h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            {/* Dual Y-Axes: Left for Temp (°C), Right for Humidity (%) */}
            <YAxis
              yAxisId="left"
              stroke="#10b981"
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: '#10b981' }}
              unit="°C"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#3b82f6"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#3b82f6' }}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="Temperature"
              name="Temperature (°C)"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#tempGrad)"
              connectNulls={false}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="Humidity"
              name="Humidity (%)"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#humGrad)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
