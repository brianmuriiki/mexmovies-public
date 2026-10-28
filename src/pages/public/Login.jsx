import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import ErrorBox from '../../components/common/ErrorBox.jsx';

export default function Login() {
  usePageTitle('Log in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(form.email, form.password);
      const home = user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/';
      navigate(location.state?.from || home, { replace: true });
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <div className="page-narrow">
      <form className="stack" onSubmit={submit}>
        <h1>Log in</h1>
        <ErrorBox error={error} />
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted"><Link to="/forgot-password" style={{ textDecoration: 'underline' }}>Forgot your password?</Link></p>
        <p className="muted">New here? <Link to="/signup" style={{ textDecoration: 'underline' }}>Create a free account</Link></p>
      </form>
    </div>
  );
}
