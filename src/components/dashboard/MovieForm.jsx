import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/index.js';
import { uploadFile } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import ErrorBox from '../common/ErrorBox.jsx';
import ImageUploadField from './ImageUploadField.jsx';
import { PageLoader } from '../common/Loader.jsx';
import { LICENSE_LABELS, formatBytes } from '../../utils/format.js';

const EMPTY = {
  title: '', description: '', genres: [], releaseYear: '', duration: '', language: '', director: '', cast: '',
  posterUrl: '', backdropUrl: '', trailerUrl: '', videoSource: 'youtube', videoUrl: '',
  licenseType: 'public-domain', licenseProof: '',
};
const SOURCES = { youtube: 'YouTube link', archive: 'Internet Archive link', mp4: 'Direct MP4 link', hls: 'HLS stream (.m3u8)' };

// mode="manager": managers add and edit their own movies. mode="admin": the admin can also publish at once.
export default function MovieForm({ mode, movieId }) {
  const isAdmin = mode === 'admin';
  const isEdit = Boolean(movieId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [existing, setExisting] = useState(null);
  const [genres, setGenres] = useState([]);
  const [videoMode, setVideoMode] = useState('link'); // link | upload
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [embed, setEmbed] = useState(null); // result of the YouTube embed check
  const home = isAdmin ? '/admin/movies' : '/manager';

  useEffect(() => {
    api.genres().then((r) => setGenres(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetcher = isAdmin ? api.admin.movies.get : api.manager.get;
    fetcher(movieId)
      .then(({ data: m }) => {
        setExisting(m);
        setVideoMode(m.videoSource === 'r2' ? 'upload' : 'link');
        setForm({
          title: m.title, description: m.description, genres: (m.genres || []).map((g) => g._id || g),
          releaseYear: m.releaseYear ?? '', duration: m.duration ?? '', language: m.language || '',
          director: m.director || '', cast: (m.cast || []).join(', '), posterUrl: m.posterUrl || '',
          backdropUrl: m.backdropUrl || '', trailerUrl: m.trailerUrl || '',
          videoSource: m.videoSource === 'r2' ? 'youtube' : m.videoSource, videoUrl: m.videoUrl || '',
          licenseType: m.licenseType, licenseProof: m.licenseProof || '',
        });
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [isEdit, isAdmin, movieId]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // Asks the server whether YouTube allows this video to be embedded.
  const checkEmbed = async () => {
    const url = form.videoUrl.trim();
    if (videoMode !== 'link' || form.videoSource !== 'youtube' || !url) {
      setEmbed(null);
      return;
    }
    setEmbed('checking');
    try {
      setEmbed((await api.manager.checkVideo(url)).data.status);
    } catch {
      setEmbed('unknown');
    }
  };
  const toggleGenre = (id) =>
    setForm((f) => ({ ...f, genres: f.genres.includes(id) ? f.genres.filter((g) => g !== id) : [...f.genres, id] }));

  const toPayload = () => {
    // When editing, an empty optional field is sent as '' so it can be cleared; when creating it is left out.
    const opt = (v) => (isEdit ? v.trim() : v.trim() || undefined);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      genres: form.genres,
      releaseYear: Number(form.releaseYear),
      duration: Number(form.duration),
      language: form.language.trim(),
      cast: form.cast.split(',').map((s) => s.trim()).filter(Boolean),
      director: opt(form.director),
      posterUrl: form.posterUrl.trim(),
      backdropUrl: opt(form.backdropUrl),
      trailerUrl: opt(form.trailerUrl),
      licenseType: form.licenseType,
      licenseProof: form.licenseProof.trim(),
      videoSource: videoMode === 'upload' ? 'r2' : form.videoSource,
    };
    if (videoMode === 'link') payload.videoUrl = form.videoUrl.trim();
    return payload;
  };

  const ignoreConflict = (err) => {
    if (err.status !== 409) throw err; // 409 = already in that state, fine
  };

  // intent: 'draft' | 'submit' (manager) | 'publish' (admin, new movies)
  const save = async (intent) => {
    setError(null);
    try {
      const payload = toPayload();
      const hasNewFile = videoMode === 'upload' && Boolean(file);
      const alreadyUploaded = existing?.videoSource === 'r2' && existing?.uploadStatus === 'uploaded';
      const wantsMore = intent !== 'draft';

      if (videoMode === 'upload' && wantsMore && !hasNewFile && !alreadyUploaded) {
        throw new Error('Choose the MP4 file to upload before submitting, or save as a draft.');
      }
      if (hasNewFile && file.type !== 'video/mp4') throw new Error('Only MP4 files are accepted.');

      // A movie that still needs its file uploaded is saved as a draft first, then submitted or published after.
      const needsUploadStep = hasNewFile;
      let id = movieId;
      setBusy('Saving…');

      if (isEdit) {
        const body = { ...payload, ...(!isAdmin ? { submit: wantsMore && !needsUploadStep } : {}) };
        await (isAdmin ? api.admin.movies.update(id, body) : api.manager.update(id, body));
      } else if (isAdmin) {
        id = (await api.admin.movies.create({ ...payload, publish: intent === 'publish' && !needsUploadStep && videoMode === 'link' })).data._id;
      } else {
        id = (await api.manager.create({ ...payload, submit: wantsMore && !needsUploadStep })).data._id;
      }

      if (hasNewFile) {
        setBusy('Uploading the movie…');
        setProgress(0);
        const { data: sign } = await api.manager.signUpload({ movieId: id, fileName: file.name, contentType: 'video/mp4', sizeBytes: file.size });
        await uploadFile(sign.uploadUrl, file, sign.headers, setProgress);
        setBusy('Finishing…');
        await api.manager.completeUpload(id);
      }

      if (needsUploadStep && wantsMore && !isEdit) {
        setBusy(intent === 'publish' ? 'Publishing…' : 'Submitting…');
        await api.manager.submit(id).catch(ignoreConflict);
        if (intent === 'publish') await api.admin.movies.approve(id);
      } else if (needsUploadStep && wantsMore && isEdit && !isAdmin) {
        await api.manager.submit(id).catch(ignoreConflict);
      }

      toast(intent === 'publish' ? 'Movie published' : intent === 'submit' ? 'Submitted for approval' : 'Saved', 'success');
      navigate(home);
    } catch (err) {
      setError(err);
      setBusy('');
    }
  };

  if (loading) return <PageLoader />;

  const submitLabel = isAdmin ? 'Publish now' : 'Submit for approval';
  const working = Boolean(busy);

  return (
    <form className="stack" onSubmit={(e) => e.preventDefault()}>
      <h1>{isEdit ? 'Edit movie' : 'Add a movie'}</h1>
      {existing?.status === 'rejected' && existing.rejectionReason && (
        <div className="alert">This movie was rejected: {existing.rejectionReason}. Fix it, then submit again.</div>
      )}
      <ErrorBox error={error} />

      <section className="card stack">
        <h2 style={{ fontSize: 20 }}>Details</h2>
        <div className="field">
          <label htmlFor="mf-title">Title</label>
          <input id="mf-title" className="input" required value={form.title} onChange={set('title')} />
        </div>
        <div className="field">
          <label htmlFor="mf-desc">Description</label>
          <textarea id="mf-desc" className="textarea" required value={form.description} onChange={set('description')} />
        </div>
        <div className="form-grid">
          <div className="field"><label htmlFor="mf-year">Release year</label><input id="mf-year" className="input" type="number" min="1880" required value={form.releaseYear} onChange={set('releaseYear')} /></div>
          <div className="field"><label htmlFor="mf-dur">Duration (minutes)</label><input id="mf-dur" className="input" type="number" min="1" required value={form.duration} onChange={set('duration')} /></div>
          <div className="field"><label htmlFor="mf-lang">Language</label><input id="mf-lang" className="input" required value={form.language} onChange={set('language')} /></div>
          <div className="field"><label htmlFor="mf-dir">Director (optional)</label><input id="mf-dir" className="input" value={form.director} onChange={set('director')} /></div>
        </div>
        <div className="field">
          <label htmlFor="mf-cast">Cast (optional, separated by commas)</label>
          <input id="mf-cast" className="input" value={form.cast} onChange={set('cast')} />
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label" style={{ marginBottom: 8 }}>Genres (pick at least one)</legend>
          <div className="checks">
            {genres.map((g) => (
              <label key={g._id} className="check">
                <input type="checkbox" checked={form.genres.includes(g._id)} onChange={() => toggleGenre(g._id)} />
                {g.name}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: 20 }}>Images</h2>
        <div className="form-grid">
          <div className="stack">
            <ImageUploadField id="mf-poster" label="Poster image" kind="poster" required value={form.posterUrl} onChange={setValue('posterUrl')} />
            <ImageUploadField id="mf-back" label="Backdrop image (optional)" kind="backdrop" value={form.backdropUrl} onChange={setValue('backdropUrl')} />
            <div className="field"><label htmlFor="mf-trailer">Trailer link (optional)</label><input id="mf-trailer" className="input" type="url" value={form.trailerUrl} onChange={set('trailerUrl')} /></div>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Poster preview</div>
            {form.posterUrl ? <img src={form.posterUrl} alt="Poster preview" style={{ width: 150, borderRadius: 8 }} onError={(e) => (e.currentTarget.style.opacity = 0.2)} /> : <div className="hint">Paste a link to see the poster here.</div>}
          </div>
        </div>
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: 20 }}>Video</h2>
        <div className="checks" role="radiogroup" aria-label="Video type">
          <label className="check"><input type="radio" name="vm" checked={videoMode === 'link'} onChange={() => setVideoMode('link')} /> Link to a video</label>
          <label className="check"><input type="radio" name="vm" checked={videoMode === 'upload'} onChange={() => setVideoMode('upload')} /> Upload my own file</label>
        </div>
        {videoMode === 'link' ? (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="mf-src">Source</label>
              <select id="mf-src" className="select" value={form.videoSource} onChange={(e) => { set('videoSource')(e); setEmbed(null); }}>
                {Object.entries(SOURCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="mf-url">Video link</label>
              <input id="mf-url" className="input" type="url" required value={form.videoUrl} onChange={(e) => { set('videoUrl')(e); setEmbed(null); }} onBlur={checkEmbed} placeholder="https://" />
              <span className="hint">Links must start with https. YouTube and Archive links are checked.</span>
              {embed === 'checking' && <span className="hint" role="status">Checking the video…</span>}
              {embed === 'ok' && <span className="hint" style={{ color: '#86efac' }} role="status">✓ YouTube allows this video to be embedded.</span>}
              {embed === 'blocked' && <span className="hint" style={{ color: '#fca5a5' }} role="alert">This video does not allow embedding, so it would not play on mexMovies. Choose another video, or ask its owner to allow embedding.</span>}
              {embed === 'not_found' && <span className="hint" style={{ color: '#fca5a5' }} role="alert">YouTube could not find this video, or it is private.</span>}
              {embed === 'unknown' && <span className="hint" role="status">Could not check this video right now. It is checked again when you submit.</span>}
            </div>
          </div>
        ) : (
          <div className="stack">
            {existing?.videoSource === 'r2' && existing.uploadStatus === 'uploaded' && (
              <div className="notice notice-good">A file is already uploaded ({formatBytes(existing.fileSizeBytes)}). Choose a new file only if you want to replace it.</div>
            )}
            <div className="field">
              <label htmlFor="mf-file">MP4 file</label>
              <input id="mf-file" className="input" type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <span className="hint">H.264 video and AAC audio, 720p recommended, saved with the index at the start (see the README for the FFmpeg command). {file && `Selected: ${formatBytes(file.size)}`}</span>
            </div>
          </div>
        )}
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: 20 }}>Rights</h2>
        <p className="muted">Only add movies you own, have licensed, or that are public domain or Creative Commons. Every movie is reviewed before it is published.</p>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="mf-lic">License type</label>
            <select id="mf-lic" className="select" value={form.licenseType} onChange={set('licenseType')}>
              {Object.entries(LICENSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="mf-proof">Proof of rights</label>
            <textarea id="mf-proof" className="textarea" style={{ minHeight: 80 }} required minLength={5} value={form.licenseProof} onChange={set('licenseProof')} placeholder="A link, or a note such as “I made this film”" />
          </div>
        </div>
      </section>

      {working && (
        <div className="notice" role="status">
          {busy} {busy.startsWith('Uploading') && `${progress}%`}
          {busy.startsWith('Uploading') && <div className="progress" style={{ marginTop: 8 }}><div style={{ width: `${progress}%` }} /></div>}
        </div>
      )}

      <div className="row-flex">
        {isAdmin && isEdit ? (
          <button type="button" className="btn btn-primary btn-lg" disabled={working} onClick={() => save('draft')}>Save changes</button>
        ) : (
          <>
            <button type="button" className="btn btn-lg" disabled={working} onClick={() => save('draft')}>Save draft</button>
            <button type="button" className="btn btn-primary btn-lg" disabled={working} onClick={() => save(isAdmin ? 'publish' : 'submit')}>{submitLabel}</button>
          </>
        )}
        <button type="button" className="btn btn-ghost btn-lg" disabled={working} onClick={() => navigate(home)}>Cancel</button>
      </div>
    </form>
  );
}
