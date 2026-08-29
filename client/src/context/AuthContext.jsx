import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load user on mount ─────────────────────────────
  const loadUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ─── Register ───────────────────────────────────────
  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    setUser(res.data.user);
    return res;
  }, []);

  // ─── Login ──────────────────────────────────────────
  const login = useCallback(async (data) => {
    const res = await authApi.login(data);
    setUser(res.data.user);
    return res;
  }, []);

  // ─── Logout ─────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  // ─── Refresh user data ──────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshUser,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
