import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import MovieCard from '../../components/movies/MovieCard.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { formatDate } from '../../utils/format.js';

export default function EarlyAccess() {
  usePageTitle('Early access');
  const [state, setState] = useState({ loading: true, movies: [], locked: false });

  useEffect(() => {
    api.earlyAccess
      .list()
      .then((r) => setState({ loading: false, movies: r.data, locked: false }))
      .catch((err) => setState({ loading: false, movies: [], locked: err.status === 403 }));
  }, []);

  if (state.loading) return <PageLoader />;

  return (
    <div className="container page">
      <h1>Early access</h1>
      {state.locked ? (
        <div className="notice">
          Early access is for Platinum members: reach 100 hours of watch time to unlock new movies before everyone else.{' '}
          <Link to="/rewards" style={{ textDecoration: 'underline' }}>See my progress</Link>
        </div>
      ) : state.movies.length === 0 ? (
        <div className="empty">No movies are in early access right now.</div>
      ) : (
        <div className="grid-movies">
          {state.movies.map((m) => (
            <div key={m._id}>
              <MovieCard movie={m} />
              {m.publicAt && <div className="hint" style={{ marginTop: 6 }}>Public on {formatDate(m.publicAt)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
