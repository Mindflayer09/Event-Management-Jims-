import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../api/services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const res = await getMe();

      // KEEP OLD LOGIC
      setUser(res.data.user);
      setToken(stored);

      const userData = res.data.user;
      
      if (userData?.club) {
        //  Safely extract the ID whether club is an object or just a string
        const clubId = typeof userData.club === 'object' ? userData.club._id : userData.club;
        localStorage.setItem('selectedClub', clubId);
      }

    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedClub'); 
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });

    // ✅ KEEP YOUR ORIGINAL STRUCTURE
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // 🔥 ADD THIS (THIS FIXES YOUR SYSTEM)
    if (userData?.club) {
      // ✅ Safely extract the ID whether club is an object or just a string
      const clubId = typeof userData.club === 'object' ? userData.club._id : userData.club;
      localStorage.setItem('selectedClub', clubId);
    }

    setToken(newToken);
    setUser(userData);

    return userData;
  };

  const register = async (data) => {
    const res = await registerApi(data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedClub'); // ✅ important
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
