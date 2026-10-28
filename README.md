# mexMovies client (React + CSS)

The public site, viewer pages, and the manager and admin dashboards. It uses the design from the home page mockup: dark theme, red accent, Outfit font.

## Run it

```bash
cd client
npm install
cp .env.example .env      # usually nothing to change in development
npm run dev               # http://localhost:5173
```

Start the API first (`cd ../server && npm run dev`). In development the Vite server forwards `/api` to `http://localhost:5000`, so login cookies work with no extra setup.

Build for production: `npm run build` (output in `dist/`).

## Pages

| Address | Page | Who |
|---|---|---|
| `/` | Home: featured movie, continue watching, newly added, rewards, genres | Everyone |
| `/browse` | Search, genre and year filters, sorting, pages (all in the browser) | Everyone |
| `/movie/:slug` | Details, more like this | Everyone |
| `/watch/:slug` | Player (YouTube, uploaded MP4, HLS, Internet Archive), resume, reward tracking | Everyone (rewards need login) |
| `/about`, `/terms`, `/privacy` | About, terms of use, privacy policy | Everyone |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | Accounts | Everyone |
| `/watchlist`, `/account`, `/rewards`, `/polls`, `/early-access` | Viewer pages | Logged in (polls need Gold, early access needs Platinum) |
| `/manager`, `/manager/movies/new`, `/manager/movies/:id/edit` | My movies, add and edit (links or file upload) | Manager, admin |
| `/admin` and `/admin/movies`, `/reports`, `/users`, `/genres`, `/rewards`, `/polls`, `/logs` | Overview, approvals, viewer reports, people, settings | Admin |

## How it works

- **Catalog:** the whole public catalog (`/api/catalog`) is loaded once and kept in memory. Search, filters, sorting, and "more like this" run in the browser, so browsing costs the server almost nothing. Set `VITE_CATALOG_URL` to load it from a static file (for example the R2 copy) instead.
- **Login:** an httpOnly cookie set by the API. The React code never sees the token.
- **Rewards:** on the watch page, `useWatchTracker` counts seconds while the video is playing and the tab is visible. It reports to the server after 30 seconds, then every 5 minutes, on pause, and when the page is hidden or closed. The server decides how much counts. YouTube uses the official player API; uploaded files and HLS use the video element's events. Internet Archive embeds cannot report playback, so they earn nothing and the page says so.
- **Uploads:** the movie form saves the movie, asks the API for a signed address, sends the file straight to Cloudflare R2 with a progress bar, then confirms. It then submits or publishes if you asked for that.
- **Reports:** every movie page has a “Report a problem” button (broken video, rights complaint, and so on). Admins handle reports under Reports.
- **Images:** the movie form lets staff paste an image link or upload a poster and backdrop.
- **YouTube check:** when a YouTube link is entered, the form tells the manager whether the video can be embedded.
- **Mobile:** below 900 px wide the navigation collapses into a menu button.
- **Code splitting:** the public pages load first; viewer pages and dashboards load when opened.

## Settings (`.env`)

- `VITE_API_URL`: leave as `/api`.
- `VITE_CATALOG_URL`: optional static catalog address.
- `VITE_CONTACT_EMAIL`: shown on the About, Terms, and Privacy pages. Set it before launch.
- `VITE_TURNSTILE_SITE_KEY`: optional Cloudflare Turnstile bot check on sign-up and forgot-password. Use together with `TURNSTILE_SECRET` on the server.

## Deploying

See `../DEPLOY.md`. On Cloudflare Pages, set the project root to `client`, build command `npm run build`, output `dist`, and add `API_ORIGIN` (your API address) so `functions/api/[[path]].js` forwards `/api` to the server. That keeps the login cookie first-party, which Safari needs.

## Legal pages

`Terms` and `Privacy` are plain-language drafts that match what the app actually does (accounts, watch history, points, cookies, outside services). **Have a lawyer review them before launch**, and check them against the data protection rules that apply to you, for example Kenya's Data Protection Act (including whether you must register as a data controller). Update the date in `src/config.js` when you change them.

## Status

All files pass a syntax check (the TypeScript compiler parsed every `.jsx` file) and every import resolves to a real export. The app has **not been built or run** yet, because the environment it was written in had no internet to install packages. Run `npm install && npm run build` first, then try the checklist in `../DEPLOY.md`, and send me anything that breaks.

Not included: automated frontend tests.
