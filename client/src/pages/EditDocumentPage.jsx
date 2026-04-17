import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentService } from '../services/document.service';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import styles from './DocumentFormPage.module.css';

const CATEGORIES = ['Identity','Vehicle','Education','Health','Finance','Property','Travel','Personal','Other'];

export default function EditDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: 'Identity', tags: '', notes: '',
    issueDate: '', expiryDate: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    documentService.getById(id)
      .then(res => {
        const d = res.data.document;
        setForm({
          title: d.title || '',
          category: d.category || 'Identity',
          tags: (d.tags || []).join(', '),
          notes: d.notes || '',
          issueDate: d.issueDate ? d.issueDate.slice(0, 10) : '',
          expiryDate: d.expiryDate ? d.expiryDate.slice(0, 10) : '',
        });
      })
      .catch(() => setApiError('Failed to load document.'))
      .finally(() => setFetching(false));
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      const payload = {
        title: form.title,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        notes: form.notes,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
      };
      await documentService.update(id, payload);
      navigate(`/documents/${id}`);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const change = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  if (fetching) return <div style={{ padding: '3rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 className={styles.title}>Edit Document</h1>
          <p className={styles.subtitle}>Update document metadata.</p>
        </div>
      </div>

      {apiError && <div className={styles.apiError}>{apiError}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid2}>
          <InputField label="Document Title *" id="title" value={form.title}
            onChange={change('title')} error={errors.title} />
          <div className={styles.formGroup}>
            <label className={styles.label}>Category *</label>
            <select className={styles.select} value={form.category} onChange={change('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <InputField label="Issue Date" id="issueDate" type="date"
            value={form.issueDate} onChange={change('issueDate')} />
          <InputField label="Expiry Date" id="expiryDate" type="date"
            value={form.expiryDate} onChange={change('expiryDate')} />
        </div>

        <InputField label="Tags" id="tags" value={form.tags} onChange={change('tags')}
          placeholder="travel, official, important" hint="Comma-separated" />

        <div className={styles.formGroup}>
          <label className={styles.label}>Notes</label>
          <textarea className={styles.textarea} value={form.notes} onChange={change('notes')}
            placeholder="Additional notes..." rows={3} />
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
