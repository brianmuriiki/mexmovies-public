import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { loadMovie } from '../../hooks/useCatalog.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { useWatchTracker } from '../../hooks/useWatchTracker.js';
import VideoPlayer, { isTrackable } from '../../components/movies/VideoPlayer.jsx';
import WatchlistButton from '../../components/movies/WatchlistButton.jsx';
import ReportButton from '../../components/movies/ReportButton.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { formatDuration } from '../../utils/format.js';
import NotFound from './NotFound.jsx';

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function RewardStatus({ user, movie, status }) {
  if (!isTrackable(movie)) {
    return <div className="notice">Watch time is not counted for movies played from the Internet Archive.</div>;
  }
  if (!user) {
    return (
      <div className="notice">
        <Link to="/login" style={{ textDecoration: 'underline' }}>Log in</Link> or <Link to="/signup" style={{ textDecoration: 'underline' }}>create a free account</Link> to earn rewards and points while you watch.
      </div>
    );
  }
  if (status?.reason === 'daily_cap') return <div className="notice">You have reached today's reward limit. You can keep watching, and time counts again tomorrow.</div>;
  if (status?.reason === 'other_session') return <div className="notice">Rewards are counting in another tab or device. Only one place earns time at once.</div>;
  return <div className="notice notice-good">Your watch time counts toward your level and points.</div>;
}

export default function Watch() {
  const { slug } = useParams();
  const { user, refreshRewards } = useAuth();
  const [movie, setMovie] = useState(undefined); // undefined = loading, null = not found
  const [startAt, setStartAt] = useState(null);
  const [status, setStatus] = useState(null);
  usePageTitle(movie ? `Watching ${movie.title}` : '');

  useEffect(() => {
    let active = true;
    setMovie(undefined);
    setStartAt(null);
    loadMovie(slug).then((m) => active && setMovie(m)).catch(() => active && setMovie(null));
    return () => {
      active = false;
    };
  }, [slug]);

  // Count the view once per browser session.
  useEffect(() => {
    if (!movie || movie.earlyAccess) return;
    const key = `viewed:${movie._id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      api.addView(movie._id).catch(() => {});
    }
  }, [movie]);

  // Resume where the viewer stopped.
  useEffect(() => {
    if (!movie) return;
    if (!user) {
      setStartAt(0);
      return;
    }
    api.progress
      .list()
      .then((r) => setStartAt(r.data.find((p) => p.movie._id === movie._id)?.positionSeconds || 0))
      .catch(() => setStartAt(0));
  }, [movie, user]);

  const tracker = useWatchTracker({
    movieId: movie?._id,
    enabled: Boolean(user && movie && isTrackable(movie)),
    onResult: (r) => {
      setStatus(r);
      if (r.credited > 0) refreshRewards();
    },
  });

  if (movie === undefined) return <PageLoader />;
  if (movie === null) return <NotFound />;

  return (
    <div className="container page">
      {startAt === null ? (
        <PageLoader />
      ) : movie.videoUrl ? (
        <VideoPlayer movie={movie} startAt={startAt} tracker={tracker} />
      ) : (
        <div className="notice">This movie is not available to play right now.</div>
      )}
      {startAt > 30 && <p className="muted">Resuming from {clock(startAt)}</p>}
      <RewardStatus user={user} movie={movie} status={status} />
      <div className="stack">
        <h1>{movie.title}</h1>
        <div className="muted">{[movie.releaseYear, formatDuration(movie.duration), movie.language].filter(Boolean).join(' · ')}</div>
        <p style={{ color: 'var(--soft)', maxWidth: 760 }}>{movie.description}</p>
        <div className="row-flex">
          <WatchlistButton movie={movie} />
          <Link to={`/movie/${movie.slug}`} className="btn btn-ghost btn-lg">Details</Link>
          {!movie.earlyAccess && <ReportButton movie={movie} />}
        </div>
      </div>
    </div>
  );
}
