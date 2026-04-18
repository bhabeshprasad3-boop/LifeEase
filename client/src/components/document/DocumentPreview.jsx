import { useState } from 'react';
import Icon from '../common/Icon';
import styles from './DocumentPreview.module.css';

export default function DocumentPreview({ fileUrl, fileType, title }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!fileUrl) return null;

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(fileType?.toLowerCase());
  const isPdf = fileType?.toLowerCase() === 'pdf';

  return (
    <div className={styles.preview}>
      <div className={styles.previewHeader}>
        <div className={styles.previewLeft}>
          <Icon name={isPdf ? 'fileText' : 'image'} size={18} />
          <div>
            <p className={styles.previewName}>{title}</p>
            <p className={styles.previewType}>{fileType?.toUpperCase()} · Secure Preview</p>
          </div>
        </div>
        <a href={fileUrl} target="_blank" rel="noreferrer" className={styles.openLink}>
          Open file <Icon name="externalLink" size={13} />
        </a>
      </div>

      <div className={styles.previewArea}>
        {!loaded && !error && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading preview...</span>
          </div>
        )}

        {error && (
          <div className={styles.errorState}>
            <Icon name="alertCircle" size={32} />
            <p>Preview unavailable</p>
            <a href={fileUrl} target="_blank" rel="noreferrer" className={styles.errorLink}>
              Open file instead <Icon name="externalLink" size={13} />
            </a>
          </div>
        )}

        {isImage && !error && (
          <img
            src={fileUrl}
            alt={title}
            className={`${styles.media} ${loaded ? styles.visible : ''}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}

        {isPdf && !error && (
          <iframe
            src={`${fileUrl}#toolbar=0`}
            className={`${styles.media} ${loaded ? styles.visible : ''}`}
            title={title}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
}
