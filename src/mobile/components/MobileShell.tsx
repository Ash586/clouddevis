'use client';

import { useState, useCallback } from 'react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { HomeScreen } from '../screens/HomeScreen';

type AuthView = 'landing' | 'login' | 'register';

export function MobileShell() {
  const { dir } = useMobileI18n();
  const { authState } = useAuthGuard();
  const [authView, setAuthView] = useState<AuthView>('landing');

  const handleLogin = useCallback(() => setAuthView('login'), []);
  const handleRegister = useCallback(() => setAuthView('register'), []);

  // Once authenticated → dashboard (Phase 5)
  if (authState === 'authenticated') {
    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC] flex items-center justify-center">
        <p className="text-sm text-[#5A6B85]">Dashboard — coming soon</p>
      </div>
    );
  }

  // Login view (Phase 3)
  if (authView === 'login') {
    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC] flex items-center justify-center">
        <p className="text-sm text-[#5A6B85]">Login — coming soon</p>
      </div>
    );
  }

  // Register view (Phase 4)
  if (authView === 'register') {
    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC] flex items-center justify-center">
        <p className="text-sm text-[#5A6B85]">Register — coming soon</p>
      </div>
    );
  }

  // Landing page (Phase 2)
  return <HomeScreen onLogin={handleLogin} onRegister={handleRegister} />;
}
