import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

const TOKEN_KEY = 'lifeease_token';
const USER_KEY = 'lifeease_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  // Validate existing session on mount
  useEffect(() => {
    const validate = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        setUser(res.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [clearSession]);

  const register = async (data) => {
    // Backend returns { email, requiresVerification } — no token/user yet
    const res = await authService.register(data);
    return res;
  };

  const verifyEmail = async (data) => {
    // After OTP verification, backend returns { user, token }
    const res = await authService.verifyEmail(data);
    saveSession(res.data.user, res.data.token);
    return res;
  };

  const login = async (data) => {
    const res = await authService.login(data);
    saveSession(res.data.user, res.data.token);
    return res;
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearSession();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, verifyEmail, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
