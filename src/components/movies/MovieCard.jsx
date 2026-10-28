import { Link } from 'react-router-dom';
import Poster from './Poster.jsx';
import { LICENSE_LABELS } from '../../utils/format.js';

// `progress` (seconds watched) shows a "continue watching" bar.
export default function MovieCard({ movie, progress }) {
  const percent = progress && movie.duration ? Math.min(100, Math.round((progress / (movie.duration * 60)) * 100)) : 0;
  const meta = [movie.releaseYear, movie.genres?.[0]?.name, LICENSE_LABELS[movie.licenseType]].filter(Boolean).join(' · ');
  return (
    <Link to={progress ? `/watch/${movie.slug}` : `/movie/${movie.slug}`} className="movie-card">
      <div style={{ position: 'relative' }}>
        <Poster movie={movie} />
        {percent > 0 && (
          <div className="card-progress" aria-hidden="true">
            <div style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
      <div className="movie-title">{movie.title}</div>
      {meta && <div className="movie-meta">{meta}</div>}
    </Link>
  );
}
