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
import { Thermometer } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryPanel } from './TelemetryPanel';
import { CHART_GRID, CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from './chartTheme';

interface TemperatureChartProps {
  history: UnifiedTelemetry[];
}

export const TemperatureHumidityChart: React.FC<TemperatureChartProps> = ({ history }) => {
  const chartData = history.map((item) => ({
    time: item.timestamp,
    Temperature: item.dht11.valid ? item.dht11.temperature_c : null,
  }));

  const latestDht = history[history.length - 1]?.dht11;
  const currentTemp = latestDht?.valid ? latestDht.temperature_c : null;
  const isAvailable = currentTemp !== null;

  return (
    <TelemetryPanel
      icon={Thermometer}
      accent="ok"
      title="DHT11 Ambient Temperature"
      subtitle="Climatic sensor on GPIO 4 — ambient air temperature sampled every ~2.5 s"
      actions={
        isAvailable ? (
          <>
            <span className="ev-chip ev-chip-ok">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 signal-live" aria-hidden="true" />
              Live
            </span>
            <span className="ev-chip ev-chip-info">
              <span className="ev-metric text-[11px] normal-case tracking-normal">
                {currentTemp} °C
              </span>
            </span>
          </>
        ) : (
          <span className="ev-chip ev-chip-warn">Awaiting DHT11 Data</span>
        )
      }
      isEmpty={history.length === 0 || !isAvailable}
      emptyMessage="No DHT11 samples yet. The ambient channel reports when the ESP32 publishes valid climatic readings."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="dhtTempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
          <YAxis {...CHART_AXIS_PROPS} domain={['auto', 'auto']} unit="°C" width={54} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(val) => [`${val} °C`, 'Ambient Temp']}
          />
          <Area
            type="monotone"
            dataKey="Temperature"
            name="DHT11 (°C)"
            stroke="#059669"
            strokeWidth={2.25}
            fill="url(#dhtTempGrad)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </TelemetryPanel>
  );
};

export const TemperatureChart = TemperatureHumidityChart;
