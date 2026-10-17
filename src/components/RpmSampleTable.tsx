import React from 'react';
import { Table2 } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryTable, TelemetryTableColumn } from './TelemetryTable';

interface RpmSampleTableProps {
  history: UnifiedTelemetry[];
}

interface RpmRow {
  timestamp: string;
  value: number | null;
  valid: boolean;
  rotating: boolean;
  pulseCount: number;
  ppr: number;
}

/**
 * Tabular log of the latest tachometer packets for the RPM Monitoring
 * section — sits under the gauge + trend chart as the accessible fallback.
 */
export const RpmSampleTable: React.FC<RpmSampleTableProps> = ({ history }) => {
  const rows: RpmRow[] = [...history].reverse().map((sample) => ({
    timestamp: sample.timestamp,
    value: sample.rpm.valid ? sample.rpm.value : null,
    valid: sample.rpm.valid,
    rotating: sample.rpm.motor_rotating,
    pulseCount: sample.rpm.pulse_count,
    ppr: sample.rpm.pulses_per_revolution,
  }));

  const columns: TelemetryTableColumn<RpmRow>[] = [
    {
      key: 'time',
      header: 'Sample Time',
      render: (row) => <span className="text-slate-500">{row.timestamp}</span>,
    },
    {
      key: 'rpm',
      header: 'Shaft RPM',
      align: 'right',
      render: (row) =>
        row.valid ? (
          <span className="font-semibold text-slate-900">
            {row.value?.toLocaleString() ?? 0}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'state',
      header: 'State',
      render: (row) =>
        !row.valid ? (
          <span className="ev-chip ev-chip-muted">No Signal</span>
        ) : row.rotating ? (
          <span className="ev-chip ev-chip-ok">Spinning</span>
        ) : (
          <span className="ev-chip ev-chip-muted">Stopped</span>
        ),
    },
    {
      key: 'pulses',
      header: 'Pulse Count',
      align: 'right',
      render: (row) => <span className="text-sky-700">{row.pulseCount.toLocaleString()}</span>,
    },
    {
      key: 'ppr',
      header: 'PPR',
      align: 'right',
      render: (row) => <span className="text-slate-500">{row.ppr}</span>,
    },
  ];

  return (
    <TelemetryTable
      icon={Table2}
      accent="accent"
      title="RPM Sample Log"
      subtitle="Latest tachometer packets, newest first — tabular view of the gauge above"
      actions={
        <span className="ev-chip ev-chip-muted tabular-nums">{rows.length} samples</span>
      }
      columns={columns}
      rows={rows}
      getRowKey={(row, index) => `${row.timestamp}-${index}`}
      footnote={
        rows.length > 0
          ? `Showing ${Math.min(rows.length, 8)} of ${rows.length} buffered samples · scroll sideways on narrow screens`
          : undefined
      }
    />
  );
};
