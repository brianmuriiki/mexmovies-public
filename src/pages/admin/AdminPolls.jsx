import { useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage, formatDate } from '../../utils/format.js';

const blank = () => ({ title: '', description: '', closesAt: '', options: [{ title: '' }, { title: '' }] });

export default function AdminPolls() {
  usePageTitle('Polls');
  const { toast } = useToast();
  const [polls, setPolls] = useState(null);
  const [form, setForm] = useState(blank());
  const [error, setError] = useState(null);

  const load = () => api.admin.polls.list().then((r) => setPolls(r.data)).catch(() => setPolls([]));
  useEffect(() => { load(); }, []);

  const setOption = (i, value) => setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? { title: value } : o)) }));

  const create = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.admin.polls.create({
        title: form.title.trim(),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
        ...(form.closesAt ? { closesAt: new Date(form.closesAt).toISOString() } : {}),
        options: form.options.map((o) => ({ title: o.title.trim() })).filter((o) => o.title),
      });
      setForm(blank());
      toast('Poll created', 'success');
      load();
    } catch (err) {
      setError(err);
    }
  };

  const act = async (fn, success) => {
    try {
      await fn();
      toast(success, 'success');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <>
      <h1>Polls</h1>
      <p className="muted">Gold and Platinum members vote on which movies to add next.</p>

      <form className="card stack" onSubmit={create}>
        <h2 style={{ fontSize: 22 }}>New poll</h2>
        <ErrorBox error={error} />
        <div className="field"><label htmlFor="poll-title">Question</label><input id="poll-title" className="input" required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Which film should we add next?" /></div>
        <div className="field"><label htmlFor="poll-desc">Description (optional)</label><input id="poll-desc" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="field"><label htmlFor="poll-close">Closes on (optional)</label><input id="poll-close" className="input" type="datetime-local" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} /></div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend className="label" style={{ marginBottom: 8 }}>Options (2 to 10)</legend>
          {form.options.map((o, i) => (
            <div key={i} className="row-flex">
              <input className="input" style={{ flex: 1 }} aria-label={`Option ${i + 1}`} value={o.title} onChange={(e) => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
              {form.options.length > 2 && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }))}>Remove</button>}
            </div>
          ))}
          {form.options.length < 10 && <button type="button" className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setForm((f) => ({ ...f, options: [...f.options, { title: '' }] }))}>Add option</button>}
        </fieldset>
        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Create poll</button>
      </form>

      {polls === null ? <PageLoader /> : polls.length === 0 ? <div className="empty">No polls yet.</div> : polls.map((p) => (
        <section key={p.id} className="card stack">
          <div className="spread">
            <h2 style={{ fontSize: 20 }}>{p.title}</h2>
            <div className="row-flex">
              {p.isOpen ? <span className="badge badge-good">Open</span> : <span className="badge">Closed</span>}
              {p.closesAt && <span className="muted">Closes {formatDate(p.closesAt)}</span>}
              <span className="muted">{p.totalVotes} votes</span>
            </div>
          </div>
          {p.options.map((o) => {
            const percent = p.totalVotes ? Math.round((o.votes / p.totalVotes) * 100) : 0;
            return (
              <div key={o.id}>
                <div className="spread"><span>{o.title}</span><span className="muted">{o.votes} ({percent}%)</span></div>
                <div className="bar" aria-hidden="true"><div style={{ width: `${percent}%` }} /></div>
              </div>
            );
          })}
          <div className="actions">
            {p.isOpen && <button type="button" className="btn btn-sm" onClick={() => act(() => api.admin.polls.close(p.id), 'Poll closed')}>Close poll</button>}
            <button type="button" className="btn btn-sm btn-danger" onClick={() => window.confirm('Delete this poll and its votes?') && act(() => api.admin.polls.remove(p.id), 'Poll deleted')}>Delete</button>
          </div>
        </section>
      ))}
    </>
  );
}
