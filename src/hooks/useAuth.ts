'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SessionUser } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (fields: {
    name: string; email: string; password: string;
    mode: string; sector: string; country: string; language: string;
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur d\'inscription');
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
}
