import { useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { errorMessage } from '../../utils/format.js';

export default function AdminGenres() {
  usePageTitle('Genres');
  const { toast } = useToast();
  const [genres, setGenres] = useState([]);
  const [name, setName] = useState('');

  const load = () => api.genres().then((r) => setGenres(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.admin.genres.create(name.trim());
      setName('');
      toast('Genre added', 'success');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };
  const remove = async (g) => {
    if (!window.confirm(`Delete the genre "${g.name}"?`)) return;
    try {
      await api.admin.genres.remove(g._id);
      toast('Genre deleted', 'success');
      load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <>
      <h1>Genres</h1>
      <form className="row-flex" onSubmit={add}>
        <div className="field" style={{ minWidth: 260 }}>
          <label htmlFor="g-name">New genre</label>
          <input id="g-name" className="input" required minLength={2} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Add genre</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Address name</th><th></th></tr></thead>
          <tbody>
            {genres.map((g) => (
              <tr key={g._id}>
                <td>{g.name}</td>
                <td className="muted">{g.slug}</td>
                <td><button type="button" className="btn btn-sm btn-danger" onClick={() => remove(g)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">A genre that movies still use cannot be deleted.</p>
    </>
  );
}
