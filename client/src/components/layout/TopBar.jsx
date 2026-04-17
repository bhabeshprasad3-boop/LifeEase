import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.greeting}>
        <span className={styles.greetText}>{getGreeting()}, </span>
        <span className={styles.name}>{user?.name?.split(' ')[0]}</span>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.addBtn}
          onClick={() => navigate('/documents/add')}
        >
          + Add Document
        </button>
        <div
          className={styles.avatar}
          onClick={() => navigate('/settings')}
          role="button"
          tabIndex={0}
          title="Profile & Settings"
        >
          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
