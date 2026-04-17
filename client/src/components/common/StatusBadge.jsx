export default function StatusBadge({ status }) {
  const map = {
    'Active':        { cls: 'badge-active',   dot: 'var(--status-active)'  },
    'Expiring Soon': { cls: 'badge-expiring', dot: 'var(--status-warn)'    },
    'Expired':       { cls: 'badge-expired',  dot: 'var(--status-error)'   },
    'Archived':      { cls: 'badge-archived', dot: 'var(--status-muted)'   },
  };
  const { cls, dot } = map[status] || map['Archived'];

  return (
    <span className={`badge ${cls}`}>
      <span style={{
        width: 5, height: 5,
        borderRadius: '50%',
        background: dot,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {status}
    </span>
  );
}
