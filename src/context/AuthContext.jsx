import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  apiClient,
  getStoredToken,
  setStoredToken,
} from '../services/apiClient.js';
import { useTheme } from './ThemeContext.jsx';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const currentUser = await apiClient.me();
        if (active) {
          setUser(currentUser);
          if (currentUser.preferredTheme) {
            setTheme(currentUser.preferredTheme);
          }
        }
      } catch {
        setStoredToken(null);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    restoreSession();
    return () => {
      active = false;
    };
  }, [setTheme]);

  const login = useCallback(
    async (email, password) => {
      const res = await apiClient.login(email, password);
      setStoredToken(res.token);
      setUser(res.user);
      if (res.user.preferredTheme) {
        setTheme(res.user.preferredTheme);
      }
      return res.user;
    },
    [setTheme]
  );

  const registerCitizen = useCallback(async (data) => {
    const res = await apiClient.registerCitizen(data);
    setStoredToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const updateProfile = useCallback(
    async (data) => {
      const updated = await apiClient.updateProfile(data);
      setUser(updated);
      if (updated.preferredTheme) {
        setTheme(updated.preferredTheme);
      }
      return updated;
    },
    [setTheme]
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, registerCitizen, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
