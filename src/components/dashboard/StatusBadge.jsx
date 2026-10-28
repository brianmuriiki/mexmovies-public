import { STATUS_LABELS } from '../../utils/format.js';

const CLASSES = { published: 'badge-good', pending: 'badge-warn', rejected: 'badge-bad', unpublished: 'badge-bad', draft: '' };

export default function StatusBadge({ status }) {
  return <span className={`badge ${CLASSES[status] || ''}`}>{STATUS_LABELS[status] || status}</span>;
}
