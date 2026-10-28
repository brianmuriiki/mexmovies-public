import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';
import { PageLoader } from './components/common/Loader.jsx';

// Public pages load first. Dashboards and viewer pages load only when someone opens them.
import Home from './pages/public/Home.jsx';
import Browse from './pages/public/Browse.jsx';
import MovieDetails from './pages/public/MovieDetails.jsx';
import Watch from './pages/public/Watch.jsx';
import Login from './pages/public/Login.jsx';
import Signup from './pages/public/Signup.jsx';
import NotFound from './pages/public/NotFound.jsx';

const About = lazy(() => import('./pages/public/About.jsx'));
const Terms = lazy(() => import('./pages/public/Terms.jsx'));
const Privacy = lazy(() => import('./pages/public/Privacy.jsx'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./pages/public/VerifyEmail.jsx'));
const Watchlist = lazy(() => import('./pages/viewer/Watchlist.jsx'));
const Account = lazy(() => import('./pages/viewer/Account.jsx'));
const Rewards = lazy(() => import('./pages/viewer/Rewards.jsx'));
const Polls = lazy(() => import('./pages/viewer/Polls.jsx'));
const EarlyAccess = lazy(() => import('./pages/viewer/EarlyAccess.jsx'));
const MyMovies = lazy(() => import('./pages/manager/MyMovies.jsx'));
const MovieEditor = lazy(() => import('./pages/manager/MovieEditor.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminMovies = lazy(() => import('./pages/admin/AdminMovies.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminGenres = lazy(() => import('./pages/admin/AdminGenres.jsx'));
const AdminRewards = lazy(() => import('./pages/admin/AdminRewards.jsx'));
const AdminPolls = lazy(() => import('./pages/admin/AdminPolls.jsx'));
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs.jsx'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports.jsx'));

const MANAGER_LINKS = [
  { to: '/manager', label: 'My movies', end: true },
  { to: '/manager/movies/new', label: 'Add a movie' },
];
const ADMIN_LINKS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/movies', label: 'Movies' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/genres', label: 'Genres' },
  { to: '/admin/rewards', label: 'Rewards' },
  { to: '/admin/polls', label: 'Polls' },
  { to: '/admin/logs', label: 'Activity log' },
];

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

const viewer = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="movie/:slug" element={<MovieDetails />} />
        <Route path="watch/:slug" element={<Watch />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="about" element={<About />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />

        <Route path="watchlist" element={viewer(<Watchlist />)} />
        <Route path="account" element={viewer(<Account />)} />
        <Route path="rewards" element={viewer(<Rewards />)} />
        <Route path="polls" element={viewer(<Polls />)} />
        <Route path="early-access" element={viewer(<EarlyAccess />)} />

        <Route
          path="manager"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <DashboardLayout title="Manager" links={MANAGER_LINKS} />
            </ProtectedRoute>
          }
        >
          <Route index element={<MyMovies />} />
          <Route path="movies/new" element={<MovieEditor mode="manager" />} />
          <Route path="movies/:id/edit" element={<MovieEditor mode="manager" />} />
        </Route>

        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout title="Admin" links={ADMIN_LINKS} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="movies/new" element={<MovieEditor mode="admin" />} />
          <Route path="movies/:id/edit" element={<MovieEditor mode="admin" />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="genres" element={<AdminGenres />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="polls" element={<AdminPolls />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
