import { useState } from 'react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../common/Modal.jsx';
import ErrorBox from '../common/ErrorBox.jsx';
import Turnstile, { turnstileEnabled } from '../common/Turnstile.jsx';

const REASONS = {
  broken: 'The video does not play',
  infringement: 'It uses my work without permission',
  inappropriate: 'Inappropriate content',
  other: 'Something else',
};

export default function ReportButton({ movie, className = 'btn btn-ghost btn-lg' }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ reason: 'broken', message: '', email: '' });
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = {
        reason: form.reason,
        ...(form.message.trim() ? { message: form.message.trim() } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(token ? { turnstileToken: token } : {}),
      };
      const r = await api.report(movie._id, body);
      toast(r.message, 'success');
      setOpen(false);
      setForm({ reason: 'broken', message: '', email: '' });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const needsEmail = form.reason === 'infringement' && !user;

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>Report a problem</button>
      {open && (
        <Modal title={`Report “${movie.title}”`} onClose={() => setOpen(false)}>
          <form className="stack" onSubmit={submit}>
            <ErrorBox error={error} />
            <div className="field">
              <label htmlFor="rp-reason">What is wrong?</label>
              <select id="rp-reason" className="select" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                {Object.entries(REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {form.reason === 'infringement' && (
              <div className="notice">If you own the rights to this movie, tell us which work it is and how you hold the rights, and add your email so we can reply. We review every complaint.</div>
            )}
            <div className="field">
              <label htmlFor="rp-msg">Details {form.reason === 'infringement' ? '' : '(optional)'}</label>
              <textarea id="rp-msg" className="textarea" maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="rp-email">Your email {needsEmail ? '' : '(optional)'}</label>
              <input id="rp-email" className="input" type="email" required={needsEmail} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <span className="hint">Only used to follow up on this report.</span>
            </div>
            <Turnstile onToken={setToken} />
            <button className="btn btn-primary" disabled={busy || (turnstileEnabled && !token)}>{busy ? 'Sending…' : 'Send report'}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
