import { useParams } from 'react-router-dom';
import MovieForm from '../../components/dashboard/MovieForm.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';

// One page for "add" and "edit": the id in the address decides. Used by the manager and the admin.
export default function MovieEditor({ mode }) {
  const { id } = useParams();
  usePageTitle(id ? 'Edit movie' : 'Add a movie');
  return <MovieForm mode={mode} movieId={id} key={id || 'new'} />;
}
