import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TelemetryPanel, PanelAccent } from './TelemetryPanel';

export interface TelemetryTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** Renders the cell body — keep values pre-formatted (mono/tabular applied by wrapper) */
  render: (row: T) => React.ReactNode;
}

interface TelemetryTableProps<T> {
  icon: LucideIcon;
  accent?: PanelAccent;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  columns: TelemetryTableColumn<T>[];
  /** Newest-first rows; only `maxRows` are rendered */
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  emptyMessage?: string;
  footnote?: string;
  maxRows?: number;
}

/**
 * Tabular fallback for a live chart (a11y guidance: streaming visualisations
 * should expose an equivalent data table).
 * Layout rules: horizontal scroll wrapper (never break narrow viewports),
 * uppercase column headers, zebra rows, mono tabular figures for numbers.
 */
export function TelemetryTable<T>({
  icon,
  accent = 'accent',
  title,
  subtitle,
  actions,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'No samples recorded yet. Once the sensor stream is live, the latest packets appear here, newest first.',
  footnote,
  maxRows = 8,
}: TelemetryTableProps<T>) {
  const shown = rows.slice(0, maxRows);

  return (
    <TelemetryPanel
      icon={icon}
      accent={accent}
      title={title}
      subtitle={subtitle}
      actions={actions}
      isEmpty={rows.length === 0}
      emptyMessage={emptyMessage}
      chartHeight="h-auto min-h-[9rem]"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse" aria-label={title}>
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`ev-eyebrow py-2 px-3 whitespace-nowrap text-slate-500 font-semibold ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="border-b border-slate-100 last:border-0 odd:bg-slate-50/60 hover:bg-sky-50/50 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2 px-3 whitespace-nowrap text-slate-700 font-mono tabular-nums ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote && (
        <p className="mt-3 text-[10px] font-mono text-slate-400">{footnote}</p>
      )}
    </TelemetryPanel>
  );
}
