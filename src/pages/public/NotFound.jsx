import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Not found');
  return (
    <div className="container page">
      <div className="empty">
        <h1 style={{ marginBottom: 12 }}>Page not found</h1>
        <p style={{ marginBottom: 20 }}>We could not find what you were looking for.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  );
}
