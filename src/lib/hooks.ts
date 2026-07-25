'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, User } from './api';

// --- useApiQuery: SWR-like data fetching hook ---

export function useApiQuery<T>(key: string, fetcher: () => Promise<T>, initialData?: T) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    mountedRef.current = true;
    refetch();
    return () => { mountedRef.current = false; };
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// --- useAuth: Authentication state hook ---

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.auth.me()
      .then(res => { if (mounted) setUser(res.user); })
      .catch(() => { if (mounted) setUser(null); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return { user, isLoading, login, logout };
}
