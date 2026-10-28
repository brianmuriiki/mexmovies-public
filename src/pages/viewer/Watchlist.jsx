import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import MovieCard from '../../components/movies/MovieCard.jsx';
import { MovieGridSkeleton } from '../../components/common/Loader.jsx';

export default function Watchlist() {
  usePageTitle('My watchlist');
  const { toggleWatchlist } = useAuth();
  const [movies, setMovies] = useState(null);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    api.watchlist.list().then((r) => setMovies(r.data)).catch(() => setMovies([]));
    api.progress.list().then((r) => setProgress(r.data)).catch(() => {});
  }, []);

  const remove = async (id) => {
    await toggleWatchlist(id);
    setMovies((list) => list.filter((m) => m._id !== id));
  };

  return (
    <div className="container page">
      <h1>My watchlist</h1>
      {movies === null ? (
        <MovieGridSkeleton count={5} />
      ) : movies.length === 0 ? (
        <div className="empty">
          <p style={{ marginBottom: 16 }}>Nothing saved yet. Use “+ Watchlist” on any movie.</p>
          <Link to="/browse" className="btn btn-primary">Browse movies</Link>
        </div>
      ) : (
        <div className="grid-movies">
          {movies.map((m) => (
            <div key={m._id}>
              <MovieCard movie={m} />
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => remove(m._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {progress.length > 0 && (
        <section>
          <div className="section-head"><h2>Continue watching</h2></div>
          <div className="grid-movies">
            {progress.map((p) => <MovieCard key={p.movie._id} movie={p.movie} progress={p.positionSeconds || 1} />)}
          </div>
        </section>
      )}
    </div>
  );
}
