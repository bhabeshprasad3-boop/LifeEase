import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentService } from '../services/document.service';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import DocumentPreview from '../components/document/DocumentPreview';
import styles from './DocumentDetailPage.module.css';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const refresh = () => documentService.getById(id).then(r => setDoc(r.data.document));

  useEffect(() => {
    refresh().catch(() => setError('Document not found.')).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Permanently delete this document? This cannot be undone.')) return;
    await documentService.delete(id);
    navigate('/documents');
  };

  const handleArchive = async () => {
    if (doc.archived) await documentService.unarchive(id);
    else await documentService.archive(id);
    refresh();
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await documentService.download(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/[^a-zA-Z0-9_\-]/g, '_')}.${doc.fileType || 'bin'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '—';

  if (loading) return (
    <div className={styles.loadWrap}>
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  );
  if (error) return (
    <div className={styles.errorWrap}><Icon name="alertCircle" size={20} />{error}</div>
  );

  const rows = [
    { label: 'Status',         value: <StatusBadge status={doc.status} /> },
    { label: 'Category',       value: doc.category },
    { label: 'File type',      value: doc.fileType?.toUpperCase() },
    { label: 'Issue date',     value: fmt(doc.issueDate) },
    { label: 'Expiry date',    value: fmt(doc.expiryDate) },
    { label: 'Uploaded',       value: fmt(doc.createdAt) },
    { label: 'Last modified',  value: fmt(doc.updatedAt) },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <Icon name="arrowLeft" size={15} /> Back
        </button>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={handleArchive}>
            <Icon name={doc.archived ? 'unarchive' : 'archive'} size={14} />
            {doc.archived ? 'Unarchive' : 'Archive'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/documents/${id}/edit`)}>
            <Icon name="edit" size={14} /> Edit
          </Button>
          <a href={doc.fileUrl} target="_blank" rel="noreferrer">
            <Button variant="accent" size="sm">
              <Icon name="externalLink" size={14} /> Open File
            </Button>
          </a>
          <Button variant="secondary" size="sm" loading={downloading} onClick={handleDownload}>
            <Icon name="download" size={14} /> Download
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Icon name="trash" size={14} /> Delete
          </Button>
        </div>
      </div>

      <div className={styles.body}>
        {/* Main */}
        <div className={styles.main}>
          <div className={styles.docHero}>
            <div className={styles.heroIcon}>
              <Icon name={doc.fileType === 'pdf' ? 'fileText' : 'image'} size={24} />
            </div>
            <div className={styles.heroText}>
              <h1 className={styles.docTitle}>{doc.title}</h1>
              <p className={styles.docSubtitle}>{doc.category} · {doc.fileType?.toUpperCase()}</p>
            </div>
            <StatusBadge status={doc.status} />
          </div>

          {/* Inline preview */}
          <DocumentPreview
            fileUrl={doc.fileUrl}
            fileType={doc.fileType}
            title={doc.title}
          />

          {/* Notes */}
          {doc.notes && (
            <div className={styles.notesCard}>
              <p className={styles.notesLabel}>Notes</p>
              <p className={styles.notesText}>{doc.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.metaCard}>
            <p className={styles.metaTitle}>Document Details</p>
            {rows.map(r => (
              <div key={r.label} className={styles.metaRow}>
                <span className={styles.metaLabel}>{r.label}</span>
                <span className={styles.metaValue}>{r.value}</span>
              </div>
            ))}
          </div>

          {doc.tags?.length > 0 && (
            <div className={styles.metaCard}>
              <p className={styles.metaTitle}>Tags</p>
              <div className={styles.tags}>
                {doc.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
