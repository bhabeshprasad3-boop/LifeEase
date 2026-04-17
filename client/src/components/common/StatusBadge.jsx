export default function StatusBadge({ status }) {
  const map = {
    'Active':        { cls: 'badge-active',   dot: '#4edea3' },
    'Expiring Soon': { cls: 'badge-expiring', dot: '#d97706' },
    'Expired':       { cls: 'badge-expired',  dot: '#ba1a1a' },
    'Archived':      { cls: 'badge-archived', dot: '#76777d' },
  };
  const { cls, dot } = map[status] || map['Archived'];

  return (
    <span className={`badge ${cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
