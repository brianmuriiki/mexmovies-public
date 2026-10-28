import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const { user, rewards, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false); // account menu
  const [navOpen, setNavOpen] = useState(false); // mobile menu
  const menuRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    setNavOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/browse${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" aria-label="mexMovies home">
          <span>mex</span>Movies
        </Link>
        <button type="button" className="nav-toggle btn btn-ghost btn-sm" aria-expanded={navOpen} aria-controls="nav-collapse" onClick={() => setNavOpen((o) => !o)}>
          <span className="sr-only">{navOpen ? 'Close menu' : 'Open menu'}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {navOpen ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <div id="nav-collapse" className={`nav-collapse ${navOpen ? 'open' : ''}`}>
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/browse">Browse</NavLink>
            {user && <NavLink to="/watchlist">Watchlist</NavLink>}
            {user && <NavLink to="/rewards">Rewards</NavLink>}
            <NavLink to="/about">About</NavLink>
          </nav>
          <form className="nav-search" onSubmit={search} role="search">
            <input type="search" aria-label="Search movies" placeholder="Search movies" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="nav-actions">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-pill">Log in</Link>
                <Link to="/signup" className="btn btn-primary btn-pill">Sign up</Link>
              </>
            ) : (
              <div className="menu" ref={menuRef}>
                <button type="button" className="btn btn-ghost btn-pill" style={{ width: '100%' }} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
                  {user.name.split(' ')[0]}
                  {rewards?.level && <span className="badge badge-accent">{rewards.level.name}</span>}
                </button>
                {open && (
                  <div className="menu-panel" role="menu">
                    <div className="menu-head">
                      <strong>{user.name}</strong>
                      <span className="muted">{user.email}</span>
                      {rewards && <div className="muted">{rewards.pointsBalance.toLocaleString()} points</div>}
                    </div>
                    <Link to="/account">Account</Link>
                    <Link to="/watchlist">Watchlist</Link>
                    <Link to="/rewards">Rewards and points</Link>
                    <Link to="/polls">Vote on next movies</Link>
                    <Link to="/early-access">Early access</Link>
                    {['manager', 'admin'].includes(user.role) && <Link to="/manager">Manager dashboard</Link>}
                    {user.role === 'admin' && <Link to="/admin">Admin dashboard</Link>}
                    <button type="button" onClick={async () => { await logout(); navigate('/'); }}>Log out</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
