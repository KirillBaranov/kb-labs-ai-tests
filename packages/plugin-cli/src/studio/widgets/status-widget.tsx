import type { FC } from 'react';

export interface AiTestsStatusWidgetProps {
  status: 'idle' | 'running' | 'repairing';
  pendingTargets: number;
  lastRunStatus?: 'success' | 'failed' | 'partial';
  iterations: number;
}

const statusPalette: Record<AiTestsStatusWidgetProps['status'], string> = {
  idle: '#1f2937',
  running: '#2563eb',
  repairing: '#c2410c'
};

export const AiTestsStatusWidget: FC<AiTestsStatusWidgetProps> = ({
  status,
  pendingTargets,
  lastRunStatus,
  iterations
}) => (
  <section
    style={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}
  >
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ margin: 0 }}>AI Tests</h3>
      <span
        style={{
          padding: '2px 10px',
          borderRadius: '999px',
          background: statusPalette[status],
          color: '#fff',
          fontSize: '0.8rem',
          textTransform: 'uppercase'
        }}
      >
        {status}
      </span>
    </header>

    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '12px',
        margin: '16px 0 0'
      }}
    >
      <div>
        <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Pending targets</dt>
        <dd style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{pendingTargets}</dd>
      </div>
      <div>
        <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Last run</dt>
        <dd style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{lastRunStatus ?? 'n/a'}</dd>
      </div>
      <div>
        <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Iterations</dt>
        <dd style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{iterations}</dd>
      </div>
    </dl>
  </section>
);

export default AiTestsStatusWidget;

