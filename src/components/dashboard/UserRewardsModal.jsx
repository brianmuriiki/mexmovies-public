import { useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import Modal from '../common/Modal.jsx';
import { errorMessage, formatDate, formatDateTime } from '../../utils/format.js';

const TYPE_LABELS = { earn_watch: 'Watching', bonus_level: 'Level bonus', redeem: 'Redeemed', adjust: 'Adjustment', expire: 'Expired' };

export default function UserRewardsModal({ user, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.userRewards(user._id).then((r) => setData(r.data)).catch((err) => setError(errorMessage(err)));
  }, [user._id]);

  return (
    <Modal title={`Rewards: ${user.name}`} onClose={onClose}>
      {error && <div className="alert" role="alert">{error}</div>}
      {!data && !error && <p className="muted">Loading…</p>}
      {data && (
        <div className="stack">
          <div className="stat-grid">
            <div className="stat"><span className="muted">Level</span><strong>{data.summary.level?.name || 'None'}</strong></div>
            <div className="stat"><span className="muted">Hours</span><strong>{data.summary.totalHours}</strong></div>
            <div className="stat"><span className="muted">Points</span><strong>{data.summary.pointsBalance.toLocaleString()}</strong></div>
          </div>
          <p className="muted">
            Lifetime points earned: {data.summary.lifetimePoints.toLocaleString()}.{' '}
            {data.subscription.active ? `Subscription active until ${formatDate(data.subscription.endsAt)}.` : 'No active subscription.'}
          </p>
          {data.transactions.length === 0 ? <p className="muted">No points history yet.</p> : (
            <div className="table-wrap" style={{ maxHeight: 280, overflow: 'auto' }}>
              <table style={{ minWidth: 420 }}>
                <thead><tr><th>Date</th><th>Type</th><th>Points</th><th>Balance</th></tr></thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr key={t._id}>
                      <td>{formatDateTime(t.createdAt)}</td>
                      <td>{TYPE_LABELS[t.type] || t.type}<div className="hint">{t.reference}</div></td>
                      <td style={{ color: t.amount < 0 ? '#fca5a5' : '#86efac' }}>{t.amount > 0 ? '+' : ''}{t.amount}</td>
                      <td>{t.balanceAfter ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
