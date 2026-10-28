import { request, qs } from './client.js';

const CATALOG_URL = import.meta.env.VITE_CATALOG_URL;
const post = (path, body) => request(path, { method: 'POST', body: body ?? {} });
const patch = (path, body) => request(path, { method: 'PATCH', body: body ?? {} });
const put = (path, body) => request(path, { method: 'PUT', body });
const del = (path, body) => request(path, { method: 'DELETE', body });

export const api = {
  auth: {
    me: () => request('/auth/me'),
    login: (b) => post('/auth/login', b),
    register: (b) => post('/auth/register', b),
    logout: () => post('/auth/logout'),
    verifyEmail: (token) => post('/auth/verify-email', { token }),
    resendVerification: () => post('/auth/resend-verification'),
    forgotPassword: (b) => post('/auth/forgot-password', b),
    resetPassword: (b) => post('/auth/reset-password', b),
  },
  account: {
    update: (b) => patch('/account', b),
    changePassword: (b) => patch('/account/password', b),
    remove: (password) => del('/account', { password }),
  },

  // Public
  catalog: async () => {
    if (!CATALOG_URL) return request('/catalog');
    const res = await fetch(CATALOG_URL);
    if (!res.ok) throw new Error('Could not load the catalog');
    return res.json();
  },
  movie: (slug) => request(`/movies/${encodeURIComponent(slug)}`),
  addView: (id) => post(`/movies/${id}/view`),
  report: (id, body) => post(`/movies/${id}/report`, body),
  genres: () => request('/genres'),
  levels: () => request('/rewards/levels'),

  // Viewer
  earlyAccess: {
    list: () => request('/early-access'),
    get: (slug) => request(`/early-access/${encodeURIComponent(slug)}`),
  },
  watchlist: {
    list: () => request('/watchlist'),
    add: (movieId) => post(`/watchlist/${movieId}`),
    remove: (movieId) => del(`/watchlist/${movieId}`),
  },
  progress: { list: () => request('/progress'), save: (movieId, positionSeconds) => put(`/progress/${movieId}`, { positionSeconds }) },
  heartbeat: (b, opts) => request('/watch/heartbeat', { method: 'POST', body: b, ...opts }),
  rewards: {
    me: () => request('/rewards/me'),
    points: () => request('/rewards/points'),
    catalog: () => request('/rewards/catalog'),
    redeem: (itemId) => post('/rewards/redeem', { itemId }),
  },
  subscription: () => request('/subscription'),
  polls: { list: () => request('/polls'), vote: (id, optionId) => post(`/polls/${id}/vote`, { optionId }) },

  // Manager (admins can use these too)
  manager: {
    list: (params) => request(`/manager/movies${qs(params)}`),
    get: (id) => request(`/manager/movies/${id}`),
    create: (b) => post('/manager/movies', b),
    update: (id, b) => put(`/manager/movies/${id}`, b),
    submit: (id) => patch(`/manager/movies/${id}/submit`),
    remove: (id) => del(`/manager/movies/${id}`),
    signUpload: (b) => post('/manager/uploads/sign', b),
    completeUpload: (movieId) => post('/manager/uploads/complete', { movieId }),
    signImage: (b) => post('/manager/uploads/image/sign', b),
    completeImage: (key) => post('/manager/uploads/image/complete', { key }),
    checkVideo: (url) => request(`/manager/check-video${qs({ url })}`),
  },

  // Admin
  admin: {
    stats: () => request('/admin/stats'),
    storage: () => request('/admin/storage'),
    rebuildCatalog: () => post('/admin/catalog/rebuild'),
    movies: {
      list: (params) => request(`/admin/movies${qs(params)}`),
      get: (id) => request(`/admin/movies/${id}`),
      create: (b) => post('/admin/movies', b),
      update: (id, b) => put(`/admin/movies/${id}`, b),
      approve: (id, earlyAccessDays) => patch(`/admin/movies/${id}/approve`, earlyAccessDays ? { earlyAccessDays } : {}),
      reject: (id, reason) => patch(`/admin/movies/${id}/reject`, { reason }),
      unpublish: (id) => patch(`/admin/movies/${id}/unpublish`),
      remove: (id) => del(`/admin/movies/${id}`),
    },
    deleteUpload: (movieId) => del(`/admin/uploads/${movieId}`),
    cleanupImages: () => post('/admin/uploads/cleanup-images'),
    userRewards: (id) => request(`/admin/users/${id}/rewards`),
    reports: {
      list: (params) => request(`/admin/reports${qs(params)}`),
      update: (id, body) => patch(`/admin/reports/${id}`, body),
    },
    users: {
      list: (params) => request(`/admin/users${qs(params)}`),
      createManager: (b) => post('/admin/users', b),
      update: (id, b) => patch(`/admin/users/${id}`, b),
    },
    genres: { create: (name) => post('/admin/genres', { name }), remove: (id) => del(`/admin/genres/${id}`) },
    rewards: {
      stats: () => request('/admin/rewards/stats'),
      updateLevels: (levels) => patch('/admin/rewards/levels', { levels }),
      catalog: () => request('/admin/rewards/catalog'),
      createItem: (b) => post('/admin/rewards/catalog', b),
      updateItem: (id, b) => patch(`/admin/rewards/catalog/${id}`, b),
    },
    adjustPoints: (b) => post('/admin/points/adjust', b),
    grantSubscription: (b) => post('/admin/subscriptions', b),
    polls: {
      list: () => request('/admin/polls'),
      create: (b) => post('/admin/polls', b),
      close: (id) => patch(`/admin/polls/${id}/close`),
      remove: (id) => del(`/admin/polls/${id}`),
    },
    logs: (params) => request(`/admin/logs${qs(params)}`),
  },
};
