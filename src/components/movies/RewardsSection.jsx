import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const LEVEL_COLORS = { bronze: '#b4713b', silver: '#c0c0c8', gold: '#e0b84a', platinum: '#7dd3fc' };

export default function RewardsSection() {
  const { user, rewards } = useAuth();
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    api.levels().then((r) => setLevels(r.data)).catch(() => {});
  }, []);

  if (!levels.length) return null;
  const reached = new Set((rewards?.perksUnlocked || []).map((p) => p.key));

  return (
    <section className="rewards" aria-labelledby="rewards-title">
      <div className="rewards-main">
        <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>REWARDS</span>
        <h2 id="rewards-title">Watch more, earn rewards</h2>
        <p style={{ color: 'var(--soft)', fontSize: 17 }}>
          Every hour you watch while logged in counts toward your level. Reach new levels to unlock badges and perks. You also
          collect points, which may be redeemable if subscriptions launch. Free with every account.
        </p>
        {user && rewards ? (
          <div className="stat">
            <div className="muted">
              {rewards.totalHours} hours watched · {rewards.pointsBalance.toLocaleString()} points
            </div>
            {rewards.nextLevel ? (
              <>
                <div className="progress" style={{ margin: '10px 0' }} role="progressbar" aria-valuenow={rewards.nextLevel.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress to ${rewards.nextLevel.name}`}>
                  <div style={{ width: `${rewards.nextLevel.progressPercent}%` }} />
                </div>
                <div className="muted">
                  {rewards.nextLevel.hoursRemaining} hours to {rewards.nextLevel.name}
                </div>
              </>
            ) : (
              <div className="muted" style={{ marginTop: 8 }}>You have reached the top level.</div>
            )}
          </div>
        ) : null}
        {user ? (
          <Link to="/rewards" className="btn btn-lg" style={{ alignSelf: 'flex-start' }}>See my rewards</Link>
        ) : (
          <Link to="/signup" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start' }}>Create free account</Link>
        )}
      </div>
      <div className="tiers">
        {levels.map((l) => (
          <div key={l.key} className={`tier ${reached.has(l.key) ? 'reached' : ''}`}>
            <div className="tier-hours">
              <span className="dot" style={{ background: LEVEL_COLORS[l.key] }} />
              {l.hours} hours
            </div>
            <div className="tier-name">{l.name}</div>
            <div className="tier-perk">{l.perk}</div>
            {reached.has(l.key) && <span className="badge badge-good" style={{ alignSelf: 'flex-start' }}>Unlocked</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
