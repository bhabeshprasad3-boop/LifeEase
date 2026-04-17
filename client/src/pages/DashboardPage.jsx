import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import styles from './DashboardPage.module.css';

const CATEGORY_ICONS = {
  Identity: '🪪', Vehicle: '🚗', Education: '🎓', Health: '❤️‍🩹',
  Finance: '💰', Property: '🏠', Travel: '✈️', Personal: '📌', Other: '📄',
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color }}>{icon}</div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

function formatDaysLeft(expiryDate) {
  const diff = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
  if (diff < 0) return 'Expired';
  if (diff === 0) return 'Expires today';
  if (diff === 1) return 'Expires tomorrow';
  return `Expires in ${diff} days`;
}

export default function DashboardPage() {
  const { user } = useAuth();
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
      <div className={styles.loadingGrid}>
        {[...Array(4)].map((_, i) => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon="⚠️" title="Something went wrong" message={error} />;
  }

  const { stats, recentDocuments, upcomingExpiry, categorySummary } = data;

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h1 className={styles.greetTitle}>
          {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}.
        </h1>
        <p className={styles.greetSub}>Here is your digital vault overview.</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Documents" value={stats.total}       icon="📁" color="rgba(64,89,170,0.1)" />
        <StatCard label="Active"          value={stats.active}      icon="✅" color="rgba(78,222,163,0.12)" />
        <StatCard label="Expiring Soon"   value={stats.expiringSoon} icon="⏳" color="rgba(217,119,6,0.1)" />
        <StatCard label="Expired"         value={stats.expired}     icon="❌" color="rgba(186,26,26,0.08)" />
      </div>

      <div className={styles.grid}>
        {/* Recent Documents */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent Acquisitions</h2>
            <button className={styles.viewAll} onClick={() => navigate('/documents')}>View all →</button>
          </div>
          {recentDocuments.length === 0 ? (
            <EmptyState icon="📂" title="No documents yet" message="Upload your first document to get started."
              action={<Button onClick={() => navigate('/documents/add')}>Upload Document</Button>} />
          ) : (
            <div className={styles.docList}>
              {recentDocuments.map(doc => (
                <div key={doc._id} className={styles.docItem}
                  onClick={() => navigate(`/documents/${doc._id}`)} role="button" tabIndex={0}>
                  <div className={styles.docIcon}>
                    {CATEGORY_ICONS[doc.category] || '📄'}
                  </div>
                  <div className={styles.docInfo}>
                    <p className={styles.docTitle}>{doc.title}</p>
                    <p className={styles.docMeta}>
                      {doc.category} · {doc.fileType?.toUpperCase()}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right column */}
        <div className={styles.rightCol}>
          {/* Upcoming Expiry */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Upcoming Expiry</h2>
            {upcomingExpiry.length === 0 ? (
              <p className={styles.emptyText}>No upcoming expirations 🎉</p>
            ) : (
              <div className={styles.expiryList}>
                {upcomingExpiry.map(doc => (
                  <div key={doc._id} className={styles.expiryItem}
                    onClick={() => navigate(`/documents/${doc._id}`)} role="button" tabIndex={0}>
                    <div className={styles.expiryInfo}>
                      <p className={styles.expiryTitle}>{doc.title}</p>
                      <p className={styles.expiryDays}>{formatDaysLeft(doc.expiryDate)}</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Category Summary */}
          {categorySummary.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>By Category</h2>
              <div className={styles.catList}>
                {categorySummary.map(c => (
                  <div key={c.category} className={styles.catItem}>
                    <span>{CATEGORY_ICONS[c.category]} {c.category}</span>
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
