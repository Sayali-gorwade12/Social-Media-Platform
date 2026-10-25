import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('connectsphere_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const storedToken = sessionStorage.getItem('connectsphere_token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await authService.getMe();
        if (isMounted && res.success && res.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        sessionStorage.removeItem('connectsphere_token');
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier, password) => {
    const res = await authService.login({ identifier, password });
    if (res.success && res.data?.token) {
      sessionStorage.setItem('connectsphere_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data?.token) {
      sessionStorage.setItem('connectsphere_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = useCallback(() => {
    sessionStorage.removeItem('connectsphere_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateCurrentUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    updateCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
