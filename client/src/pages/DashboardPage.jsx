import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboard.service';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import styles from './DashboardPage.module.css';

const CAT_ICON = {
  Identity:'identity', Vehicle:'vehicle', Education:'education',
  Health:'health', Finance:'finance', Property:'property',
  Travel:'travel', Personal:'personal', Other:'fileText',
};

function StatCard({ label, value, iconName, accentColor }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: accentColor + '18', color: accentColor }}>
        <Icon name={iconName} size={18} />
      </div>
      <div className={styles.statBody}>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

function daysLeft(expiryDate) {
  const d = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
  if (d < 0) return 'Expired';
  if (d === 0) return 'Expires today';
  if (d === 1) return 'Expires tomorrow';
  return `${d} days left`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getSummary()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonGrid}>
          {[...Array(4)].map((_, i) => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
        </div>
        <div className={styles.skeletonGrid} style={{ marginTop: 24 }}>
          <div className={`skeleton ${styles.skeletonWide}`} />
          <div className={`skeleton ${styles.skeletonWide}`} />
        </div>
      </div>
    );
  }

  if (error) return <EmptyState icon="alertCircle" title="Something went wrong" message={error} />;

  const { stats, recentDocuments, upcomingExpiry, categorySummary } = data;

  return (
    <div className={styles.page}>
      {/* Page title */}
      <div className={styles.heading}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Your document vault at a glance.</p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard label="Total"         value={stats.total}        iconName="folder"      accentColor="var(--accent)" />
        <StatCard label="Active"        value={stats.active}       iconName="checkCircle" accentColor="var(--status-active)" />
        <StatCard label="Expiring Soon" value={stats.expiringSoon} iconName="clock"       accentColor="var(--status-warn)" />
        <StatCard label="Expired"       value={stats.expired}      iconName="xCircle"     accentColor="var(--status-error)" />
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Recent */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Recent Documents</h2>
            <button className={styles.link} onClick={() => navigate('/documents')}>
              View all <Icon name="chevronRight" size={13} />
            </button>
          </div>
          {recentDocuments.length === 0 ? (
            <EmptyState icon="documents" title="No documents yet"
              message="Upload your first document to get started."
              action={<Button onClick={() => navigate('/documents/add')}>Upload Document</Button>} />
          ) : (
            <div className={styles.docList}>
              {recentDocuments.map(doc => (
                <div key={doc._id} className={styles.docRow}
                  onClick={() => navigate(`/documents/${doc._id}`)} role="button" tabIndex={0}>
                  <div className={styles.docIcon}>
                    <Icon name={CAT_ICON[doc.category] || 'fileText'} size={16} />
                  </div>
                  <div className={styles.docInfo}>
                    <p className={styles.docName}>{doc.title}</p>
                    <p className={styles.docMeta}>{doc.category} · {doc.fileType?.toUpperCase()}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                  <span className={styles.rowArrow}><Icon name="chevronRight" size={14} /></span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={styles.rightCol}>
          {/* Upcoming */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Upcoming Expiry</h2>
            {upcomingExpiry.length === 0 ? (
              <p className={styles.emptyNote}>No upcoming expirations. All clear.</p>
            ) : (
              <div className={styles.expiryList}>
                {upcomingExpiry.map(doc => (
                  <div key={doc._id} className={styles.expiryRow}
                    onClick={() => navigate(`/documents/${doc._id}`)} role="button" tabIndex={0}>
                    <div className={styles.expiryInfo}>
                      <p className={styles.expiryName}>{doc.title}</p>
                      <p className={styles.expiryDays}>{daysLeft(doc.expiryDate)}</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Categories */}
          {categorySummary.length > 0 && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>By Category</h2>
              <div className={styles.catList}>
                {categorySummary.map(c => (
                  <div key={c.category} className={styles.catRow}>
                    <div className={styles.catLeft}>
                      <Icon name={CAT_ICON[c.category] || 'fileText'} size={14} />
                      <span>{c.category}</span>
                    </div>
                    <span className={styles.catCount}>{c.count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
