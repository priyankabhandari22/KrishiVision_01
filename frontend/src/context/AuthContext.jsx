import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const { response, data } = await apiFetch('/auth/me');
      if (response.ok && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (email, password) => {
    const { response, data } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error(data?.detail || 'Unable to sign in. Please try again.');
    }
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password, confirm_password }) => {
    const { response, data } = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirm_password }),
    });
    if (!response.ok) {
      throw new Error(data?.detail || 'Unable to create the account. Please try again.');
    }
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Even if the request fails, clear local state so the UI stays usable.
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      checking,
      checkSession,
      login,
      register,
      logout,
    }),
    [user, checking, checkSession, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}