import React from 'react';
import { Table2 } from 'lucide-react';
import { UnifiedTelemetry } from '../types/sensors';
import { TelemetryTable, TelemetryTableColumn } from './TelemetryTable';

interface ServoSampleTableProps {
  history: UnifiedTelemetry[];
}

interface ServoRow {
  timestamp: string;
  logical: number;
  output: number;
  stage: string;
  testActive: boolean;
  remainingSec: number;
}

const SERVO_MAX_DEG = 60;

/**
 * Tabular log of the commanded-angle sequence for the Servo Monitoring
 * section — sits under the dial + trend chart as the accessible fallback.
 */
export const ServoSampleTable: React.FC<ServoSampleTableProps> = ({ history }) => {
  const rows: ServoRow[] = [...history].reverse().map((sample) => ({
    timestamp: sample.timestamp,
    logical: sample.servo.commanded_angle_deg,
    output: sample.servo.output_angle_deg,
    stage: sample.servo.current_stage || (sample.servo.test_active ? 'Sequence Running' : 'Idle'),
    testActive: sample.servo.test_active,
    remainingSec: sample.servo.remaining_duration_ms
      ? Math.round(sample.servo.remaining_duration_ms / 1000)
      : 0,
  }));

  const columns: TelemetryTableColumn<ServoRow>[] = [
    {
      key: 'time',
      header: 'Sample Time',
      render: (row) => <span className="text-slate-500">{row.timestamp}</span>,
    },
    {
      key: 'logical',
      header: `Logical (0–${SERVO_MAX_DEG}°)`,
      align: 'right',
      render: (row) => <span className="font-semibold text-slate-900">{row.logical}°</span>,
    },
    {
      key: 'output',
      header: 'Physical Command',
      align: 'right',
      render: (row) => <span className="text-amber-700">{row.output}°</span>,
    },
    {
      key: 'stage',
      header: 'Sequence Stage',
      render: (row) => (
        <span className="inline-block max-w-[14rem] truncate align-middle" title={row.stage}>
          {row.stage}
        </span>
      ),
    },
    {
      key: 'state',
      header: 'Test',
      render: (row) =>
        row.testActive ? (
          <span className="ev-chip ev-chip-warn">Running</span>
        ) : (
          <span className="ev-chip ev-chip-muted">Idle</span>
        ),
    },
    {
      key: 'remaining',
      header: 'Time Left',
      align: 'right',
      render: (row) => <span className="text-sky-700">{row.remainingSec}s</span>,
    },
  ];

  return (
    <TelemetryTable
      icon={Table2}
      accent="warn"
      title="Servo Command Log"
      subtitle="Commanded-angle sequence samples, newest first — logical vs. physical (180 − angle)"
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
