import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import Pagination from '../../components/dashboard/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import UserRewardsModal from '../../components/dashboard/UserRewardsModal.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage, formatDate } from '../../utils/format.js';

const TABS = [['manager', 'Managers'], ['viewer', 'Viewers'], ['', 'Both']];

export default function AdminUsers() {
  usePageTitle('Users');
  const { toast } = useToast();
  const [role, setRole] = useState('manager');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [dialog, setDialog] = useState(null); // { type, user? }
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api.admin.users.list({ role, q: query, page, limit: 20 }).then(setData).catch((err) => { toast(errorMessage(err), 'error'); setData({ data: [], pages: 1 }); });
  }, [role, query, page, toast]);
  useEffect(() => { setData(null); load(); }, [load]);

  const open = (type, user, initial = {}) => { setDialog({ type, user }); setForm(initial); setError(null); };
  const close = () => setDialog(null);

  const run = async (fn, success) => {
    setError(null);
    try {
      await fn();
      toast(success, 'success');
      close();
      load();
    } catch (err) {
      setError(err);
    }
  };

  const toggleActive = (u) => run(() => api.admin.users.update(u._id, { isActive: !u.isActive }), u.isActive ? 'Account disabled' : 'Account enabled');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <div className="spread">
        <h1>Users</h1>
        <button type="button" className="btn btn-primary" onClick={() => open('create', null, { name: '', email: '', password: '' })}>Add a manager</button>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map(([value, label]) => (
          <button key={label} type="button" role="tab" aria-selected={role === value} className={`chip ${role === value ? 'active' : ''}`} onClick={() => { setRole(value); setPage(1); }}>{label}</button>
        ))}
      </div>
      <form className="row-flex" onSubmit={(e) => { e.preventDefault(); setQuery(q); setPage(1); }} role="search">
        <input className="input" style={{ maxWidth: 320 }} type="search" aria-label="Search by name or email" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn">Search</button>
      </form>

      {!data ? <PageLoader /> : data.data.length === 0 ? (
        <div className="empty">No users found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {data.data.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong><div className="hint">{u.email} {u.emailVerified ? '· confirmed' : '· not confirmed'}</div></td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>{u.isActive ? <span className="badge badge-good">Active</span> : <span className="badge badge-bad">Disabled</span>}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="actions">
                      <button type="button" className="btn btn-sm" onClick={() => toggleActive(u)}>{u.isActive ? 'Disable' : 'Enable'}</button>
                      <button type="button" className="btn btn-sm" onClick={() => open('password', u, { password: '' })}>Reset password</button>
                      {u.role === 'viewer' && <button type="button" className="btn btn-sm" onClick={() => open('rewards', u)}>Rewards</button>}
                      {u.role === 'viewer' && <button type="button" className="btn btn-sm" onClick={() => open('points', u, { amount: '', reason: '' })}>Adjust points</button>}
                      {u.role === 'viewer' && <button type="button" className="btn btn-sm" onClick={() => open('subscription', u, { days: 30, reason: '' })}>Subscription</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={page} pages={data.pages || 1} onChange={setPage} />}

      {dialog?.type === 'rewards' && <UserRewardsModal user={dialog.user} onClose={close} />}
      {dialog?.type === 'create' && (
        <Modal title="Add a manager" onClose={close}>
          <form className="stack" onSubmit={(e) => { e.preventDefault(); run(() => api.admin.users.createManager({ name: form.name, email: form.email, password: form.password }), 'Manager created'); }}>
            <ErrorBox error={error} />
            <div className="field"><label htmlFor="u-name">Name</label><input id="u-name" className="input" required minLength={2} value={form.name} onChange={set('name')} /></div>
            <div className="field"><label htmlFor="u-email">Email</label><input id="u-email" className="input" type="email" required value={form.email} onChange={set('email')} /></div>
            <div className="field"><label htmlFor="u-pw">Temporary password</label><input id="u-pw" className="input" type="text" required minLength={8} maxLength={72} value={form.password} onChange={set('password')} /><span className="hint">Share it privately and ask them to change it after logging in.</span></div>
            <button className="btn btn-primary">Create manager</button>
          </form>
        </Modal>
      )}
      {dialog?.type === 'password' && (
        <Modal title={`Reset password for ${dialog.user.name}`} onClose={close}>
          <form className="stack" onSubmit={(e) => { e.preventDefault(); run(() => api.admin.users.update(dialog.user._id, { password: form.password }), 'Password reset'); }}>
            <ErrorBox error={error} />
            <div className="field"><label htmlFor="u-newpw">New password</label><input id="u-newpw" className="input" type="text" required minLength={8} maxLength={72} value={form.password} onChange={set('password')} /></div>
            <button className="btn btn-primary">Reset password</button>
          </form>
        </Modal>
      )}
      {dialog?.type === 'points' && (
        <Modal title={`Adjust points for ${dialog.user.name}`} onClose={close}>
          <form className="stack" onSubmit={(e) => { e.preventDefault(); run(() => api.admin.adjustPoints({ userId: dialog.user._id, amount: Number(form.amount), reason: form.reason.trim() }), 'Points adjusted'); }}>
            <ErrorBox error={error} />
            <div className="field"><label htmlFor="p-amount">Points to add (negative to remove)</label><input id="p-amount" className="input" type="number" required value={form.amount} onChange={set('amount')} /></div>
            <div className="field"><label htmlFor="p-reason">Reason (kept in the history)</label><input id="p-reason" className="input" required minLength={5} value={form.reason} onChange={set('reason')} /></div>
            <button className="btn btn-primary">Save adjustment</button>
          </form>
        </Modal>
      )}
      {dialog?.type === 'subscription' && (
        <Modal title={`Grant a subscription to ${dialog.user.name}`} onClose={close}>
          <form className="stack" onSubmit={(e) => { e.preventDefault(); run(() => api.admin.grantSubscription({ userId: dialog.user._id, days: Number(form.days), reason: form.reason.trim() }), 'Subscription granted'); }}>
            <ErrorBox error={error} />
            <div className="field"><label htmlFor="s-days">Days</label><input id="s-days" className="input" type="number" min="1" max="3650" required value={form.days} onChange={set('days')} /></div>
            <div className="field"><label htmlFor="s-reason">Reason</label><input id="s-reason" className="input" required minLength={5} value={form.reason} onChange={set('reason')} /></div>
            <button className="btn btn-primary">Grant subscription</button>
          </form>
        </Modal>
      )}
    </>
  );
}
