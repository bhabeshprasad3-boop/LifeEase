import Icon from './Icon';
import styles from './EmptyState.module.css';

export default function EmptyState({ icon = 'folder', title, message, action }) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <Icon name={icon} size={28} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
