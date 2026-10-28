import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import Contact from '../../components/common/Contact.jsx';
import { LEGAL_UPDATED } from '../../config.js';

// Plain-language draft. Have a lawyer review it before launch, especially the sections on points and rights complaints.
export default function Terms() {
  usePageTitle('Terms of use');
  return (
    <div className="legal">
      <h1>Terms of use</h1>
      <p className="muted">Last updated: {LEGAL_UPDATED}</p>

      <h2>1. About these terms</h2>
      <p>These terms apply when you use mexMovies. By using the site or creating an account, you agree to them. If you do not agree, please do not use the site.</p>

      <h2>2. Using mexMovies</h2>
      <ul>
        <li>mexMovies is free to watch. You do not need an account to browse or watch.</li>
        <li>You must be 18 or older, or have permission from a parent or guardian, to create an account.</li>
        <li>Give accurate details when you sign up and keep your password private. You are responsible for what happens on your account.</li>
        <li>Do not misuse the site. For example, do not try to break into accounts or the system, overload the site, copy it with automated tools, or collect rewards in unfair ways (see section 4).</li>
      </ul>

      <h2>3. Movies and rights</h2>
      <ul>
        <li>Movies on mexMovies are added by approved managers and checked by an administrator. They should be original, licensed, in the public domain, or under a Creative Commons license.</li>
        <li>Some movies play from other services, such as YouTube or the Internet Archive. Those services have their own terms and may set their own cookies.</li>
        <li>mexMovies does not own the movies unless it says so. They belong to their owners and are shown with permission or under the license shown on the movie.</li>
        <li>If you believe a movie is on mexMovies without permission, use the “Report a problem” button on its page and choose that reason. Include which work it is and how you hold the rights, and add your email so we can reply. We review every complaint and may remove the movie while we do.</li>
        <li>We may remove any movie at any time.</li>
      </ul>

      <h2>4. Rewards and points</h2>
      <ul>
        <li>Watching movies while logged in earns levels and points. Time counts only while a movie is playing in an open tab, up to a daily limit, and in one place at a time. Movies played from the Internet Archive do not count.</li>
        <li><strong>Points have no cash value.</strong> They are not money, cannot be sold or transferred, and we do not promise they can be exchanged for anything.</li>
        <li>If we offer subscriptions in future, we may let you spend points on them. We will publish the terms, including how many points are needed, before that starts.</li>
        <li>We may change levels, perks, and how points are earned. We may correct, remove, or cancel points and levels that were earned unfairly or by mistake, for example by using scripts or several devices at once.</li>
      </ul>

      <h2>5. Your account</h2>
      <p>You can delete your account at any time from your <Link to="/account">account page</Link>. This removes your watchlist, progress, rewards, and points. We may suspend or close an account that breaks these terms.</p>

      <h2>6. No guarantees</h2>
      <p>mexMovies is provided as it is. We try to keep it running and the movies playing, but we cannot promise that the site will always be available or free of errors, or that every video will always play. To the extent the law allows, we are not responsible for losses that come from using, or being unable to use, the site.</p>

      <h2>7. Changes</h2>
      <p>We may update these terms. The date at the top shows when they last changed. If you keep using mexMovies after a change, you accept the new terms.</p>

      <h2>8. Contact</h2>
      <p>Questions about these terms? Reach us through <Contact />. See also our <Link to="/privacy">privacy policy</Link>.</p>
    </div>
  );
}
