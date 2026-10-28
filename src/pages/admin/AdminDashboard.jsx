import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage, formatBytes, STATUS_LABELS } from '../../utils/format.js';

export default function AdminDashboard() {
  usePageTitle('Admin');
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [storage, setStorage] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    api.admin.stats().then((r) => setStats(r.data)).catch(() => setStats({ movies: {}, users: {}, genres: 0 }));
    api.admin.storage().then((r) => setStorage(r.data)).catch(() => {});
    api.admin.rewards.stats().then((r) => setRewards(r.data)).catch(() => {});
  }, []);

  const rebuild = async () => {
    setBusy(true);
    try {
      const r = await api.admin.rebuildCatalog();
      toast(`Catalog rebuilt: ${r.data.count} movies`, 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const cleanup = async () => {
    setCleaning(true);
    try {
      const r = await api.admin.cleanupImages();
      toast(`Removed ${r.data.removed} unused ${r.data.removed === 1 ? 'image' : 'images'}`, 'success');
      api.admin.storage().then((s) => setStorage(s.data)).catch(() => {});
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setCleaning(false);
    }
  };

  if (!stats) return <PageLoader />;
  const pending = stats.movies.pending || 0;

  return (
    <>
      <h1>Overview</h1>
      {pending > 0 && (
        <div className="notice">
          {pending} {pending === 1 ? 'movie is' : 'movies are'} waiting for approval. <Link to="/admin/movies" style={{ textDecoration: 'underline' }}>Review now</Link>
        </div>
      )}
      {stats.openReports > 0 && (
        <div className="notice">
          {stats.openReports} open {stats.openReports === 1 ? 'report' : 'reports'} from viewers. <Link to="/admin/reports" style={{ textDecoration: 'underline' }}>Review now</Link>
        </div>
      )}
      <section className="stack">
        <h2 style={{ fontSize: 22 }}>Movies</h2>
        <div className="stat-grid">
          {Object.keys(STATUS_LABELS).map((s) => (
            <div key={s} className="stat"><span className="muted">{STATUS_LABELS[s]}</span><strong>{stats.movies[s] || 0}</strong></div>
          ))}
        </div>
      </section>
      <section className="stack">
        <h2 style={{ fontSize: 22 }}>People</h2>
        <div className="stat-grid">
          <div className="stat"><span className="muted">Admins</span><strong>{stats.users.admin || 0}</strong></div>
          <div className="stat"><span className="muted">Managers</span><strong>{stats.users.manager || 0}</strong></div>
          <div className="stat"><span className="muted">Viewers</span><strong>{stats.users.viewer || 0}</strong></div>
          <div className="stat"><span className="muted">Genres</span><strong>{stats.genres}</strong></div>
        </div>
      </section>
      {rewards && (
        <section className="stack">
          <h2 style={{ fontSize: 22 }}>Rewards</h2>
          <div className="stat-grid">
            <div className="stat"><span className="muted">Viewers with rewards</span><strong>{rewards.viewersWithRewards}</strong></div>
            <div className="stat"><span className="muted">Hours watched</span><strong>{rewards.totalHoursWatched}</strong></div>
            <div className="stat"><span className="muted">Points in circulation</span><strong>{rewards.pointsInCirculation.toLocaleString()}</strong></div>
            {['bronze', 'silver', 'gold', 'platinum'].map((k) => (
              <div key={k} className="stat"><span className="muted" style={{ textTransform: 'capitalize' }}>{k}</span><strong>{rewards.viewersByLevel[k] || 0}</strong></div>
            ))}
          </div>
        </section>
      )}
      <section className="card stack">
        <h2 style={{ fontSize: 22 }}>Video storage</h2>
        {!storage ? <p className="muted">Loading…</p> : !storage.configured ? (
          <p className="muted">Uploads are not set up yet (Cloudflare R2 settings are missing on the server).</p>
        ) : (
          <>
            <div className="bar" role="progressbar" aria-valuenow={storage.percentUsed} aria-valuemin={0} aria-valuemax={100} aria-label="Storage used"><div style={{ width: `${storage.percentUsed}%` }} /></div>
            <p className="muted">{formatBytes(storage.usedBytes)} used of {formatBytes(storage.quotaBytes)} ({storage.percentUsed}%). {formatBytes(storage.freeBytes)} free. Movies and images both count.</p>
            <p className="muted">Images that were uploaded but never used by a movie are cleaned up when you press the button (only images older than a day).</p>
            <button type="button" className="btn" style={{ alignSelf: 'flex-start' }} disabled={cleaning} onClick={cleanup}>{cleaning ? 'Cleaning…' : 'Clean up unused images'}</button>
          </>
        )}
      </section>
      <section className="card stack">
        <h2 style={{ fontSize: 22 }}>Catalog</h2>
        <p className="muted">The public catalog updates by itself after every publish, edit, and delete. Rebuild it by hand if something looks out of date.</p>
        <button type="button" className="btn" style={{ alignSelf: 'flex-start' }} disabled={busy} onClick={rebuild}>{busy ? 'Rebuilding…' : 'Rebuild catalog now'}</button>
      </section>
    </>
  );
}
