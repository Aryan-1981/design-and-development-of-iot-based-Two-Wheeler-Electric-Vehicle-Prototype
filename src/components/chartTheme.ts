/**
 * Shared Recharts styling — identical axes, grid, and tooltips across every
 * telemetry section so the dashboard reads as one product.
 */

export const CHART_GRID = '#E2E8F0';
export const CHART_AXIS_LINE = '#E2E8F0';
export const CHART_AXIS_STROKE = '#CBD5E1';
export const CHART_TICK = { fontSize: 10, fill: '#64748B', fontFamily: 'JetBrains Mono, monospace' } as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.97)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(226, 232, 240, 0.95)',
  borderRadius: '10px',
  fontSize: '12px',
  fontFamily: 'JetBrains Mono, monospace',
  boxShadow: '0 12px 28px -12px rgba(15, 23, 42, 0.25)',
  color: '#0F172A',
  padding: '8px 10px',
};

export const CHART_AXIS_PROPS = {
  stroke: CHART_AXIS_STROKE,
  tick: CHART_TICK,
  tickLine: false,
  axisLine: { stroke: CHART_AXIS_LINE },
} as const;
