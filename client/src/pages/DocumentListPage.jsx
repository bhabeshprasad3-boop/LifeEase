import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/document.service';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import styles from './DocumentListPage.module.css';

const CATEGORIES = ['All', 'Identity', 'Vehicle', 'Education', 'Health', 'Finance', 'Property', 'Travel', 'Personal', 'Other'];
const STATUSES = ['All', 'Active', 'Expiring Soon', 'Expired', 'Archived'];
const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Nearest Expiry', value: 'nearest-expiry' },
];

const ICONS = { Identity:'🪪',Vehicle:'🚗',Education:'🎓',Health:'❤️‍🩹',Finance:'💰',Property:'🏠',Travel:'✈️',Personal:'📌',Other:'📄' };

export default function DocumentListPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', category: 'All', status: '', archived: '', sort: 'newest', page: 1,
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
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this document permanently?')) return;
    await documentService.delete(id);
    fetchDocs();
  };

  const handleArchive = async (e, doc) => {
    e.stopPropagation();
    if (doc.archived) await documentService.unarchive(doc._id);
    else await documentService.archive(doc._id);
    fetchDocs();
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Document Library</h1>
          <p className={styles.subtitle}>Manage and access your important files.</p>
        </div>
        <Button onClick={() => navigate('/documents/add')}>+ Upload Document</Button>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="🔍  Search by title or tag..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        <select className={styles.select} value={filters.category} onChange={e => setFilter('category', e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={styles.select} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={styles.select} value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Category Chips */}
      <div className={styles.catChips}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`${styles.chip} ${filters.category === c ? styles.chipActive : ''}`}
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
        <EmptyState icon="📂" title="No documents found"
          message="Try adjusting your filters or upload your first document."
          action={<Button onClick={() => navigate('/documents/add')}>Upload Document</Button>} />
      ) : (
        <>
          <div className={styles.grid}>
            {docs.map(doc => (
              <div key={doc._id} className={styles.card}
                onClick={() => navigate(`/documents/${doc._id}`)} role="button" tabIndex={0}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>{ICONS[doc.category] || '📄'}</div>
                  <StatusBadge status={doc.status} />
                </div>
                <h3 className={styles.cardTitle}>{doc.title}</h3>
                <p className={styles.cardMeta}>
                  {doc.category} · {doc.fileType?.toUpperCase()}
                  {doc.expiryDate && ` · Expires ${new Date(doc.expiryDate).toLocaleDateString()}`}
                </p>
                {doc.tags?.length > 0 && (
                  <div className={styles.cardTags}>
                    {doc.tags.slice(0, 3).map(t => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                )}
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <button className={styles.actionBtn} onClick={() => navigate(`/documents/${doc._id}/edit`)} title="Edit">✏️</button>
                  <button className={styles.actionBtn} onClick={e => handleArchive(e, doc)} title={doc.archived ? 'Unarchive' : 'Archive'}>
                    {doc.archived ? '📤' : '📥'}
                  </button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={e => handleDelete(e, doc._id)} title="Delete">🗑</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={filters.page <= 1} onClick={() => setFilter('page', filters.page - 1)} className={styles.pageBtn}>← Prev</button>
              <span className={styles.pageInfo}>Page {pagination.page} of {pagination.pages} · {pagination.total} docs</span>
              <button disabled={filters.page >= pagination.pages} onClick={() => setFilter('page', filters.page + 1)} className={styles.pageBtn}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
