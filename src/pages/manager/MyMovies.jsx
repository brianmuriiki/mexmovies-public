import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import StatusBadge from '../../components/dashboard/StatusBadge.jsx';
import Pagination from '../../components/dashboard/Pagination.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage, formatDate } from '../../utils/format.js';

const TABS = [['', 'All'], ['draft', 'Drafts'], ['pending', 'Pending'], ['published', 'Published'], ['rejected', 'Rejected']];

export default function MyMovies() {
  usePageTitle('My movies');
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  const load = useCallback(() => {
    api.manager.list({ status, page, limit: 20 }).then(setData).catch((err) => { toast(errorMessage(err), 'error'); setData({ data: [], pages: 1 }); });
  }, [status, page, toast]);
  useEffect(() => { setData(null); load(); }, [load]);

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
      <div className="spread">
        <h1>My movies</h1>
        <Link to="/manager/movies/new" className="btn btn-primary">Add a movie</Link>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={status === value} className={`chip ${status === value ? 'active' : ''}`} onClick={() => { setStatus(value); setPage(1); }}>{label}</button>
        ))}
      </div>
      {!data ? <PageLoader /> : data.data.length === 0 ? (
        <div className="empty">No movies here yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Movie</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead>
            <tbody>
              {data.data.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className="cell-title">
                      {m.posterUrl && <img className="thumb" src={m.posterUrl} alt="" loading="lazy" />}
                      <div>
                        <strong>{m.title}</strong>
                        <div className="hint">{m.releaseYear} · {m.videoSource === 'r2' ? 'Uploaded file' : m.videoSource}</div>
                        {m.status === 'rejected' && m.rejectionReason && <div className="hint" style={{ color: '#fca5a5' }}>Rejected: {m.rejectionReason}</div>}
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={m.status} /></td>
                  <td>{formatDate(m.updatedAt)}</td>
                  <td>
                    <div className="actions">
                      {['draft', 'pending', 'rejected'].includes(m.status) && <Link to={`/manager/movies/${m._id}/edit`} className="btn btn-sm">Edit</Link>}
                      {['draft', 'rejected'].includes(m.status) && <button type="button" className="btn btn-sm btn-primary" onClick={() => act(() => api.manager.submit(m._id), 'Submitted for approval')}>Submit</button>}
                      {m.status === 'published' && <Link to={`/movie/${m.slug}`} className="btn btn-sm">View</Link>}
                      {m.status === 'draft' && <button type="button" className="btn btn-sm btn-danger" onClick={() => window.confirm(`Delete "${m.title}"?`) && act(() => api.manager.remove(m._id), 'Deleted')}>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={page} pages={data.pages || 1} onChange={setPage} />}
    </>
  );
}
