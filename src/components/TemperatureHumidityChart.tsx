import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Thermometer, AlertCircle } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';

interface TemperatureChartProps {
  history: UnifiedTelemetry[];
}

export const TemperatureHumidityChart: React.FC<TemperatureChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    'DHT11 Temperature': item.dht11.valid ? item.dht11.temperature_c : null,
  }));

  const latestDht = history[history.length - 1]?.dht11;
  const isAvailable = latestDht && latestDht.valid && latestDht.temperature_c !== null;

  return (
    <div data-cursor="TELEMETRY" className="glass-panel rounded-2xl p-6 flex flex-col shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-slate-900 uppercase tracking-wider">
              DHT11 Ambient Temperature
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Live ambient air temperature from DHT11 sensor (°C)
            </p>
          </div>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <Thermometer className="w-3.5 h-3.5 text-indigo-500" />
            <span>{latestDht.temperature_c} °C</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Awaiting DHT11 Temperature Data</span>
          </div>
        )}
      </div>

      <div className="w-full h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="dhtTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              unit="°C"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(226, 232, 240, 0.9)',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                color: '#0f172a',
              }}
              formatter={(val: any) => [`${val} °C`, 'DHT11 Temperature']}
            />
            <Area
              type="monotone"
              dataKey="DHT11 Temperature"
              name="DHT11 Temperature (°C)"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fill="url(#dhtTempGrad)"
              connectNulls={false}
              dot={false}
              activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TemperatureChart = TemperatureHumidityChart;
