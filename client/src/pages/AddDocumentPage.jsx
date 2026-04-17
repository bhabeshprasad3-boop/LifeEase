import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/document.service';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import styles from './DocumentFormPage.module.css';

const CATEGORIES = ['Identity','Vehicle','Education','Health','Finance','Property','Travel','Personal','Other'];

export default function AddDocumentPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ title:'', category:'Identity', tags:'', notes:'', issueDate:'', expiryDate:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!file) e.file = 'Please select a file to upload';
    return e;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setErrors(er => ({ ...er, file: '' })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title);
      fd.append('category', form.category);
      if (form.tags) fd.append('tags', form.tags);
      if (form.notes) fd.append('notes', form.notes);
      if (form.issueDate) fd.append('issueDate', form.issueDate);
      if (form.expiryDate) fd.append('expiryDate', form.expiryDate);
      await documentService.create(fd);
      navigate('/documents');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally { setLoading(false); }
  };

  const change = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <Icon name="arrowLeft" size={15} /> Back
        </button>
        <div>
          <h1 className={styles.title}>Upload Document</h1>
          <p className={styles.subtitle}>Add a new file to your secure vault.</p>
        </div>
      </div>

      {apiError && <div className={styles.apiError}>{apiError}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Drop zone */}
        <div
          className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${errors.file ? styles.zoneError : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={e => { setFile(e.target.files[0]); setErrors(er => ({ ...er, file: '' })); }}
          />
          {file ? (
            <div className={styles.fileRow}>
              <div className={styles.fileIconWrap}>
                <Icon name={file.type.includes('pdf') ? 'fileText' : 'image'} size={20} />
              </div>
              <div className={styles.fileInfo}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" className={styles.removeBtn}
                onClick={e => { e.stopPropagation(); setFile(null); }}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ) : (
            <div className={styles.dropInner}>
              <div className={styles.dropIcon}>
                <Icon name="upload" size={22} />
              </div>
              <p className={styles.dropTitle}>Drag & drop your file here</p>
              <p className={styles.dropHint}>or click to browse · PDF, JPG, PNG · Max 10 MB</p>
            </div>
          )}
        </div>
        {errors.file && <p className={styles.fieldError}>{errors.file}</p>}

        <div className={styles.grid2}>
          <InputField label="Document Title *" id="title" value={form.title}
            onChange={change('title')} error={errors.title} placeholder="e.g. Passport 2024" />
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category *</label>
            <select className={styles.select} value={form.category} onChange={change('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <InputField label="Issue Date" id="issueDate" type="date"
            value={form.issueDate} onChange={change('issueDate')} />
          <InputField label="Expiry Date" id="expiryDate" type="date"
            value={form.expiryDate} onChange={change('expiryDate')}
            hint="Required for renewal reminders" />
        </div>

        <InputField label="Tags" id="tags" value={form.tags} onChange={change('tags')}
          placeholder="e.g. travel, official, important (comma-separated)" />

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Notes</label>
          <textarea className={styles.textarea} value={form.notes} onChange={change('notes')}
            placeholder="Additional notes…" rows={3} />
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>
            <Icon name="upload" size={14} /> Upload to Vault
          </Button>
        </div>
      </form>
    </div>
  );
}
