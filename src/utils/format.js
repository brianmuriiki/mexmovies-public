export const formatDuration = (min) => {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

export const formatHours = (seconds = 0) => {
  const h = seconds / 3600;
  return h >= 10 ? `${Math.round(h)} h` : `${h.toFixed(1)} h`;
};

export const formatBytes = (bytes = 0) => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

const COLORS = ['#3b1f2b', '#1f3b3a', '#2b2f4a', '#3f3a1e', '#1e3a2a', '#40262a', '#2e2a45', '#26363f'];
// A steady dark color per title, used when a poster image is missing.
export const colorFor = (title = '') => {
  let h = 0;
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
};

export const LICENSE_LABELS = {
  'public-domain': 'Public domain',
  'creative-commons': 'Creative Commons',
  owned: 'Original',
  licensed: 'Licensed',
};

export const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending approval',
  published: 'Published',
  rejected: 'Rejected',
  unpublished: 'Unpublished',
};

export const youtubeId = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
    return u.searchParams.get('v');
  } catch {
    return null;
  }
};

// https://archive.org/details/<id>  or  /embed/<id>
export const archiveId = (url) => {
  try {
    return new URL(url).pathname.split('/').filter(Boolean)[1] || null;
  } catch {
    return null;
  }
};

export const errorMessage = (err) => err?.message || 'Something went wrong';
