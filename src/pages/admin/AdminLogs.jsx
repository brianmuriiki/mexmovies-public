import { useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import Pagination from '../../components/dashboard/Pagination.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { formatDateTime } from '../../utils/format.js';

const ACTIONS = ['', 'login', 'movie.create', 'movie.update', 'movie.submit', 'movie.approve', 'movie.reject', 'movie.unpublish', 'movie.delete', 'movie.upload', 'user.create', 'user.update', 'user.disable', 'user.enable', 'points.adjust', 'subscription.grant', 'poll.create', 'poll.close', 'poll.delete'];

const summary = (d) => (d ? Object.entries(d).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ') : '');

export default function AdminLogs() {
  usePageTitle('Activity log');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    api.admin.logs({ action, page, limit: 30 }).then(setData).catch(() => setData({ data: [], pages: 1 }));
  }, [action, page]);

  return (
    <>
      <h1>Activity log</h1>
      <p className="muted">Entries are deleted automatically after 90 days.</p>
      <div className="field" style={{ maxWidth: 280 }}>
        <label htmlFor="log-action">Show</label>
        <select id="log-action" className="select" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
          {ACTIONS.map((a) => <option key={a} value={a}>{a || 'Everything'}</option>)}
        </select>
      </div>
      {!data ? <PageLoader /> : data.data.length === 0 ? <div className="empty">Nothing logged yet.</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>
              {data.data.map((l) => (
                <tr key={l._id}>
                  <td>{formatDateTime(l.createdAt)}</td>
                  <td>{l.actor?.name || 'Deleted user'}<div className="hint">{l.actor?.role}</div></td>
                  <td><span className="badge">{l.action}</span></td>
                  <td className="muted">{summary(l.details)}</td>
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
