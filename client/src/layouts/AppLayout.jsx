import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { logout } = useAuth();
  const link = ({ isActive }) => `rounded-xl px-4 py-2 ${isActive ? 'bg-white/10' : 'text-white/70 hover:bg-white/5'}`;
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur">
        <div className="font-semibold">HireTrack</div>
        <nav className="flex gap-2">
          <NavLink to="/" className={link}>Dashboard</NavLink>
          <NavLink to="/daily" className={link}>Daily Apply</NavLink>
          <NavLink to="/applications" className={link}>Responses</NavLink>
          <NavLink to="/kanban" className={link}>Kanban</NavLink>
          <NavLink to="/history" className={link}>History</NavLink>
          <button onClick={logout} className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/15">Logout</button>
        </nav>
      </header>
      <main className="p-6"><Outlet /></main>
    </div>
  );
}
