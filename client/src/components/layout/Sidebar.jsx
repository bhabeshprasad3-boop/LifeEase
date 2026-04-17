import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMobileMenu } from '../../context/MobileMenuContext';
import Icon from '../common/Icon';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard'      },
  { to: '/documents', icon: 'documents', label: 'Documents'       },
  { to: '/reminders', icon: 'bell',      label: 'Notifications'   },
  { to: '/settings',  icon: 'settings',  label: 'Settings'        },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isOpen, close } = useMobileMenu();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const handleLogout = async () => {
    await logout();
    close();
    navigate('/login');
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.mobileOpen : ''}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <Icon name="shield" size={16} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>LifeEase</span>
          <span className={styles.brandTag}>Document Vault</span>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Navigation</p>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={close}
            className={({ isActive }) =>
              `${styles.item} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.itemIcon}>
              <Icon name={icon} size={16} />
            </span>
            <span className={styles.itemLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className={styles.footer}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userMeta}>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
          <Icon name="logout" size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
