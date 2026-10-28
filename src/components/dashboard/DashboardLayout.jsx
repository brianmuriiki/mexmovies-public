import { NavLink, Outlet } from 'react-router-dom';

export default function DashboardLayout({ title, links }) {
  return (
    <div className="container dash">
      <nav className="sidebar" aria-label={title}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
        ))}
      </nav>
      <div className="dash-main"><Outlet /></div>
    </div>
  );
}
