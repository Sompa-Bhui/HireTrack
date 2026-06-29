import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);
      try {
        const { data } = await api.get('/users/me');
        setUser(data);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = (token, nextUser) => {
    localStorage.setItem('token', token);
    setUser(nextUser);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>{children}</AuthContext.Provider>;
}
