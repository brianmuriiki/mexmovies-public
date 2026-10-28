import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadMovie, useCatalog } from '../../hooks/useCatalog.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import Poster from '../../components/movies/Poster.jsx';
import MovieCard from '../../components/movies/MovieCard.jsx';
import WatchlistButton from '../../components/movies/WatchlistButton.jsx';
import ReportButton from '../../components/movies/ReportButton.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { LICENSE_LABELS, formatDuration, formatDate } from '../../utils/format.js';
import NotFound from './NotFound.jsx';

export default function MovieDetails() {
  const { slug } = useParams();
  const { movies } = useCatalog();
  const [movie, setMovie] = useState(undefined); // undefined = loading, null = not found
  usePageTitle(movie?.title);

  useEffect(() => {
    let active = true;
    setMovie(undefined);
    loadMovie(slug).then((m) => active && setMovie(m)).catch(() => active && setMovie(null));
    return () => {
      active = false;
    };
  }, [slug]);

  if (movie === undefined) return <PageLoader />;
  if (movie === null) return <NotFound />;

  const related = movies
    .filter((m) => m._id !== movie._id && m.genres?.some((g) => movie.genres?.some((x) => x.slug === g.slug)))
    .slice(0, 6);
  const meta = [movie.releaseYear, formatDuration(movie.duration), movie.language].filter(Boolean).join(' · ');

  return (
    <div className="container page">
      <div className="details">
        <div className="poster-box"><Poster movie={movie} /></div>
        <div className="details-text">
          <div className="row-flex">
            <span className="badge">{LICENSE_LABELS[movie.licenseType]}</span>
            {movie.earlyAccess && <span className="badge badge-accent">Early access</span>}
            {movie.publicAt && <span className="muted">Public on {formatDate(movie.publicAt)}</span>}
          </div>
          <h1>{movie.title}</h1>
          <div className="muted">{meta}</div>
          <div className="row-flex">
            {movie.genres?.map((g) => <Link key={g.slug} to={`/browse?genre=${g.slug}`} className="chip">{g.name}</Link>)}
          </div>
          <p style={{ color: 'var(--soft)', fontSize: 18, maxWidth: 720 }}>{movie.description}</p>
          {movie.director && <p><span className="muted">Director: </span>{movie.director}</p>}
          {movie.cast?.length > 0 && <p><span className="muted">Cast: </span>{movie.cast.join(', ')}</p>}
          <div className="row-flex">
            <Link to={`/watch/${movie.slug}`} className="btn btn-primary btn-lg">Watch now</Link>
            <WatchlistButton movie={movie} />
            {movie.trailerUrl && <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg">Trailer</a>}
            {!movie.earlyAccess && <ReportButton movie={movie} />}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <div className="section-head"><h2>More like this</h2></div>
          <div className="grid-movies">{related.map((m) => <MovieCard key={m._id} movie={m} />)}</div>
        </section>
      )}
    </div>
  );
}
