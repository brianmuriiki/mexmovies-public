import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import MovieCard from '../../components/movies/MovieCard.jsx';
import { MovieGridSkeleton } from '../../components/common/Loader.jsx';

const PAGE_SIZE = 24;

export default function Browse() {
  usePageTitle('Browse');
  const { movies, genres, loading, error } = useCatalog();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const genre = params.get('genre') || '';
  const year = params.get('year') || '';
  const sort = params.get('sort') || 'new';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [text, setText] = useState(q);

  // Changing a filter goes back to page 1.
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  useEffect(() => setText(q), [q]);
  useEffect(() => {
    const t = setTimeout(() => text !== q && update({ q: text }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const years = useMemo(() => [...new Set(movies.map((m) => m.releaseYear).filter(Boolean))].sort((a, b) => b - a), [movies]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = movies.filter((m) => {
      if (genre && !m.genres?.some((g) => g.slug === genre)) return false;
      if (year && String(m.releaseYear) !== year) return false;
      if (!needle) return true;
      return [m.title, m.description, m.director, ...(m.cast || [])].filter(Boolean).join(' ').toLowerCase().includes(needle);
    });
    const sorters = {
      new: (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
      title: (a, b) => a.title.localeCompare(b.title),
      year: (a, b) => (b.releaseYear || 0) - (a.releaseYear || 0),
    };
    return [...list].sort(sorters[sort] || sorters.new);
  }, [movies, q, genre, year, sort]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container page">
      <h1>Browse</h1>
      <div className="form-grid" role="search">
        <div className="field">
          <label htmlFor="b-q">Search</label>
          <input id="b-q" className="input" type="search" placeholder="Title, actor, director…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="b-genre">Genre</label>
          <select id="b-genre" className="select" value={genre} onChange={(e) => update({ genre: e.target.value })}>
            <option value="">All genres</option>
            {genres.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="b-year">Year</label>
          <select id="b-year" className="select" value={year} onChange={(e) => update({ year: e.target.value })}>
            <option value="">Any year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="b-sort">Sort by</label>
          <select id="b-sort" className="select" value={sort} onChange={(e) => update({ sort: e.target.value === 'new' ? '' : e.target.value })}>
            <option value="new">Newest added</option>
            <option value="title">Title A to Z</option>
            <option value="year">Release year</option>
          </select>
        </div>
      </div>

      {error && <div className="alert" role="alert">We could not load the movies. Please refresh the page.</div>}
      {loading ? (
        <MovieGridSkeleton />
      ) : (
        <>
          <p className="muted" aria-live="polite">{results.length} {results.length === 1 ? 'movie' : 'movies'}</p>
          {visible.length === 0 ? (
            <div className="empty">No movies match your search.</div>
          ) : (
            <div className="grid-movies">{visible.map((m) => <MovieCard key={m._id} movie={m} />)}</div>
          )}
          {pages > 1 && (
            <div className="row-flex" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Previous</button>
              <span className="muted">Page {page} of {pages}</span>
              <button type="button" className="btn btn-ghost" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
