'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  mode: string;
  phone?: string;
  subscriptionStatus?: string;
  trialStartAt?: string;
  companyInfo?: any;
  [key: string]: any;
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  refresh: () => void;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    setLoading(true);
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  return { user, loading, refresh: fetchUser };
}
