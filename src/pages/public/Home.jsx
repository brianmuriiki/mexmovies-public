import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import HeroBanner from '../../components/movies/HeroBanner.jsx';
import MovieCard from '../../components/movies/MovieCard.jsx';
import RewardsSection from '../../components/movies/RewardsSection.jsx';
import { MovieGridSkeleton } from '../../components/common/Loader.jsx';

export default function Home() {
  usePageTitle('');
  const { user } = useAuth();
  const { movies, genres, loading, error } = useCatalog();
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    if (!user) {
      setProgress([]);
      return;
    }
    api.progress.list().then((r) => setProgress(r.data)).catch(() => {});
  }, [user]);

  const featured = useMemo(() => movies.find((m) => m.featured) || movies[0], [movies]);
  const genreRows = useMemo(
    () =>
      genres
        .map((g) => ({ genre: g, items: movies.filter((m) => m.genres?.some((x) => x.slug === g.slug)).slice(0, 6) }))
        .filter((r) => r.items.length >= 2)
        .slice(0, 3),
    [genres, movies]
  );

  return (
    <div className="container page">
      {error && <div className="alert" role="alert">We could not load the movies. Please refresh the page.</div>}
      {loading && <MovieGridSkeleton count={6} />}
      {!loading && !error && movies.length === 0 && (
        <div className="empty">No movies have been published yet. Please check back soon.</div>
      )}

      {featured && <HeroBanner movie={featured} />}

      {progress.length > 0 && (
        <section>
          <div className="section-head"><h2>Continue watching</h2></div>
          <div className="grid-movies">
            {progress.slice(0, 6).map((p) => (
              <MovieCard key={p.movie._id} movie={p.movie} progress={p.positionSeconds || 1} />
            ))}
          </div>
        </section>
      )}

      {movies.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Newly added</h2>
            <Link to="/browse" className="muted">See all</Link>
          </div>
          <div className="grid-movies">
            {movies.slice(0, 10).map((m) => <MovieCard key={m._id} movie={m} />)}
          </div>
        </section>
      )}

      <RewardsSection />

      {genreRows.map(({ genre, items }) => (
        <section key={genre.slug}>
          <div className="section-head">
            <h2>{genre.name}</h2>
            <Link to={`/browse?genre=${genre.slug}`} className="muted">See all</Link>
          </div>
          <div className="grid-movies">{items.map((m) => <MovieCard key={m._id} movie={m} />)}</div>
        </section>
      ))}

      {genres.length > 0 && (
        <section>
          <div className="section-head"><h2>Browse by genre</h2></div>
          <div className="row-flex">
            {genres.map((g) => (
              <Link key={g.slug} className="chip" to={`/browse?genre=${g.slug}`}>{g.name}</Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
