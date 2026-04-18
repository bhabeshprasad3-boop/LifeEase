import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../common/Icon';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={15} />
        </button>

        <button
          className={`${styles.logoutBtn} ${styles.mobileLogout}`}
          onClick={logout}
          aria-label="Logout"
          title="Logout"
        >
          <Icon name="logout" size={15} />
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
