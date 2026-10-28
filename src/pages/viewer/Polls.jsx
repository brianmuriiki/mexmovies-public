import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage, formatDate } from '../../utils/format.js';

export default function Polls() {
  usePageTitle('Vote on next movies');
  const { toast } = useToast();
  const [polls, setPolls] = useState(null);

  useEffect(() => {
    api.polls.list().then((r) => setPolls(r.data)).catch(() => setPolls([]));
  }, []);

  const vote = async (poll, optionId) => {
    try {
      const { data } = await api.polls.vote(poll.id, optionId);
      setPolls((list) => list.map((p) => (p.id === poll.id ? data : p)));
      toast('Your vote is saved', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (polls === null) return <PageLoader />;

  return (
    <div className="container page" style={{ maxWidth: 820 }}>
      <h1>Vote on the next movies</h1>
      <p className="muted">Gold and Platinum members choose which movies mexMovies adds next. You can change your vote until a poll closes.</p>
      {polls.length === 0 && <div className="empty">There are no open polls right now.</div>}
      {polls.map((poll) => (
        <section key={poll.id} className="card stack">
          <div className="spread">
            <h2 style={{ fontSize: 22 }}>{poll.title}</h2>
            {poll.closesAt && <span className="muted">Closes {formatDate(poll.closesAt)}</span>}
          </div>
          {poll.description && <p className="muted">{poll.description}</p>}
          {!poll.canVote && (
            <div className="notice">Voting is for Gold and Platinum members. <Link to="/rewards" style={{ textDecoration: 'underline' }}>See my progress</Link></div>
          )}
          <div className="stack">
            {poll.options.map((o) => {
              const percent = poll.totalVotes ? Math.round((o.votes / poll.totalVotes) * 100) : 0;
              const mine = poll.myVoteOptionId === o.id;
              return (
                <div key={o.id} className="option-row">
                  <div>
                    <strong>{o.title}</strong> {mine && <span className="badge badge-good">Your vote</span>}
                    {o.description && <div className="muted">{o.description}</div>}
                  </div>
                  <button type="button" className={mine ? 'btn btn-sm' : 'btn btn-primary btn-sm'} disabled={!poll.canVote || mine} onClick={() => vote(poll, o.id)}>
                    {mine ? 'Voted' : 'Vote'}
                  </button>
                  <div className="bar" style={{ gridColumn: '1 / -1' }} aria-hidden="true"><div style={{ width: `${percent}%` }} /></div>
                  <div className="hint" style={{ gridColumn: '1 / -1' }}>{o.votes} {o.votes === 1 ? 'vote' : 'votes'} ({percent}%)</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
