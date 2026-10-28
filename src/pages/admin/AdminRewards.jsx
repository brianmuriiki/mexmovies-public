import { useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import ErrorBox from '../../components/common/ErrorBox.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { errorMessage } from '../../utils/format.js';

export default function AdminRewards() {
  usePageTitle('Rewards settings');
  const { toast } = useToast();
  const [levels, setLevels] = useState(null);
  const [items, setItems] = useState(null);
  const [item, setItem] = useState({ name: '', description: '', costPoints: '', durationDays: 30 });
  const [error, setError] = useState(null);

  const loadItems = () => api.admin.rewards.catalog().then((r) => setItems(r.data)).catch(() => setItems([]));
  useEffect(() => {
    api.levels().then((r) => setLevels(r.data)).catch(() => setLevels([]));
    loadItems();
  }, []);

  const changeLevel = (key, field, value) => setLevels((list) => list.map((l) => (l.key === key ? { ...l, [field]: value } : l)));

  const saveLevels = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const body = levels.map((l) => ({ key: l.key, name: l.name, hours: Number(l.hours), perk: l.perk, bonusPoints: Number(l.bonusPoints) }));
      const r = await api.admin.rewards.updateLevels(body);
      setLevels(r.data);
      toast('Levels saved. Viewers see the change within an hour.', 'success');
    } catch (err) {
      setError(err);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await api.admin.rewards.createItem({
        name: item.name.trim(),
        ...(item.description.trim() ? { description: item.description.trim() } : {}),
        costPoints: Number(item.costPoints),
        durationDays: Number(item.durationDays),
      });
      setItem({ name: '', description: '', costPoints: '', durationDays: 30 });
      toast('Item added', 'success');
      loadItems();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const toggleItem = async (i) => {
    try {
      await api.admin.rewards.updateItem(i._id, { active: !i.active });
      loadItems();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (!levels || !items) return <PageLoader />;

  return (
    <>
      <h1>Rewards settings</h1>

      <form className="card stack" onSubmit={saveLevels}>
        <h2 style={{ fontSize: 22 }}>Levels and perks</h2>
        <p className="muted">Hours are lifetime watch time. Changes apply to new level-ups; nobody loses a level they already have.</p>
        <ErrorBox error={error} />
        {levels.map((l) => (
          <div key={l.key} className="form-grid" style={{ alignItems: 'end' }}>
            <div className="field"><label htmlFor={`n-${l.key}`}>Level</label><input id={`n-${l.key}`} className="input" value={l.name} onChange={(e) => changeLevel(l.key, 'name', e.target.value)} /></div>
            <div className="field"><label htmlFor={`h-${l.key}`}>Hours needed</label><input id={`h-${l.key}`} className="input" type="number" min="0" step="0.5" value={l.hours} onChange={(e) => changeLevel(l.key, 'hours', e.target.value)} /></div>
            <div className="field"><label htmlFor={`b-${l.key}`}>Bonus points</label><input id={`b-${l.key}`} className="input" type="number" min="0" value={l.bonusPoints} onChange={(e) => changeLevel(l.key, 'bonusPoints', e.target.value)} /></div>
            <div className="field"><label htmlFor={`p-${l.key}`}>Perk text</label><input id={`p-${l.key}`} className="input" value={l.perk} onChange={(e) => changeLevel(l.key, 'perk', e.target.value)} /></div>
          </div>
        ))}
        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save levels</button>
      </form>

      <section className="card stack">
        <h2 style={{ fontSize: 22 }}>Redemption items</h2>
        <p className="muted">What viewers can spend points on. Items only show to viewers once redeeming is switched on (<code>REDEMPTION_ENABLED=true</code> on the server). Decide the exchange rate only when you launch subscriptions.</p>
        {items.length === 0 ? <p className="muted">No items yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Cost</th><th>Lasts</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i._id}>
                    <td><strong>{i.name}</strong>{i.description && <div className="hint">{i.description}</div>}</td>
                    <td>{i.costPoints.toLocaleString()} points</td>
                    <td>{i.durationDays} days</td>
                    <td>{i.active ? <span className="badge badge-good">Active</span> : <span className="badge">Hidden</span>}</td>
                    <td><button type="button" className="btn btn-sm" onClick={() => toggleItem(i)}>{i.active ? 'Hide' : 'Show'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form className="form-grid" onSubmit={addItem} style={{ alignItems: 'end' }}>
          <div className="field"><label htmlFor="i-name">Name</label><input id="i-name" className="input" required minLength={2} value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} placeholder="1 month subscription" /></div>
          <div className="field"><label htmlFor="i-cost">Cost (points)</label><input id="i-cost" className="input" type="number" min="1" required value={item.costPoints} onChange={(e) => setItem({ ...item, costPoints: e.target.value })} /></div>
          <div className="field"><label htmlFor="i-days">Lasts (days)</label><input id="i-days" className="input" type="number" min="1" required value={item.durationDays} onChange={(e) => setItem({ ...item, durationDays: e.target.value })} /></div>
          <div className="field"><label htmlFor="i-desc">Description (optional)</label><input id="i-desc" className="input" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} /></div>
          <button className="btn btn-primary">Add item</button>
        </form>
      </section>
    </>
  );
}
