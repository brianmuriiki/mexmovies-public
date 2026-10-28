import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import Contact from '../../components/common/Contact.jsx';
import { LEGAL_UPDATED } from '../../config.js';

export default function Privacy() {
  usePageTitle('Privacy policy');
  return (
    <div className="legal">
      <h1>Privacy policy</h1>
      <p className="muted">Last updated: {LEGAL_UPDATED}</p>
      <p>This explains what mexMovies collects about you, why, and what you can do about it. We keep it to what the site needs.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>If you only browse and watch:</strong> we count how many times each movie is viewed, but we do not link that to you. Our hosting and security providers see technical details such as your IP address when you visit.</li>
        <li><strong>If you create an account:</strong> your name, email address, and password (stored only in scrambled form, never as plain text).</li>
        <li><strong>While you are logged in:</strong> your watchlist, where you stopped in each movie, how long you have watched, your level, and your points and their history.</li>
        <li><strong>If you report a movie:</strong> what you write, your email if you give it, and your account if you are logged in.</li>
        <li><strong>Managers and administrators:</strong> a log of what they do on the site (such as adding or approving movies), kept for 90 days.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To run your account and sign you in.</li>
        <li>To remember your watchlist and progress, and to give you rewards.</li>
        <li>To send emails you need: confirming your address and resetting your password.</li>
        <li>To review reports, keep the site secure, and stop abuse.</li>
      </ul>
      <p>We do not sell your information and we do not show ads.</p>

      <h2>Cookies</h2>
      <ul>
        <li>When you log in, we set one cookie that keeps you logged in. It is needed for the site to work and is not used for tracking.</li>
        <li>Movies that play from YouTube or the Internet Archive load their players, and those services may set their own cookies when you press play. See their policies for details.</li>
        <li>Our hosting and security providers, such as Cloudflare, may set cookies needed to keep the site safe.</li>
      </ul>

      <h2>Who else handles your data</h2>
      <p>We use outside services to run the site: for hosting and delivery, for the database, for video and image storage, and for sending email. They handle data only to provide those services to us.</p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account information, watchlist, progress, and rewards: until you delete your account.</li>
        <li>Reports: as long as needed to review them and keep a record.</li>
        <li>Staff activity logs: 90 days.</li>
      </ul>

      <h2>Your choices</h2>
      <ul>
        <li>You can change your name and password, and delete your account, on your <Link to="/account">account page</Link>. Deleting removes your watchlist, progress, rewards, and points.</li>
        <li>You can ask us to show you, correct, or delete the information we hold about you by contacting us (see below).</li>
        <li>You can use mexMovies to browse and watch without an account.</li>
      </ul>

      <h2>Security</h2>
      <p>Passwords are stored scrambled, the login cookie cannot be read by page scripts, and connections use HTTPS. No system is perfectly secure, so please use a strong password that you do not use elsewhere.</p>

      <h2>Children</h2>
      <p>You must be 18 or older, or have a parent or guardian’s permission, to create an account. If you think a child has given us information without permission, contact us and we will delete it.</p>

      <h2>Changes and contact</h2>
      <p>We may update this policy and will change the date at the top when we do. Questions or requests? Reach us through <Contact />. See also our <Link to="/terms">terms of use</Link>.</p>
    </div>
  );
}
