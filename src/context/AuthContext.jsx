import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState(() => new Set());

  // Who is logged in? (the cookie decides)
  useEffect(() => {
    api.auth
      .me()
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshRewards = useCallback(async () => {
    try {
      setRewards((await api.rewards.me()).data);
    } catch {
      /* not critical */
    }
  }, []);

  // Rewards and watchlist are loaded once someone is logged in.
  useEffect(() => {
    if (!user) {
      setRewards(null);
      setWatchlistIds(new Set());
      return;
    }
    refreshRewards();
    api.watchlist
      .list()
      .then((r) => setWatchlistIds(new Set(r.data.map((m) => m._id))))
      .catch(() => {});
  }, [user, refreshRewards]);

  const login = useCallback(async (email, password) => {
    const r = await api.auth.login({ email, password });
    setUser(r.data);
    return r.data;
  }, []);

  const register = useCallback(async (body) => {
    const r = await api.auth.register(body);
    setUser(r.data);
    return r.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const toggleWatchlist = useCallback(
    async (movieId) => {
      const has = watchlistIds.has(movieId);
      setWatchlistIds((s) => {
        const next = new Set(s);
        has ? next.delete(movieId) : next.add(movieId);
        return next;
      });
      try {
        await (has ? api.watchlist.remove(movieId) : api.watchlist.add(movieId));
      } catch (err) {
        setWatchlistIds((s) => {
          const next = new Set(s);
          has ? next.add(movieId) : next.delete(movieId);
          return next;
        });
        throw err;
      }
    },
    [watchlistIds]
  );

  const value = useMemo(
    () => ({ user, setUser, loading, rewards, refreshRewards, watchlistIds, toggleWatchlist, login, register, logout }),
    [user, loading, rewards, refreshRewards, watchlistIds, toggleWatchlist, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
