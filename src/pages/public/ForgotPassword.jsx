import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import Turnstile, { turnstileEnabled } from '../../components/common/Turnstile.jsx';

export default function ForgotPassword() {
  usePageTitle('Forgot password');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.auth.forgotPassword({ email, ...(token ? { turnstileToken: token } : {}) });
      setSent(true);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-narrow">
      <form className="stack" onSubmit={submit}>
        <h1>Reset your password</h1>
        {sent ? (
          <div className="notice notice-good">If that email has an account, a reset link is on its way. It works for one hour.</div>
        ) : (
          <>
            <p className="muted">Enter your email and we will send you a link to choose a new password.</p>
            <ErrorBox error={error} />
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Turnstile onToken={setToken} />
            <button className="btn btn-primary btn-lg" disabled={busy || (turnstileEnabled && !token)}>{busy ? 'Sending…' : 'Send reset link'}</button>
          </>
        )}
        <p className="muted"><Link to="/login" style={{ textDecoration: 'underline' }}>Back to log in</Link></p>
      </form>
    </div>
  );
}
