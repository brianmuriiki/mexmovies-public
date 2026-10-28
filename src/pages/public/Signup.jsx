import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import Turnstile, { turnstileEnabled } from '../../components/common/Turnstile.jsx';

export default function Signup() {
  usePageTitle('Create account');
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', terms: false });
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({ name: form.name, email: form.email, password: form.password, ...(token ? { turnstileToken: token } : {}) });
      toast('Welcome to mexMovies! Check your email to confirm your address.', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <div className="page-narrow">
      <form className="stack" onSubmit={submit}>
        <h1>Create your free account</h1>
        <p className="muted">Save movies to a watchlist, pick up where you left off, and earn rewards as you watch.</p>
        <ErrorBox error={error} />
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" className="input" autoComplete="name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <span className="hint">At least 8 characters.</span>
        </div>
        <label className="check" style={{ borderRadius: 8 }}>
          <input type="checkbox" required checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
          <span>I agree to the <Link to="/terms" target="_blank" style={{ textDecoration: 'underline' }}>terms</Link> and the <Link to="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>privacy policy</Link>. Points have no cash value and may change.</span>
        </label>
        <Turnstile onToken={setToken} />
        <button className="btn btn-primary btn-lg" disabled={busy || (turnstileEnabled && !token)}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted">Already have an account? <Link to="/login" style={{ textDecoration: 'underline' }}>Log in</Link></p>
      </form>
    </div>
  );
}
