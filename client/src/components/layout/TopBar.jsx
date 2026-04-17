import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icon';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.greeting}>{greeting()},</span>
        <span className={styles.name}>{firstName}</span>
      </div>

      <div className={styles.right}>
        <button
          className={styles.addBtn}
          onClick={() => navigate('/documents/add')}
          aria-label="Add new document"
        >
          <Icon name="plus" size={15} />
          <span>New Document</span>
        </button>

        <button
          className={styles.avatar}
          onClick={() => navigate('/settings')}
          title="Profile & Settings"
          aria-label="Profile and settings"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}