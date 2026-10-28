import { Link } from 'react-router-dom';
import Poster from './Poster.jsx';
import WatchlistButton from './WatchlistButton.jsx';
import { LICENSE_LABELS, formatDuration } from '../../utils/format.js';

export default function HeroBanner({ movie }) {
  const meta = [movie.releaseYear, movie.genres?.map((g) => g.name).join(', '), formatDuration(movie.duration), movie.language]
    .filter(Boolean)
    .join(' · ');
  return (
    <section className="hero" aria-label="Featured movie">
      <div className="hero-text">
        <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>
          FEATURED · {(LICENSE_LABELS[movie.licenseType] || '').toUpperCase()}
        </span>
        <h1>{movie.title}</h1>
        <div className="muted">{meta}</div>
        <p className="hero-desc">{movie.description}</p>
        <div className="row-flex">
          <Link to={`/watch/${movie.slug}`} className="btn btn-primary btn-lg">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2l11 6-11 6z" fill="#fff" /></svg>
            Watch now
          </Link>
          <WatchlistButton movie={movie} />
        </div>
      </div>
      <Link to={`/movie/${movie.slug}`} className="poster-box" aria-label={`${movie.title} details`}>
        <Poster movie={movie} />
      </Link>
    </section>
  );
}
