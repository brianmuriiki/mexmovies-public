import { useState } from 'react';
import { colorFor } from '../../utils/format.js';

// Poster image, with a colored block showing the title if there is no image or it fails to load.
export default function Poster({ movie }) {
  const [failed, setFailed] = useState(false);
  const showImage = movie.posterUrl && !failed;
  return (
    <div className="poster" style={{ background: colorFor(movie.title) }}>
      {showImage ? (
        <img src={movie.posterUrl} alt={`${movie.title} poster`} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{movie.title}</span>
      )}
    </div>
  );
}
