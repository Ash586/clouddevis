'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { BottomTabs, type TabKey } from './BottomTabs';

type AuthView = 'landing' | 'login' | 'register';

export function MobileShell() {
  const { t, dir } = useMobileI18n();
  const { authState } = useAuthGuard();
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const handleLogin = useCallback(() => setAuthView('login'), []);
  const handleRegister = useCallback(() => setAuthView('register'), []);
  const handleBackToLanding = useCallback(() => setAuthView('landing'), []);
  const handleBackToLogin = useCallback(() => setAuthView('login'), []);

  // Double-press back to exit
  const lastBackRef = useState({ current: 0 })[0];
  useEffect(() => {
    if (authState !== 'authenticated') return;
    const handler = () => {
      const now = Date.now();
      if (now - lastBackRef.current < 1500) {
        if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.App) {
          (window as any).Capacitor.Plugins.App.exitApp();
        }
      } else {
        lastBackRef.current = now;
      }
    };
    window.addEventListener('backbutton', handler);
    return () => window.removeEventListener('backbutton', handler);
  }, [authState]);

  const handleNavigate = useCallback((target: string) => {
    if (target.startsWith('editor:')) return; // editor routing later (Phase 6+)
    const tabMap: Record<string, TabKey> = {
      documents: 'documents',
      clients: 'clients',
      settings: 'settings',
      home: 'home',
    };
    if (tabMap[target]) setActiveTab(tabMap[target]);
  }, []);

  // Loading
  if (authState === 'loading') {
    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[rgba(37,99,235,0.2)] border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated → dashboard with bottom tabs
  if (authState === 'authenticated') {
    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC]">
        {activeTab === 'home' && <DashboardScreen onNavigate={handleNavigate} />}
        {activeTab === 'documents' && (
          <div className="min-h-dvh bg-[#F3F6FC] px-5 pt-6 pb-20">
            <h1 className="text-lg font-bold text-[#0F2747]">{t('nav.documents')}</h1>
            <p className="text-sm text-[#5A6B85] mt-2">Phase 6</p>
          </div>
        )}
        {activeTab === 'clients' && (
          <div className="min-h-dvh bg-[#F3F6FC] px-5 pt-6 pb-20">
            <h1 className="text-lg font-bold text-[#0F2747]">{t('nav.clients')}</h1>
            <p className="text-sm text-[#5A6B85] mt-2">Phase 6</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="min-h-dvh bg-[#F3F6FC] px-5 pt-6 pb-20">
            <h1 className="text-lg font-bold text-[#0F2747]">{t('nav.settings')}</h1>
            <p className="text-sm text-[#5A6B85] mt-2">Phase 6</p>
          </div>
        )}
        <BottomTabs active={activeTab} onChange={setActiveTab} />
      </div>
    );
  }

  // Unauthenticated
  if (authView === 'register') {
    return <RegisterScreen onBackToLogin={handleBackToLogin} />;
  }

  if (authView === 'login') {
    return <LoginScreen onBackToLanding={handleBackToLanding} onGoToRegister={handleRegister} />;
  }

  return <HomeScreen onLogin={handleLogin} onRegister={handleRegister} />;
}
