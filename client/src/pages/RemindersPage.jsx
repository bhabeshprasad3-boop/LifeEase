import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderService } from '../services/reminder.service';
import styles from './RemindersPage.module.css';

function NotifItem({ notif, onRead, navigate }) {
  const typeIcon = { expiry_warning: '⏳', expired: '❌', upload: '✅', system: 'ℹ️' };
  const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`${styles.notifItem} ${!notif.isRead ? styles.unread : ''}`}
      onClick={() => { if (!notif.isRead) onRead(notif._id); if (notif.documentId) navigate(`/documents/${notif.documentId._id || notif.documentId}`); }}>
      <div className={styles.notifIcon}>{typeIcon[notif.type] || 'ℹ️'}</div>
      <div className={styles.notifBody}>
        <p className={styles.notifTitle}>{notif.title}</p>
        <p className={styles.notifMsg}>{notif.message}</p>
        <span className={styles.notifTime}>{fmt(notif.createdAt)}</span>
      </div>
      {!notif.isRead && <span className={styles.unreadDot} />}
    </div>
  );
}

export default function RemindersPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reminderService.getNotifications()
      .then(res => setNotifications(res.data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const handleRead = async (id) => {
    await reminderService.markAsRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const upcoming = notifications.filter(n => !n.isRead && ['expiry_warning', 'expired'].includes(n.type));
  const past = notifications.filter(n => n.isRead || !['expiry_warning', 'expired'].includes(n.type));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
        <p className={styles.subtitle}>Action required for upcoming expirations.</p>
      </div>

      {loading ? (
        <div className={styles.loadList}>
          {[...Array(4)].map((_, i) => <div key={i} className={`skeleton ${styles.skeletonItem}`} />)}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Upcoming Expirations</h2>
              <div className={styles.list}>
                {upcoming.map(n => (
                  <NotifItem key={n._id} notif={n} onRead={handleRead} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Past Activity</h2>
            {past.length === 0 ? (
              <p className={styles.emptyText}>
                {upcoming.length === 0 ? '🎉 All caught up! No notifications.' : 'No past activity yet.'}
              </p>
            ) : (
              <div className={styles.list}>
                {past.map(n => (
                  <NotifItem key={n._id} notif={n} onRead={handleRead} navigate={navigate} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
