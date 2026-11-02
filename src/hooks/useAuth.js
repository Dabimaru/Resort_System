import { useCallback, useEffect, useState } from 'react';
import { getAdminMe, adminLogout } from '../services/api';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('resortAdminToken') || '');
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('resortAdminUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await getAdminMe(token);
      setUser(response.user);
      localStorage.setItem('resortAdminUser', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      setToken('');
      setUser(null);
      localStorage.removeItem('resortAdminToken');
      localStorage.removeItem('resortAdminUser');
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [refreshUser, token]);

  const signOut = useCallback(async () => {
    try {
      if (token) {
        await adminLogout(token);
      }
    } catch (error) {
      console.warn('Admin logout warning:', error.message || error);
    } finally {
      setToken('');
      setUser(null);
      localStorage.removeItem('resortAdminToken');
      localStorage.removeItem('resortAdminUser');
    }
  }, [token]);

  return {
    token,
    user,
    setToken,
    setUser,
    refreshUser,
    signOut,
    isAuthenticated: Boolean(token && user),
  };
}
