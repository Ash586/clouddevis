'use client';

// ============================================================
// CloudDevis Mobile — Auth Guard Hook
// Checks session on app start, exposes login/logout actions.
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { loginApi, logoutApi, fetchCurrentUser, ApiError } from './api';
import { useClientStore } from '@/stores/clientStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useSyncStore } from '@/stores/syncStore';

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthGuard {
  authState: AuthState;
  userName: string;
  /** Call when any API returns 401 to drop back to login screen */
  onUnauthorized: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuthGuard(): AuthGuard {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [userName, setUserName] = useState('');

  // ── Check existing session on mount ──────────────────────
  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        setUserName(user.name);
        setAuthState('authenticated');
      })
      .catch((err: unknown) => {
        // Any error (401, network) → go to login
        if (!(err instanceof ApiError) || err.status === 401) {
          setAuthState('unauthenticated');
        } else {
          // Server error (5xx) — still show login rather than blank screen
          setAuthState('unauthenticated');
        }
      });
  }, []);

  // ── Called by useApiSync when a request returns 401 ──────
  const onUnauthorized = useCallback(() => {
    setAuthState('unauthenticated');
    setUserName('');
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (
    email: string,
    password: string,
    rememberMe = false
  ) => {
    const user = await loginApi(email, password, rememberMe);
    setUserName(user.name);
    setAuthState('authenticated');
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore errors — clear local state regardless
    }
    // Wipe all local stores
    useClientStore.getState().clearAll();
    useDocumentStore.getState().resetDocument();
    useSyncStore.getState().clearQueue();
    setUserName('');
    setAuthState('unauthenticated');
  }, []);

  return { authState, userName, onUnauthorized, login, logout };
}
