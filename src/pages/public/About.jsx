import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import Contact from '../../components/common/Contact.jsx';
import { CONTACT_EMAIL } from '../../config.js';

export default function About() {
  usePageTitle('About');
  return (
    <div className="legal">
      <h1>About mexMovies</h1>
      <p>mexMovies is a free place to watch movies. There is nothing to pay and you can start watching right away, with no account.</p>

      <h2>Where the movies come from</h2>
      <p>
        Every movie on mexMovies is either made by the person who added it, licensed, in the public domain, or shared under a
        Creative Commons license. Each one is checked by an administrator before it is published, and the proof of rights is kept
        on file. Some movies play from YouTube or the Internet Archive, and others are hosted by us.
      </p>

      <h2>Accounts and rewards</h2>
      <p>
        A free account lets you keep a watchlist, pick up where you stopped, and earn rewards: the more you watch while logged in,
        the higher your level, and each level unlocks a perk. You also collect points. Points have no cash value, and what they can
        be used for will be announced if subscriptions launch. <Link to="/signup">Create an account</Link>.
      </p>

      <h2>Found a problem?</h2>
      <p>
        If a video does not play, or you believe a movie is here without permission, use the “Report a problem” button on the movie
        page. We review every report.
      </p>

      {CONTACT_EMAIL && (
        <>
          <h2>Make films?</h2>
          <p>If you would like your film on mexMovies, get in touch: <Contact />.</p>
        </>
      )}

      <p className="muted">Read our <Link to="/terms">terms</Link> and <Link to="/privacy">privacy policy</Link>.</p>
    </div>
  );
}
