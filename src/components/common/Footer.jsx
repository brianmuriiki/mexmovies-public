import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <span>mexMovies · Free to watch</span>
        <Link to="/about">About</Link>
        <Link to="/browse">Browse</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/signup">Create an account</Link>
      </div>
    </footer>
  );
}
