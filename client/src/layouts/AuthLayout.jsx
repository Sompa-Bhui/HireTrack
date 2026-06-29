import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
        <Link to="/" className="mb-6 block text-xl font-semibold">HireTrack</Link>
        <Outlet />
      </div>
    </div>
  );
}
