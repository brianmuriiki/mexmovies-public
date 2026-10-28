import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import ErrorBox from '../../components/common/ErrorBox.jsx';

export default function ResetPassword() {
  usePageTitle('Choose a new password');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.auth.resetPassword({ token, password });
      toast('Password updated. You can log in now.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="page-narrow stack">
        <h1>Reset link missing</h1>
        <p className="muted">Open the link from your email, or <Link to="/forgot-password" style={{ textDecoration: 'underline' }}>request a new one</Link>.</p>
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <form className="stack" onSubmit={submit}>
        <h1>Choose a new password</h1>
        <ErrorBox error={error} />
        <div className="field">
          <label htmlFor="password">New password</label>
          <input id="password" className="input" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="hint">At least 8 characters.</span>
        </div>
        <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    </div>
  );
}
