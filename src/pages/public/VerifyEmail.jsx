import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';

export default function VerifyEmail() {
  usePageTitle('Confirm email');
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, setUser } = useAuth();
  const [state, setState] = useState(token ? 'working' : 'missing'); // working | done | failed | missing
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true; // the link works only once, so never send it twice
    api.auth
      .verifyEmail(token)
      .then(() => {
        setState('done');
        if (user) setUser({ ...user, emailVerified: true });
      })
      .catch(() => setState('failed'));
  }, [token, user, setUser]);

  return (
    <div className="page-narrow stack">
      {state === 'working' && <h1>Confirming your email…</h1>}
      {state === 'done' && (
        <>
          <h1>Email confirmed</h1>
          <p className="muted">Thank you. Your email address is now confirmed.</p>
          <Link to="/" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Start watching</Link>
        </>
      )}
      {(state === 'failed' || state === 'missing') && (
        <>
          <h1>This link did not work</h1>
          <p className="muted">It may have expired or already been used. Log in and request a new confirmation email from your account page.</p>
          <Link to="/account" className="btn" style={{ alignSelf: 'flex-start' }}>Go to my account</Link>
        </>
      )}
    </div>
  );
}
