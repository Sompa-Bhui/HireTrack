import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import DailyApply from './pages/daily/DailyApply';
import Applications from './pages/applications/Applications';
import Kanban from './pages/kanban/Kanban';
import History from './pages/history/History';
import NotFound from './pages/errors/NotFound';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/daily" element={<DailyApply />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/kanban" element={<Kanban />} />
        <Route path="/history" element={<History />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
