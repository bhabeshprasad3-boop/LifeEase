import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentService } from '../services/document.service';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import styles from './DocumentDetailPage.module.css';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    documentService.getById(id)
      .then(res => setDoc(res.data.document))
      .catch(() => setError('Document not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this document permanently?')) return;
    await documentService.delete(id);
    navigate('/documents');
  };

  const handleArchive = async () => {
    if (doc.archived) await documentService.unarchive(id);
    else await documentService.archive(id);
    const res = await documentService.getById(id);
    setDoc(res.data.document);
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto', width: 32, height: 32 }} /></div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={handleArchive}>
            {doc.archived ? '📤 Unarchive' : '📥 Archive'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/documents/${id}/edit`)}>
            ✏️ Edit
          </Button>
          <a href={doc.fileUrl} target="_blank" rel="noreferrer">
            <Button size="sm">↗ Open File</Button>
          </a>
          <Button variant="danger" size="sm" onClick={handleDelete}>🗑 Delete</Button>
        </div>
      </div>

      <div className={styles.body}>
        {/* Main Panel */}
        <div className={styles.main}>
          <div className={styles.docHeader}>
            <div className={styles.docIcon}>📄</div>
            <div>
              <h1 className={styles.docTitle}>{doc.title}</h1>
              <p className={styles.docMeta}>
                {doc.category} · {doc.fileType?.toUpperCase()} · Added {fmt(doc.createdAt)}
              </p>
            </div>
            <StatusBadge status={doc.status} />
          </div>

          {/* File preview hint */}
          <div className={styles.previewCard}>
            <div className={styles.previewInner}>
              <span className={styles.previewIcon}>
                {doc.fileType === 'pdf' ? '📋' : '🖼'}
              </span>
              <div>
                <p className={styles.previewTitle}>{doc.title}</p>
                <p className={styles.previewSub}>{doc.fileType?.toUpperCase()} File</p>
              </div>
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className={styles.openLink}>
                Open in new tab →
              </a>
            </div>
          </div>

          {/* Notes */}
          {doc.notes && (
            <div className={styles.notes}>
              <h3 className={styles.notesLabel}>Notes</h3>
              <p className={styles.notesText}>{doc.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.metaCard}>
            <h3 className={styles.metaTitle}>Document Details</h3>
            <div className={styles.metaRows}>
              {[
                { label: 'Status', value: <StatusBadge status={doc.status} /> },
                { label: 'Category', value: doc.category },
                { label: 'File Type', value: doc.fileType?.toUpperCase() },
                { label: 'Issue Date', value: fmt(doc.issueDate) },
                { label: 'Expiry Date', value: fmt(doc.expiryDate) },
                { label: 'Uploaded', value: fmt(doc.createdAt) },
                { label: 'Last Modified', value: fmt(doc.updatedAt) },
              ].map(row => (
                <div key={row.label} className={styles.metaRow}>
                  <span className={styles.metaLabel}>{row.label}</span>
                  <span className={styles.metaValue}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {doc.tags?.length > 0 && (
            <div className={styles.metaCard}>
              <h3 className={styles.metaTitle}>Tags</h3>
              <div className={styles.tags}>
                {doc.tags.map(t => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
