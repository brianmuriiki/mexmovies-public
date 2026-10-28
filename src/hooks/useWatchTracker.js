import { useCallback, useEffect, useMemo, useRef } from 'react';
import { api } from '../api/index.js';

/*
 * Counts the seconds a logged-in viewer really watches (playing + tab visible) and reports them to the
 * server: once after 30 s (so the server has a starting point), then every 5 minutes, on pause, and when
 * the page is hidden or closed. The server decides how much of it counts (daily cap, one session, etc).
 */
export function useWatchTracker({ movieId, enabled, onResult }) {
  const sessionId = useMemo(
    () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    []
  );
  const s = useRef({ playing: false, pending: 0, sinceFlush: 0, threshold: 30, getPosition: null });
  const resultRef = useRef(onResult);
  resultRef.current = onResult;

  const flush = useCallback(
    (final = false) => {
      if (!enabled || !movieId) return;
      const st = s.current;
      const seconds = Math.min(Math.floor(st.pending), 330);
      const position = st.getPosition ? Math.floor(st.getPosition() || 0) : undefined;
      if (seconds <= 0 && position === undefined) return;
      st.pending = Math.max(0, st.pending - seconds);
      st.sinceFlush = 0;
      st.threshold = 300;
      api
        .heartbeat({ movieId, sessionId, seconds, ...(position !== undefined ? { position } : {}) }, { keepalive: final })
        .then((r) => resultRef.current?.(r.data))
        .catch(() => {});
    },
    [enabled, movieId, sessionId]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setInterval(() => {
      const st = s.current;
      if (st.playing && document.visibilityState === 'visible') {
        st.pending += 1;
        st.sinceFlush += 1;
        if (st.sinceFlush >= st.threshold) flush();
      }
    }, 1000);
    const onHidden = () => document.visibilityState === 'hidden' && flush(true);
    const onPageHide = () => flush(true);
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', onPageHide);
      flush(true); // leaving the page
    };
  }, [enabled, flush]);

  return {
    onPlay: () => {
      s.current.playing = true;
    },
    onPause: () => {
      s.current.playing = false;
      flush();
    },
    onEnded: () => {
      s.current.playing = false;
      flush();
    },
    setPositionGetter: (fn) => {
      s.current.getPosition = fn;
    },
  };
}
