import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import StatusBadge from '../../components/dashboard/StatusBadge.jsx';
import Pagination from '../../components/dashboard/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage, formatDate } from '../../utils/format.js';

const TABS = [['pending', 'Pending'], ['', 'All'], ['published', 'Published'], ['draft', 'Drafts'], ['rejected', 'Rejected'], ['unpublished', 'Unpublished']];

export default function AdminMovies() {
  usePageTitle('Movies');
  const { toast } = useToast();
  const [status, setStatus] = useState('pending');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [dialog, setDialog] = useState(null); // { type: 'approve' | 'reject', movie }
  const [days, setDays] = useState(0);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    api.admin.movies.list({ status, q: query, page, limit: 20 }).then(setData).catch((err) => { toast(errorMessage(err), 'error'); setData({ data: [], pages: 1 }); });
  }, [status, query, page, toast]);
  useEffect(() => { setData(null); load(); }, [load]);

  const act = async (fn, success) => {
    try {
      await fn();
      toast(success, 'success');
      setDialog(null);
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const close = () => { setDialog(null); setDays(0); setReason(''); };

  return (
    <>
      <div className="spread">
        <h1>Movies</h1>
        <Link to="/admin/movies/new" className="btn btn-primary">Add a movie</Link>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map(([value, label]) => (
          <button key={value || 'all'} type="button" role="tab" aria-selected={status === value} className={`chip ${status === value ? 'active' : ''}`} onClick={() => { setStatus(value); setPage(1); }}>{label}</button>
        ))}
      </div>
      <form className="row-flex" onSubmit={(e) => { e.preventDefault(); setQuery(q); setPage(1); }} role="search">
        <input className="input" style={{ maxWidth: 320 }} type="search" aria-label="Search by title" placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn">Search</button>
      </form>

      {!data ? <PageLoader /> : data.data.length === 0 ? (
        <div className="empty">No movies here.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Movie</th><th>Status</th><th>Added by</th><th>Updated</th><th>Actions</th></tr></thead>
            <tbody>
              {data.data.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className="cell-title">
                      {m.posterUrl && <img className="thumb" src={m.posterUrl} alt="" loading="lazy" />}
                      <div>
                        <strong>{m.title}</strong> {m.featured && <span className="badge badge-accent">Featured</span>}
                        <div className="hint">{m.releaseYear} · {m.licenseType} · {m.videoSource === 'r2' ? 'Uploaded file' : m.videoSource}</div>
                        <div className="hint">Proof: {m.licenseProof}</div>
                        {m.publicAt && new Date(m.publicAt) > new Date() && <div className="hint">Early access until {formatDate(m.publicAt)}</div>}
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={m.status} /></td>
                  <td>{m.addedBy?.name || '—'}</td>
                  <td>{formatDate(m.updatedAt)}</td>
                  <td>
                    <div className="actions">
                      {['pending', 'unpublished'].includes(m.status) && <button type="button" className="btn btn-sm btn-primary" onClick={() => setDialog({ type: 'approve', movie: m })}>{m.status === 'pending' ? 'Approve' : 'Publish again'}</button>}
                      {m.status === 'pending' && <button type="button" className="btn btn-sm btn-danger" onClick={() => setDialog({ type: 'reject', movie: m })}>Reject</button>}
                      {m.status === 'published' && <button type="button" className="btn btn-sm" onClick={() => act(() => api.admin.movies.unpublish(m._id), 'Unpublished')}>Unpublish</button>}
                      {m.status === 'published' && <button type="button" className="btn btn-sm" onClick={() => act(() => api.admin.movies.update(m._id, { featured: !m.featured }), m.featured ? 'Removed from featured' : 'Now featured')}>{m.featured ? 'Unfeature' : 'Feature'}</button>}
                      <Link to={`/admin/movies/${m._id}/edit`} className="btn btn-sm">Edit</Link>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => window.confirm(`Delete "${m.title}" for good?`) && act(() => api.admin.movies.remove(m._id), 'Deleted')}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={page} pages={data.pages || 1} onChange={setPage} />}

      {dialog?.type === 'approve' && (
        <Modal title={`Publish “${dialog.movie.title}”`} onClose={close}>
          <p className="muted">Check the license proof first: {dialog.movie.licenseProof}</p>
          <div className="field">
            <label htmlFor="ea-days">Early access for Platinum members (days)</label>
            <input id="ea-days" className="input" type="number" min="0" max="30" value={days} onChange={(e) => setDays(Number(e.target.value))} />
            <span className="hint">0 publishes to everyone now. Up to 30 days.</span>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => act(() => api.admin.movies.approve(dialog.movie._id, days), days ? `Published with ${days} days of early access` : 'Published')}>Publish</button>
        </Modal>
      )}
      {dialog?.type === 'reject' && (
        <Modal title={`Reject “${dialog.movie.title}”`} onClose={close}>
          <div className="field">
            <label htmlFor="rej-reason">Reason (the manager will see this)</label>
            <textarea id="rej-reason" className="textarea" required minLength={5} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <button type="button" className="btn btn-danger" disabled={reason.trim().length < 5} onClick={() => act(() => api.admin.movies.reject(dialog.movie._id, reason.trim()), 'Rejected')}>Reject movie</button>
        </Modal>
      )}
    </>
  );
}
