import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { errorMessage } from '../../utils/format.js';

export default function WatchlistButton({ movie, className = 'btn btn-lg' }) {
  const { user, watchlistIds, toggleWatchlist } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const saved = watchlistIds.has(movie._id);

  const onClick = async () => {
    if (!user) {
      toast('Log in or create a free account to save movies', 'info');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      await toggleWatchlist(movie._id);
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <button type="button" className={className} onClick={onClick} aria-pressed={saved}>
      {saved ? '✓ In watchlist' : '+ Watchlist'}
    </button>
  );
}
