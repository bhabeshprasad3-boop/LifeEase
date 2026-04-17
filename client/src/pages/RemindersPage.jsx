import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderService } from '../services/reminder.service';
import Icon from '../components/common/Icon';
import styles from './RemindersPage.module.css';

const TYPE_ICON = {
  expiry_warning: 'clock',
  expired: 'xCircle',
  upload: 'checkCircle',
  system: 'info',
};

function NotifItem({ notif, onRead, navigate }) {
  const fmt = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

  return (
    <div
      className={`${styles.item} ${!notif.isRead ? styles.unread : ''}`}
      onClick={() => {
        if (!notif.isRead) onRead(notif._id);
        if (notif.documentId) navigate(`/documents/${notif.documentId._id || notif.documentId}`);
      }}
      role="button"
      tabIndex={0}
    >
      <div className={`${styles.itemIcon} ${styles[`icon_${notif.type}`]}`}>
        <Icon name={TYPE_ICON[notif.type] || 'info'} size={16} />
      </div>
      <div className={styles.itemBody}>
        <p className={styles.itemTitle}>{notif.title}</p>
        <p className={styles.itemMsg}>{notif.message}</p>
        <span className={styles.itemTime}>{fmt(notif.createdAt)}</span>
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

  const urgent  = notifications.filter(n => !n.isRead && ['expiry_warning', 'expired'].includes(n.type));
  const history = notifications.filter(n => n.isRead || !['expiry_warning', 'expired'].includes(n.type));

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Notifications</h1>
        <p className={styles.subtitle}>Stay ahead of document expirations.</p>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[...Array(4)].map((_, i) => <div key={i} className={`skeleton ${styles.skeletonItem}`} />)}
        </div>
      ) : (
        <>
          {urgent.length > 0 && (
            <section>
              <p className={styles.sectionLabel}>Requires Attention</p>
              <div className={styles.list}>
                {urgent.map(n => <NotifItem key={n._id} notif={n} onRead={handleRead} navigate={navigate} />)}
              </div>
            </section>
          )}

          <section>
            <p className={styles.sectionLabel}>Activity History</p>
            {history.length === 0 && urgent.length === 0 ? (
              <div className={styles.emptyState}>
                <Icon name="checkCircle" size={24} style={{ color: 'var(--status-active)' }} />
                <p className={styles.emptyText}>All clear — no notifications yet.</p>
              </div>
            ) : history.length === 0 ? (
              <p className={styles.emptyNote}>No past activity.</p>
            ) : (
              <div className={styles.list}>
                {history.map(n => <NotifItem key={n._id} notif={n} onRead={handleRead} navigate={navigate} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
