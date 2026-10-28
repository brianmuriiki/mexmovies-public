export function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className="grid-movies" aria-busy="true" aria-label="Loading movies">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton skeleton-poster" />
          <div className="skeleton" style={{ height: 16, marginTop: 10, width: '70%' }} />
        </div>
      ))}
    </div>
  );
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="empty" role="status">
      {label}…
    </div>
  );
}
