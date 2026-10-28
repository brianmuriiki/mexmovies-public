import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import Pagination from '../../components/dashboard/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import StatusBadge from '../../components/dashboard/StatusBadge.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage, formatDateTime } from '../../utils/format.js';

const TABS = [['open', 'Open'], ['resolved', 'Resolved'], ['dismissed', 'Dismissed'], ['', 'All']];
const REASONS = { broken: 'Does not play', infringement: 'Rights complaint', inappropriate: 'Inappropriate', other: 'Other' };

export default function AdminReports() {
  usePageTitle('Reports');
  const { toast } = useToast();
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [dialog, setDialog] = useState(null); // { report, next }
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    api.admin.reports.list({ status, page, limit: 20 }).then(setData).catch((err) => { toast(errorMessage(err), 'error'); setData({ data: [], pages: 1 }); });
  }, [status, page, toast]);
  useEffect(() => { setData(null); load(); }, [load]);

  const close = () => { setDialog(null); setNote(''); };

  const act = async (fn, success) => {
    try {
      await fn();
      toast(success, 'success');
      close();
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <>
      <h1>Reports</h1>
      <p className="muted">Reports from viewers and rights holders. A rights complaint should be looked at quickly: unpublish the movie first if in doubt, then follow up.</p>
      <div className="tabs" role="tablist">
        {TABS.map(([value, label]) => (
          <button key={label} type="button" role="tab" aria-selected={status === value} className={`chip ${status === value ? 'active' : ''}`} onClick={() => { setStatus(value); setPage(1); }}>{label}</button>
        ))}
      </div>

      {!data ? <PageLoader /> : data.data.length === 0 ? <div className="empty">No reports here.</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Movie</th><th>Problem</th><th>From</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {data.data.map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.movie ? <><strong>{r.movie.title}</strong><div><StatusBadge status={r.movie.status} /></div></> : <span className="muted">Movie deleted</span>}
                  </td>
                  <td>
                    <span className={`badge ${r.reason === 'infringement' ? 'badge-bad' : ''}`}>{REASONS[r.reason]}</span>
                    {r.message && <div className="hint" style={{ maxWidth: 360, marginTop: 6 }}>{r.message}</div>}
                    {r.note && <div className="hint" style={{ marginTop: 6 }}>Note: {r.note}</div>}
                  </td>
                  <td>{r.user ? `${r.user.name} (${r.user.email})` : r.reporterEmail || 'Anonymous'}</td>
                  <td>{formatDateTime(r.createdAt)}{r.handledBy && <div className="hint">Handled by {r.handledBy.name}</div>}</td>
                  <td>
                    <div className="actions">
                      {r.status === 'open' ? (
                        <>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => setDialog({ report: r, next: 'resolved' })}>Resolve</button>
                          <button type="button" className="btn btn-sm" onClick={() => setDialog({ report: r, next: 'dismissed' })}>Dismiss</button>
                        </>
                      ) : (
                        <button type="button" className="btn btn-sm" onClick={() => act(() => api.admin.reports.update(r._id, { status: 'open' }), 'Report reopened')}>Reopen</button>
                      )}
                      {r.movie?.status === 'published' && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => window.confirm(`Take “${r.movie.title}” off the site?`) && act(() => api.admin.movies.unpublish(r.movie._id), 'Movie unpublished')}>Unpublish movie</button>
                      )}
                      {r.movie && <Link to={`/admin/movies/${r.movie._id}/edit`} className="btn btn-sm">Edit movie</Link>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={page} pages={data.pages || 1} onChange={setPage} />}

      {dialog && (
        <Modal title={dialog.next === 'resolved' ? 'Resolve report' : 'Dismiss report'} onClose={close}>
          <div className="field">
            <label htmlFor="rep-note">Note (optional, kept for your records)</label>
            <textarea id="rep-note" className="textarea" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => act(() => api.admin.reports.update(dialog.report._id, { status: dialog.next, ...(note.trim() ? { note: note.trim() } : {}) }), dialog.next === 'resolved' ? 'Report resolved' : 'Report dismissed')}>
            {dialog.next === 'resolved' ? 'Mark resolved' : 'Dismiss'}
          </button>
        </Modal>
      )}
    </>
  );
}
