'use client';

import { useState, useCallback } from 'react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

type AuthView = 'landing' | 'login' | 'register';

export function MobileShell() {
  const { dir } = useMobileI18n();
  const { authState } = useAuthGuard();
  const [authView, setAuthView] = useState<AuthView>('landing');

  const handleLogin = useCallback(() => setAuthView('login'), []);
  const handleRegister = useCallback(() => setAuthView('register'), []);
  const handleBackToLanding = useCallback(() => setAuthView('landing'), []);
  const handleBackToLogin = useCallback(() => setAuthView('login'), []);

  // Authenticated → dashboard (Phase 5)
  if (authState === 'authenticated') {
    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC] flex items-center justify-center">
        <p className="text-sm text-[#5A6B85]">Dashboard — coming soon</p>
      </div>
    );
  }

  if (authView === 'register') {
    return <RegisterScreen onBackToLogin={handleBackToLogin} />;
  }

  if (authView === 'login') {
    return <LoginScreen onBackToLanding={handleBackToLanding} onGoToRegister={handleRegister} />;
  }

  return <HomeScreen onLogin={handleLogin} onRegister={handleRegister} />;
}
