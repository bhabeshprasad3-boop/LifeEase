import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/document.service';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import styles from './DocumentFormPage.module.css';

const CATEGORIES = ['Identity','Vehicle','Education','Health','Finance','Property','Travel','Personal','Other'];

export default function AddDocumentPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({
    title: '', category: 'Identity', tags: '', notes: '',
    issueDate: '', expiryDate: '',
  });
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
    if (f) setFile(f);
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
    } finally {
      setLoading(false);
    }
  };

  const change = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 className={styles.title}>Secure Document</h1>
          <p className={styles.subtitle}>Add a new file to your vault.</p>
        </div>
      </div>

      {apiError && <div className={styles.apiError}>{apiError}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Upload Zone */}
        <div
          className={`${styles.uploadZone} ${dragging ? styles.dragging : ''} ${errors.file ? styles.uploadError : ''}`}
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
            <div className={styles.fileSelected}>
              <span className={styles.fileIcon}>📎</span>
              <div>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" className={styles.removeFile} onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
            </div>
          ) : (
            <>
              <div className={styles.uploadIcon}>☁</div>
              <p className={styles.uploadText}>Drag & Drop file here</p>
              <p className={styles.uploadHint}>or click to browse · PDF, JPG, PNG up to 10MB</p>
            </>
          )}
        </div>
        {errors.file && <p className={styles.fieldError}>{errors.file}</p>}

        {/* Metadata */}
        <div className={styles.grid2}>
          <InputField label="Document Title *" id="title" value={form.title}
            onChange={change('title')} error={errors.title} placeholder="e.g. Passport 2024" />
          <div className={styles.formGroup}>
            <label className={styles.label}>Category *</label>
            <select className={styles.select} value={form.category} onChange={change('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <InputField label="Issue Date" id="issueDate" type="date"
            value={form.issueDate} onChange={change('issueDate')} />
          <InputField label="Expiry Date" id="expiryDate" type="date"
            value={form.expiryDate} onChange={change('expiryDate')}
            hint="Set this to receive renewal reminders" />
        </div>

        <InputField label="Tags" id="tags" value={form.tags}
          onChange={change('tags')} placeholder="travel, official, important (comma-separated)"
          hint="Helps with search and filtering" />

        <div className={styles.formGroup}>
          <label className={styles.label}>Notes</label>
          <textarea className={styles.textarea} value={form.notes} onChange={change('notes')}
            placeholder="Any additional notes about this document..." rows={3} />
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>Upload to Vault</Button>
        </div>
      </form>
    </div>
  );
}
