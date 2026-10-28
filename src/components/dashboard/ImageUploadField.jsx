import { useState } from 'react';
import { api } from '../../api/index.js';
import { uploadFile } from '../../api/client.js';
import { errorMessage } from '../../utils/format.js';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// An image link field with an "Upload an image" button next to it.
export default function ImageUploadField({ id, label, kind, value, onChange, required }) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be chosen again
    if (!file) return;
    setError('');
    if (!TYPES.includes(file.type)) {
      setError('Images must be JPEG, PNG, or WebP.');
      return;
    }
    setBusy(true);
    setPct(0);
    try {
      const { data: s } = await api.manager.signImage({ kind, fileName: file.name, contentType: file.type, sizeBytes: file.size });
      await uploadFile(s.uploadUrl, file, s.headers, setPct);
      await api.manager.completeImage(s.key);
      onChange(s.publicUrl);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" type="url" required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste an image link, or upload one below" />
      <div className="row-flex">
        <label className="btn btn-sm" style={{ cursor: busy ? 'wait' : 'pointer' }}>
          Upload an image
          <input type="file" accept={TYPES.join(',')} className="sr-only" onChange={onFile} disabled={busy} />
        </label>
        {busy && <span className="muted" role="status">Uploading {pct}%</span>}
      </div>
      {error && <span className="hint" style={{ color: '#fca5a5' }} role="alert">{error}</span>}
    </div>
  );
}
