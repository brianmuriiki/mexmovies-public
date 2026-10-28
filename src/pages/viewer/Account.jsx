import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import Modal from '../../components/common/Modal.jsx';
import { errorMessage, formatDate } from '../../utils/format.js';

export default function Account() {
  usePageTitle('My account');
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    api.subscription().then((r) => setSubscription(r.data)).catch(() => {});
  }, []);

  const run = async (key, fn, success) => {
    setErrors((e) => ({ ...e, [key]: null }));
    try {
      await fn();
      if (success) toast(success, 'success');
    } catch (err) {
      setErrors((e) => ({ ...e, [key]: err }));
    }
  };

  const saveName = (e) => {
    e.preventDefault();
    run('name', async () => setUser((await api.account.update({ name })).data), 'Name saved');
  };
  const savePassword = (e) => {
    e.preventDefault();
    run('pw', async () => {
      await api.account.changePassword(pw);
      setPw({ currentPassword: '', newPassword: '' });
    }, 'Password changed');
  };
  const resend = async () => {
    try {
      await api.auth.resendVerification();
      toast('Confirmation email sent', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };
  const remove = (e) => {
    e.preventDefault();
    run('delete', async () => {
      await api.account.remove(deletePassword);
      setUser(null);
      navigate('/', { replace: true });
    });
  };

  return (
    <div className="container page" style={{ maxWidth: 720 }}>
      <h1>My account</h1>

      <section className="card stack">
        <h2 style={{ fontSize: 22 }}>Profile</h2>
        <div className="row-flex">
          <span>{user.email}</span>
          {user.emailVerified ? <span className="badge badge-good">Email confirmed</span> : <span className="badge badge-warn">Email not confirmed</span>}
          {!user.emailVerified && <button type="button" className="btn btn-sm" onClick={resend}>Resend confirmation</button>}
        </div>
        <form className="stack" onSubmit={saveName}>
          <ErrorBox error={errors.name} />
          <div className="field">
            <label htmlFor="acc-name">Display name</label>
            <input id="acc-name" className="input" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="btn" style={{ alignSelf: 'flex-start' }}>Save name</button>
        </form>
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: 22 }}>Subscription</h2>
        {subscription?.active ? (
          <p>Active: {subscription.plan}. {subscription.daysRemaining} days left (until {formatDate(subscription.endsAt)}).</p>
        ) : (
          <p className="muted">You do not have a subscription. Everything on mexMovies is free to watch.</p>
        )}
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: 22 }}>Change password</h2>
        <form className="stack" onSubmit={savePassword}>
          <ErrorBox error={errors.pw} />
          <input className="sr-only" type="text" name="username" autoComplete="username" value={user.email} readOnly tabIndex={-1} aria-hidden="true" />
          <div className="field">
            <label htmlFor="cur">Current password</label>
            <input id="cur" className="input" type="password" autoComplete="current-password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="new">New password</label>
            <input id="new" className="input" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
          <button className="btn" style={{ alignSelf: 'flex-start' }}>Change password</button>
        </form>
      </section>

      {user.role === 'viewer' && (
        <section className="card stack">
          <h2 style={{ fontSize: 22 }}>Delete account</h2>
          <p className="muted">This removes your account, watchlist, progress, rewards, and points. It cannot be undone.</p>
          <button type="button" className="btn btn-danger" style={{ alignSelf: 'flex-start' }} onClick={() => setDeleting(true)}>Delete my account</button>
        </section>
      )}

      {deleting && (
        <Modal title="Delete your account?" onClose={() => setDeleting(false)}>
          <form className="stack" onSubmit={remove}>
            <ErrorBox error={errors.delete} />
            <input className="sr-only" type="text" name="username" autoComplete="username" value={user.email} readOnly tabIndex={-1} aria-hidden="true" />
            <div className="field">
              <label htmlFor="del-pw">Enter your password to confirm</label>
              <input id="del-pw" className="input" type="password" required value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
            </div>
            <button className="btn btn-danger">Delete everything</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
