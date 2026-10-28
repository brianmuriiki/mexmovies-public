import { useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { LEVEL_COLORS } from '../../components/movies/RewardsSection.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage, formatDateTime, formatHours } from '../../utils/format.js';

const TYPE_LABELS = { earn_watch: 'Watching', bonus_level: 'Level bonus', redeem: 'Redeemed', adjust: 'Adjustment', expire: 'Expired' };

export default function Rewards() {
  usePageTitle('Rewards');
  const { rewards, refreshRewards } = useAuth();
  const { toast } = useToast();
  const [levels, setLevels] = useState([]);
  const [points, setPoints] = useState(null);
  const [items, setItems] = useState({ data: [], redemptionAvailable: false });
  const [subscription, setSubscription] = useState(null);

  const load = () => {
    api.levels().then((r) => setLevels(r.data)).catch(() => {});
    api.rewards.points().then((r) => setPoints(r.data)).catch(() => {});
    api.rewards.catalog().then(setItems).catch(() => {});
    api.subscription().then((r) => setSubscription(r.data)).catch(() => {});
    refreshRewards();
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const redeem = async (item) => {
    if (!window.confirm(`Spend ${item.costPoints.toLocaleString()} points on "${item.name}"?`)) return;
    try {
      await api.rewards.redeem(item._id);
      toast('Done! Your subscription is active.', 'success');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (!rewards || !points) return <PageLoader />;
  const reached = new Set(rewards.perksUnlocked.map((p) => p.key));
  const capPercent = Math.min(100, Math.round((rewards.todaySeconds / rewards.dailyCapSeconds) * 100));

  return (
    <div className="container page">
      <h1>Rewards and points</h1>

      <div className="stat-grid">
        <div className="stat"><span className="muted">Level</span><strong>{rewards.level ? rewards.level.name : 'Not yet'}</strong></div>
        <div className="stat"><span className="muted">Hours watched</span><strong>{rewards.totalHours}</strong></div>
        <div className="stat"><span className="muted">Points balance</span><strong>{rewards.pointsBalance.toLocaleString()}</strong></div>
        <div className="stat"><span className="muted">Watched today</span><strong>{formatHours(rewards.todaySeconds)}</strong><span className="hint">{capPercent}% of the daily limit</span></div>
      </div>

      <section className="card stack">
        <h2 style={{ fontSize: 22 }}>{rewards.nextLevel ? `Next level: ${rewards.nextLevel.name}` : 'Top level reached'}</h2>
        {rewards.nextLevel && (
          <>
            <div className="progress" role="progressbar" aria-valuenow={rewards.nextLevel.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress to ${rewards.nextLevel.name}`}>
              <div style={{ width: `${rewards.nextLevel.progressPercent}%` }} />
            </div>
            <p className="muted">{rewards.nextLevel.hoursRemaining} more hours to reach {rewards.nextLevel.name}.</p>
          </>
        )}
        <p className="muted">Watch time counts while a movie is playing and the tab is open. Movies played from the Internet Archive do not count.</p>
      </section>

      <section>
        <div className="section-head"><h2>Levels and perks</h2></div>
        <div className="tiers" style={{ marginTop: 12 }}>
          {levels.map((l) => (
            <div key={l.key} className={`tier ${reached.has(l.key) ? 'reached' : ''}`}>
              <div className="tier-hours"><span className="dot" style={{ background: LEVEL_COLORS[l.key] }} />{l.hours} hours</div>
              <div className="tier-name">{l.name}</div>
              <div className="tier-perk">{l.perk}</div>
              <div className="hint">+{l.bonusPoints.toLocaleString()} bonus points</div>
              {reached.has(l.key) && <span className="badge badge-good" style={{ alignSelf: 'flex-start' }}>Unlocked</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: 22 }}>Redeem points</h2>
        {subscription?.active && <div className="notice notice-good">Subscription active: {subscription.daysRemaining} days left.</div>}
        {!items.redemptionAvailable ? (
          <p className="muted">Redeeming points is not available yet. Keep collecting: points have no cash value, and what they can be used for will be announced if subscriptions launch.</p>
        ) : items.data.length === 0 ? (
          <p className="muted">No items to redeem right now.</p>
        ) : (
          <div className="stack">
            {items.data.map((item) => (
              <div key={item._id} className="spread">
                <div>
                  <strong>{item.name}</strong>
                  {item.description && <div className="muted">{item.description}</div>}
                </div>
                <button type="button" className="btn btn-primary" disabled={rewards.pointsBalance < item.costPoints} onClick={() => redeem(item)}>
                  {item.costPoints.toLocaleString()} points
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stack">
        <h2 style={{ fontSize: 22 }}>Points history</h2>
        {points.transactions.length === 0 ? (
          <p className="muted">No points yet. Start watching a movie while logged in.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Points</th><th>Balance</th></tr></thead>
              <tbody>
                {points.transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{formatDateTime(t.createdAt)}</td>
                    <td>{TYPE_LABELS[t.type] || t.type}{t.type === 'bonus_level' ? ` (${t.reference})` : ''}</td>
                    <td style={{ color: t.amount < 0 ? '#fca5a5' : '#86efac' }}>{t.amount > 0 ? '+' : ''}{t.amount}</td>
                    <td>{t.balanceAfter ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
