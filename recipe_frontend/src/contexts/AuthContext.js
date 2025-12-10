import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { currentUser as apiCurrentUser, login as apiLogin, logout as apiLogout, refresh as apiRefresh } from '../api/auth';
import { setAuthToken as clientSetAuthToken } from '../api/client';

// Keys for localStorage persistence
const LS_TOKEN_KEY = 'auth.token';
const LS_USER_KEY = 'auth.user';

const AuthContext = createContext(null);

/**
 * Helper to safely read JSON from localStorage.
 */
function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Helper to safely write JSON to localStorage.
 */
function writeJson(key, value) {
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides authentication state and actions to the app.
   * - token and user persisted in localStorage
   * - integrates with API client via setAuthToken
   * - exposes login, logout, refresh, fetchCurrentUser
   */
  const [token, setToken] = useState(() => readJson(LS_TOKEN_KEY));
  const [user, setUser] = useState(() => readJson(LS_USER_KEY));
  const [loading, setLoading] = useState(false);

  // keep api client in sync
  useEffect(() => {
    clientSetAuthToken(token);
    writeJson(LS_TOKEN_KEY, token);
  }, [token]);

  useEffect(() => {
    writeJson(LS_USER_KEY, user);
  }, [user]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const data = await apiLogin(credentials);
      if (data?.token) setToken(data.token);
      if (data?.user) setUser(data.user);
      // if user not in response, fetch after login
      if (!data?.user) {
        try {
          const me = await apiCurrentUser();
          setUser(me);
        } catch {
          // ignore fetch user error
        }
      }
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch {
      // even if backend fails, clear locally
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRefresh();
      if (data?.token) setToken(data.token);
      if (data?.user) setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    try {
      const me = await apiCurrentUser();
      setUser(me);
      return me;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // bootstrap on mount: set token to client and optionally fetch user if token exists and no user
  useEffect(() => {
    clientSetAuthToken(token);
    if (token && !user) {
      (async () => {
        try {
          const me = await apiCurrentUser();
          setUser(me);
        } catch {
          // token might be invalid; clear it
          setToken(null);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    setToken,
    setUser,
    login,
    logout,
    refresh,
    fetchCurrentUser,
    loading,
    isAuthenticated: Boolean(token),
  }), [token, user, login, logout, refresh, fetchCurrentUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access authentication state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
