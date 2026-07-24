'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CompanyScreen } from '../screens/CompanyScreen';
import { BottomTabs, type TabKey } from './BottomTabs';
import { Fab } from './Fab';
import { openEditor } from '@/mobile/lib/editorLauncher';

type AuthView = 'landing' | 'login' | 'register';

export function MobileShell() {
  const { dir } = useMobileI18n();
  const { authState } = useAuthGuard();
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [overlay, setOverlay] = useState<string | null>(null);

  const handleLogin = useCallback(() => setAuthView('login'), []);
  const handleRegister = useCallback(() => setAuthView('register'), []);
  const handleBackToLanding = useCallback(() => setAuthView('landing'), []);
  const handleBackToLogin = useCallback(() => setAuthView('login'), []);

  // Back button handling
  const lastBackRef = useState({ current: 0 })[0];
  useEffect(() => {
    if (authState !== 'authenticated') return;
    const handler = () => {
      if (overlay) { setOverlay(null); return; }
      if (activeTab !== 'home') { setActiveTab('home'); return; }
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
  }, [authState, overlay, activeTab]);

  const handleNavigate = useCallback((target: string) => {
    if (target === 'company') { setOverlay('company'); return; }
    if (target.startsWith('editor:')) {
      const payload = target.slice(7); // "editor:devis" or "editor:draft:{id}"
      if (payload === 'new') { openEditor(); return; }
      // Check if it's a known doc type
      const docTypes = ['devis', 'facture', 'proforma', 'bc', 'br', 'bl', 'intervention', 'attachement'];
      if (docTypes.includes(payload)) { openEditor({ type: payload }); return; }
      // "draft:{id}" → extract the real doc ID
      const docId = payload.startsWith('draft:') ? payload.slice(6) : payload;
      openEditor({ docId });
      return;
    }
    const tabMap: Record<string, TabKey> = {
      documents: 'documents', clients: 'clients', settings: 'settings', home: 'home',
    };
    if (tabMap[target]) setActiveTab(tabMap[target]);
  }, []);

  // Loading
  if (authState === 'loading') {
    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[rgba(37,99,235,0.2)] border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated
  if (authState === 'authenticated') {
    // Overlay screens (company)
    if (overlay === 'company') {
      return <div dir={dir}><CompanyScreen onBack={() => setOverlay(null)} /></div>;
    }

    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC]">
        {activeTab === 'home' && <DashboardScreen onNavigate={handleNavigate} />}
        {activeTab === 'documents' && <DocumentsScreen onNavigate={handleNavigate} />}
        {activeTab === 'clients' && <ClientsScreen onNavigate={handleNavigate} />}
        {activeTab === 'settings' && <SettingsScreen onNavigate={handleNavigate} />}
        <Fab />
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
