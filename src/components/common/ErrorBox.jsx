// Shows an API error with its field details, if any.
export default function ErrorBox({ error }) {
  if (!error) return null;
  const details = error.details?.length ? error.details : null;
  return (
    <div className="alert" role="alert">
      {error.message}
      {details && (
        <ul>
          {details.map((d, i) => (
            <li key={i}>{d.field ? `${d.field}: ` : ''}{d.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
