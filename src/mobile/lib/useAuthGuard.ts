'use client';

// ============================================================
// Rakmana Mobile — Auth Guard Hook
// Checks session on app start, exposes login/logout actions.
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { loginApi, registerApi, logoutApi, fetchCurrentUser, ApiError } from './api';
import { useClientStore } from '@/stores/clientStore';
import { useCompanyStore } from '@/stores/companyStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useSyncStore } from '@/stores/syncStore';
import { useUserStore } from '@/stores/userStore';

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthGuard {
  authState: AuthState;
  userName: string;
  /** Call when any API returns 401 to drop back to login screen */
  onUnauthorized: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, mode?: 'artisan' | 'entreprise') => Promise<void>;
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
        // Server is source of truth for the persona
        useUserStore.getState().setMode(user.mode === 'ENTREPRISE' ? 'entreprise' : 'artisan');
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
    // loginApi doesn't return the mode — refresh it from the profile
    fetchCurrentUser()
      .then((u) => useUserStore.getState().setMode(u.mode === 'ENTREPRISE' ? 'entreprise' : 'artisan'))
      .catch(() => {});
  }, []);

  // ── Register ──────────────────────────────────────────────
  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    mode: 'artisan' | 'entreprise' = 'artisan'
  ) => {
    const user = await registerApi(name, email, password, mode);
    setUserName(user.name);
    // Verify the session cookie actually works BEFORE flipping to authenticated.
    // If the cookie failed to persist, fetchCurrentUser throws → RegisterScreen
    // shows the error instead of the user silently bouncing back to Welcome.
    const profile = await fetchCurrentUser();
    useUserStore.getState().setMode(profile.mode === 'ENTREPRISE' ? 'entreprise' : 'artisan');
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
    useCompanyStore.getState().clearCompany();
    useDocumentStore.getState().resetDocument();
    // Also wipe saved documents to prevent data leakage between accounts
    useDocumentStore.setState({ savedDocuments: [], syncStatus: 'synced' });
    useSyncStore.getState().clearQueue();
    useUserStore.getState().reset();
    setUserName('');
    setAuthState('unauthenticated');
  }, []);

  return { authState, userName, onUnauthorized, login, register, logout };
}
