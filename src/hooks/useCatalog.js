import { useEffect, useState } from 'react';
import { api } from '../api/index.js';

// The whole public catalog is loaded once and kept in memory. Searching and filtering happen in the browser.
let cache = null;
let pending = null;

export function loadCatalog(force = false) {
  if (force || !pending) {
    pending = api
      .catalog()
      .then((data) => {
        cache = data;
        return data;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

export function useCatalog() {
  const [state, setState] = useState({ data: cache, loading: !cache, error: null });

  useEffect(() => {
    if (cache) return undefined;
    let active = true;
    loadCatalog()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
  }, []);

  return {
    movies: state.data?.movies || [],
    genres: state.data?.genres || [],
    loading: state.loading,
    error: state.error,
  };
}

// Finds one movie: catalog first, then the API, then early access (Platinum viewers and staff).
export async function loadMovie(slug) {
  try {
    const data = await loadCatalog();
    const found = data.movies.find((m) => m.slug === slug);
    if (found) return found;
  } catch {
    /* fall through to the API */
  }
  try {
    return (await api.movie(slug)).data;
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  try {
    return { ...(await api.earlyAccess.get(slug)).data, earlyAccess: true };
  } catch {
    return null;
  }
}
