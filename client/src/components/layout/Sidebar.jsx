import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/dashboard',  icon: '⊞', label: 'Dashboard' },
  { to: '/documents',  icon: '🗂', label: 'Documents'  },
  { to: '/reminders',  icon: '🔔', label: 'Notifications' },
  { to: '/settings',   icon: '⚙', label: 'Settings'  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <span>L</span>
        </div>
        <div>
          <p className={styles.brandName}>The Vault</p>
          <p className={styles.brandSub}>Premium Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className={styles.footer}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.name}</p>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Logout"
        >
          ↩
        </button>
      </div>
    </aside>
  );
}
