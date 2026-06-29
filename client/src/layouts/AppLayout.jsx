import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ChevronDown, CircleUserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const link = ({ isActive }) => `rounded-xl px-4 py-2 ${isActive ? 'bg-white/10' : 'text-white/70 hover:bg-white/5'}`;

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initials = (user?.name || user?.fullName || user?.email || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen">
      <header className="relative z-50 flex items-center justify-between overflow-visible border-b border-white/10 px-6 py-4 backdrop-blur">
        <div className="font-semibold">HireTrack</div>
        <nav className="flex items-center gap-2 overflow-visible">
          <NavLink to="/" className={link}>Dashboard</NavLink>
          <NavLink to="/daily" className={link}>Daily Apply</NavLink>
          <NavLink to="/applications" className={link}>Responses</NavLink>
          <NavLink to="/kanban" className={link}>Kanban</NavLink>
          <NavLink to="/history" className={link}>History</NavLink>
          <NavLink to="/activity" className={link}>Activity</NavLink>
          <div className="relative ml-2 overflow-visible" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-100">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || user?.email || 'User avatar'} className="h-full w-full rounded-full object-cover" />
                ) : (
                  initials || <CircleUserRound className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 text-left">
                <div className="max-w-40 truncate text-sm font-semibold text-white">{user?.name || user?.fullName || 'My Profile'}</div>
                <div className="max-w-40 truncate text-xs text-white/60">{user?.email || ''}</div>
              </div>
              <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[9999] w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/50 backdrop-blur">
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="text-sm font-semibold text-white">{user?.name || user?.fullName || 'User Name'}</div>
                  <div className="text-xs text-white/60">{user?.email || 'User Email'}</div>
                </div>
                <div className="p-2">
                  <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    Dashboard
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      </header>
      <main className="relative z-0 p-6"><Outlet /></main>
    </div>
  );
}

