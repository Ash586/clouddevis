'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSyncStore } from '@/stores/syncStore';
import { useDocumentStore } from '@/stores/documentStore';
import { processWebSyncItem } from '@/lib/webSync';
import { useApiSync } from '@/mobile/lib/useApiSync';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { useMobileI18n, getMobileT } from '@/mobile/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { getSettings } from '@/lib/offline';
import { generatePDFBase64FromDoc, downloadDocument } from '@/mobile/lib/pdf';
import { notify } from '@/mobile/lib/toast';
import type { MobileLocale } from '@/stores/userStore';
import { isNativePlatform, exitApp, addBackPressListener, addAppStateListener, checkIsOnline } from '@/lib/native';
import { BottomTabs, type TabId } from './BottomTabs';
import { FAB } from './FAB';
import { OfflineBanner } from './OfflineBanner';
import { UpdateBanner } from './UpdateBanner';
import { PushToast, type PushToastData } from './PushToast';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OnboardingScreen } from './OnboardingScreen';
import { BiometricLockScreen } from './BiometricLockScreen';
import { checkBiometry, type BiometryInfo } from '@/mobile/lib/biometric';
import { HomeScreen } from '../screens/HomeScreen';
import { DocumentsListScreen } from '../screens/DocumentsListScreen';
import { CompanyProfileScreen } from '../screens/CompanyProfileScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { APP_VERSION } from '@/mobile/constants';
import type { Document } from '@/mobile/types';

function isOutdated(current: string, minimum: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const [cMaj, cMin, cPat] = parse(current);
  const [mMaj, mMin, mPat] = parse(minimum);
  if (cMaj !== mMaj) return cMaj < mMaj;
  if (cMin !== mMin) return cMin < mMin;
  return cPat < mPat;
}

type CompanyView = 'profile' | 'clients';

const overlayVariants = {
  enter: { x: 300, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 },
};

interface MobileShellProps {
  initialTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

export function MobileShell({ initialTab = 'home', onTabChange }: MobileShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBiometricLock, setShowBiometricLock] = useState(false);
  const [biometryInfo, setBiometryInfo] = useState<BiometryInfo>({ available: false, type: '' });
  const backgroundedAtRef = useRef<number | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [companyView, setCompanyView] = useState<CompanyView>('profile');
  const [pushToast, setPushToast] = useState<PushToastData | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const toastIdRef = useRef(0);

  const activeTabRef = useRef<TabId>(initialTab);
  const showWizardRef = useRef(false);
  const companyViewRef = useRef<CompanyView>('profile');
  const backPressedOnce = useRef(false);
  const backPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { showWizardRef.current = showWizard; }, [showWizard]);
  useEffect(() => { companyViewRef.current = companyView; }, [companyView]);

  useEffect(() => {
    if (!isNativePlatform()) return;
    const removeListener = addBackPressListener(() => {
      if (showWizardRef.current) { setShowWizard(false); setEditingDocId(null); return; }
      if (companyViewRef.current === 'clients') { setCompanyView('profile'); return; }
      if (activeTabRef.current !== 'home') { setActiveTab('home'); return; }
      if (backPressedOnce.current) {
        if (backPressTimer.current) clearTimeout(backPressTimer.current);
        exitApp();
        return;
      }
      backPressedOnce.current = true;
      void import('@/mobile/lib/toast').then(({ notify }) => {
        notify(getMobileT(useUserStore.getState().locale)('nav.pressAgainToExit'));
      });
      backPressTimer.current = setTimeout(() => { backPressedOnce.current = false; }, 2000);
    });
    return () => { removeListener(); if (backPressTimer.current) clearTimeout(backPressTimer.current); };
  }, []);

  const [updateInfo, setUpdateInfo] = useState({ visible: false, version: '', apkUrl: '', releaseNotes: '' });
  useEffect(() => {
    fetch('/api/mobile/version').then((r) => r.ok ? r.json() : null).then((data) => {
      if (data?.minVersion && isOutdated(APP_VERSION, data.minVersion)) {
        setUpdateInfo({ visible: true, version: data.minVersion, apkUrl: data.apkUrl ?? '', releaseNotes: data.releaseNotes ?? '' });
      }
    }).catch(() => {});
  }, []);

  const { authState, userName, onUnauthorized, login, register, logout } = useAuthGuard();
  useApiSync({ enabled: authState === 'authenticated', onUnauthorized });

  useEffect(() => {
    if (authState !== 'authenticated') return;
    void (async () => {
      try {
        const { initPushNotifications } = await import('@/mobile/lib/pushNotifications');
        await initPushNotifications({
          onForeground: (title, body, payload) => {
            toastIdRef.current += 1;
            setPushToast({ id: String(toastIdRef.current), title, body, documentId: payload.documentId });
            setHasUnread(true);
          },
          onTap: (payload) => {
            if (payload.documentId) { setActiveTab('documents'); setEditingDocId(payload.documentId); setShowWizard(true); }
          },
        });
      } catch {}
    })();
  }, [authState]);

  useEffect(() => {
    if (authState !== 'authenticated') return;
    void checkBiometry().then(setBiometryInfo);
  }, [authState]);

  useEffect(() => {
    if (authState !== 'authenticated') return;
    const removeListener = addAppStateListener(async (isActive) => {
      if (!isActive) { backgroundedAtRef.current = Date.now(); return; }
      const bgAt = backgroundedAtRef.current;
      backgroundedAtRef.current = null;
      if (!bgAt) return;
      if (Date.now() - bgAt < 5 * 60 * 1000) return;
      const s = await getSettings();
      if (s.biometricEnabled && biometryInfo.available) setShowBiometricLock(true);
    });
    return () => { removeListener(); };
  }, [authState]);

  useEffect(() => {
    if (authState !== 'authenticated') return;
    try { if (!localStorage.getItem('rakmana_onboarded')) setShowOnboarding(true); } catch {}
  }, [authState]);

  const setLocale = useUserStore((s) => s.setLocale);
  useEffect(() => {
    getSettings().then((s) => {
      const map: Record<string, MobileLocale> = { FR: 'fr', AR: 'ar', EN: 'en' };
      setLocale(map[s.language ?? 'FR'] ?? 'fr');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { dir } = useMobileI18n();
  const hasSavedDocs = useDocumentStore((s) => s.savedDocuments.length > 0);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'company') setCompanyView('profile');
    onTabChange?.(tab);
  }, [onTabChange]);

  const handleNewDevis = useCallback(() => { useDocumentStore.getState().setType('DEVIS'); setShowWizard(true); }, []);
  const handleNewFacture = useCallback(() => { useDocumentStore.getState().setType('FACTURE'); setShowWizard(true); }, []);
  const handleDuplicate = useCallback(() => setShowWizard(true), []);
  const handleWizardClose = useCallback(() => { setShowWizard(false); setEditingDocId(null); }, []);

  const handleLogout = useCallback(async () => {
    await fetch('/api/user/push-token', { method: 'DELETE', credentials: 'include' }).catch(() => {});
    await logout();
    setAuthView('welcome');
  }, [logout]);

  const handleEditDocument = useCallback((doc: Document) => { setEditingDocId(doc.id); setShowWizard(true); }, []);
  const handleDownloadDocument = useCallback(async (doc: Document) => {
    const t = getMobileT(useUserStore.getState().locale);
    try {
      const base64 = await generatePDFBase64FromDoc(doc);
      await downloadDocument(base64, doc.number || `${doc.type}-${doc.date}`);
      await notify(t('editor.downloadPdf'));
    } catch {
      await notify(t('toast.saveError'));
    }
  }, []);
  const handleDuplicateDocument = useCallback((doc: Document) => {
    useDocumentStore.getState().loadDocumentIntoWizard(doc.id);
    setEditingDocId(null);
    setShowWizard(true);
  }, []);

  const handleConfigureCompany = useCallback(() => {
    setShowWizard(false); setEditingDocId(null); setCompanyView('profile'); setActiveTab('company');
  }, []);

  const handleGoToClients = useCallback(() => setCompanyView('clients'), []);
  const handleBackToProfile = useCallback(() => setCompanyView('profile'), []);

  const processQueue = useSyncStore((s) => s.processQueue);
  const handleRetry = useCallback(() => {
    if (checkIsOnline()) void processQueue(processWebSyncItem);
  }, [processQueue]);

  useEffect(() => { if (authState === 'unauthenticated') setAuthView('welcome'); }, [authState]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            userName={userName || 'User'}
            onDocumentTap={handleEditDocument}
            onSeeAll={() => setActiveTab('documents')}
            onNewDevis={handleNewDevis}
            onNewFacture={handleNewFacture}
            onDuplicate={hasSavedDocs ? handleDuplicate : undefined}
            hasNotifications={hasUnread}
            onNotificationTap={() => { setHasUnread(false); setActiveTab('documents'); }}
          />
        );
      case 'documents':
        return (
          <DocumentsListScreen
            onNewDocument={handleNewDevis}
            onEditDocument={handleEditDocument}
            onDuplicateDocument={handleDuplicateDocument}
            onDownloadDocument={handleDownloadDocument}
          />
        );
      case 'company':
        if (companyView === 'clients') return <ClientsScreen onBack={handleBackToProfile} />;
        return <CompanyProfileScreen onGoToClients={handleGoToClients} />;
      case 'settings':
        return <SettingsScreen onLogout={handleLogout} />;
      default:
        return <HomeScreen userName={userName || 'User'} onDocumentTap={handleEditDocument} onSeeAll={() => setActiveTab('documents')} onNewDevis={handleNewDevis} onNewFacture={handleNewFacture} />;
    }
  };

  if (authState === 'loading') {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-[#F8FAFD]"
        style={{ paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0052CC] shadow-lg shadow-[#0052CC]/20">
            <Loader2 size={22} className="text-white animate-spin" />
          </div>
          <p className="text-xs text-[#718096]">Chargement…</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    if (authView === 'login') return <LoginScreen onLogin={login} onBackToWelcome={() => setAuthView('welcome')} onGoToRegister={() => setAuthView('register')} />;
    if (authView === 'register') return <RegisterScreen onRegister={register} onBackToLogin={() => setAuthView('login')} />;
    return <WelcomeScreen onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />;
  }

  if (showOnboarding) return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;

  return (
    <div
      dir={dir}
      className={cn('relative min-h-dvh bg-[#F8FAFD]', 'max-w-lg mx-auto')}
      style={{ paddingBottom: 'calc(60px + var(--sab, env(safe-area-inset-bottom, 0px)))', paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))' }}
    >
      <UpdateBanner
        visible={updateInfo.visible}
        newVersion={updateInfo.version}
        releaseNotes={updateInfo.releaseNotes}
        apkUrl={updateInfo.apkUrl}
        onDismiss={() => setUpdateInfo((u) => ({ ...u, visible: false }))}
      />

      <PushToast
        toast={pushToast}
        onDismiss={() => setPushToast(null)}
        onTap={(docId) => { setActiveTab('documents'); setEditingDocId(docId); setShowWizard(true); }}
      />

      <OfflineBanner />

      <main className="min-h-dvh">
        {renderScreen()}
      </main>

      <FAB
        onNewDevis={handleNewDevis}
        onNewFacture={handleNewFacture}
        onDuplicate={handleDuplicate}
        canDuplicate={hasSavedDocs}
      />

      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {showBiometricLock && (
        <BiometricLockScreen
          biometryType={biometryInfo.type}
          onUnlock={() => setShowBiometricLock(false)}
          onLogout={async () => { setShowBiometricLock(false); await handleLogout(); }}
        />
      )}

      <AnimatePresence>
        {showWizard && (
          <motion.div
            key="create-overlay"
            variants={overlayVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-[#F8FAFD]"
          >
            <CreateScreen
              onExit={handleWizardClose}
              editingDocId={editingDocId ?? undefined}
              onConfigureCompany={handleConfigureCompany}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
