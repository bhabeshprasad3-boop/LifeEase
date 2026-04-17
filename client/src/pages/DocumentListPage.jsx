import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/document.service';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Icon from '../components/common/Icon';
import styles from './DocumentListPage.module.css';

const CATEGORIES = ['All','Identity','Vehicle','Education','Health','Finance','Property','Travel','Personal','Other'];
const STATUSES   = ['All','Active','Expiring Soon','Expired','Archived'];
const SORTS      = [{ label:'Newest', value:'newest' },{ label:'Oldest', value:'oldest' },{ label:'Nearest Expiry', value:'nearest-expiry' }];

const CAT_ICON = {
  Identity:'identity', Vehicle:'vehicle', Education:'education',
  Health:'health', Finance:'finance', Property:'property',
  Travel:'travel', Personal:'personal', Other:'fileText',
};

export default function DocumentListPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search:'', category:'All', status:'', sort:'newest', page:1,
  });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.status && filters.status !== 'All') {
        if (filters.status === 'Archived') params.archived = 'true';
        else params.status = filters.status;
      }
      params.sort = filters.sort;
      params.page = filters.page;
      const res = await documentService.getAll(params);
      setDocs(res.data.documents);
      setPagination(res.data.pagination);
    } catch { setDocs([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this document permanently? This cannot be undone.')) return;
    await documentService.delete(id);
    fetchDocs();
  };

  const handleArchive = async (e, doc) => {
    e.stopPropagation();
    if (doc.archived) await documentService.unarchive(doc._id);
    else await documentService.archive(doc._id);
    fetchDocs();
  };

  const handleDownload = async (e, doc) => {
    e.stopPropagation();
    try {
      const blob = await documentService.download(doc._id);
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
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Documents</h1>
          <p className={styles.subtitle}>{pagination.total} document{pagination.total !== 1 ? 's' : ''} in your vault</p>
        </div>
        <Button onClick={() => navigate('/documents/add')}>
          <Icon name="plus" size={14} /> New Document
        </Button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Icon name="search" size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by title or tag…"
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
        </div>
        <select className={styles.select} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s} Status</option>)}
        </select>
        <select className={styles.select} value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Category tabs */}
      <div className={styles.cats}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`${styles.cat} ${filters.category === c ? styles.catActive : ''}`}
            onClick={() => setFilter('category', c)}
          >{c}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState icon="documents" title="No documents found"
          message="Adjust your filters or upload a new document."
          action={<Button onClick={() => navigate('/documents/add')}>Upload Document</Button>} />
      ) : (
        <>
          <div className={styles.grid}>
            {docs.map(doc => (
              <div key={doc._id} className={styles.card}
                onClick={() => navigate(`/documents/${doc._id}`)} role="button" tabIndex={0}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <Icon name={CAT_ICON[doc.category] || 'fileText'} size={17} />
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
                <h3 className={styles.cardTitle}>{doc.title}</h3>
                <p className={styles.cardMeta}>
                  {doc.category}{doc.fileType ? ` · ${doc.fileType.toUpperCase()}` : ''}
                  {doc.expiryDate ? ` · Exp. ${new Date(doc.expiryDate).toLocaleDateString()}` : ''}
                </p>
                {doc.tags?.length > 0 && (
                  <div className={styles.tags}>
                    {doc.tags.slice(0, 3).map(t => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                )}
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <button className={styles.actionBtn} onClick={() => navigate(`/documents/${doc._id}/edit`)} title="Edit">
                    <Icon name="edit" size={14} />
                  </button>
                  <button className={styles.actionBtn} onClick={e => handleArchive(e, doc)} title={doc.archived ? 'Unarchive' : 'Archive'}>
                    <Icon name={doc.archived ? 'unarchive' : 'archive'} size={14} />
                  </button>
                  <button className={styles.actionBtn} onClick={e => handleDownload(e, doc)} title="Download">
                    <Icon name="download" size={14} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={e => handleDelete(e, doc._id)} title="Delete">
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={filters.page <= 1}
                onClick={() => setFilter('page', filters.page - 1)}
                className={styles.pageBtn}>
                <Icon name="arrowLeft" size={14} /> Prev
              </button>
              <span className={styles.pageInfo}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button disabled={filters.page >= pagination.pages}
                onClick={() => setFilter('page', filters.page + 1)}
                className={styles.pageBtn}>
                Next <Icon name="arrowRight" size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
