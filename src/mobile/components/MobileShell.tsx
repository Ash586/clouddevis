'use client';

// ============================================================
// Rakmana Mobile — App Shell
// Complete app shell with tab routing, wizard overlay,
// offline banner, and safe area management
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetwork } from '@/hooks/useNetwork';
import { useSyncStore } from '@/stores/syncStore';
import { useDocumentStore } from '@/stores/documentStore';
import { processWebSyncItem } from '@/lib/webSync';
import { useApiSync } from '@/mobile/lib/useApiSync';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { useMobileI18n, getMobileT } from '@/mobile/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { getSettings } from '@/lib/offline';
import type { MobileLocale } from '@/stores/userStore';
import { initPushNotifications, teardownPushNotifications } from '@/mobile/lib/pushNotifications';
import { isNativePlatform, exitApp, addBackPressListener, addAppStateListener } from '@/lib/native';
import { BottomTabs, type TabId } from './BottomTabs';
import { FAB } from './FAB';
import { OfflineBanner } from './OfflineBanner';
import { UpdateBanner } from './UpdateBanner';
import { PushToast, type PushToastData } from './PushToast';
import { LoginScreen } from '../screens/LoginScreen';
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

// ── Semver compare (major.minor.patch) ────────────────────────
function isOutdated(current: string, minimum: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const [cMaj, cMin, cPat] = parse(current);
  const [mMaj, mMin, mPat] = parse(minimum);
  if (cMaj !== mMaj) return cMaj < mMaj;
  if (cMin !== mMin) return cMin < mMin;
  return cPat < mPat;
}

// ── Company sub-views ────────────────────────────────────────
type CompanyView = 'profile' | 'clients';

// ── Slide animation for overlays ─────────────────────────────
const overlayVariants = {
  enter: { x: 300, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 },
};

interface MobileShellProps {
  /** Initial active tab (default: 'home') */
  initialTab?: TabId;
  /** Callback when tab changes */
  onTabChange?: (tab: TabId) => void;
}

export function MobileShell({ initialTab = 'home', onTabChange }: MobileShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
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

  // ── Android back button — refs hold live state to avoid stale closures ──
  const activeTabRef    = useRef<TabId>(initialTab);
  const showWizardRef   = useRef(false);
  const companyViewRef  = useRef<CompanyView>('profile');
  const backPressedOnce = useRef(false);
  const backPressTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with state
  useEffect(() => { activeTabRef.current   = activeTab;    }, [activeTab]);
  useEffect(() => { showWizardRef.current  = showWizard;   }, [showWizard]);
  useEffect(() => { companyViewRef.current = companyView;  }, [companyView]);

  // ── Android hardware back button ───────────────────────────
  useEffect(() => {
    if (!isNativePlatform()) return;

    const removeListener = addBackPressListener(() => {
      // 1. Wizard open → close it
      if (showWizardRef.current) {
        setShowWizard(false);
        setEditingDocId(null);
        return;
      }
      // 2. Company sub-view → back to profile
      if (companyViewRef.current === 'clients') {
        setCompanyView('profile');
        return;
      }
      // 3. Not on home tab → go home
      if (activeTabRef.current !== 'home') {
        setActiveTab('home');
        return;
      }
      // 4. Already on home — double-press within 2s to exit
      if (backPressedOnce.current) {
        if (backPressTimer.current) clearTimeout(backPressTimer.current);
        exitApp();
        return;
      }
      backPressedOnce.current = true;
      void import('@/mobile/lib/toast').then(({ notify }) => {
        notify(getMobileT(useUserStore.getState().locale)('nav.pressAgainToExit'));
      });
      backPressTimer.current = setTimeout(() => {
        backPressedOnce.current = false;
      }, 2000);
    });

    return () => {
      removeListener();
      if (backPressTimer.current) clearTimeout(backPressTimer.current);
    };
  }, []);

  // ── Update check ──────────────────────────────────────────
  const [updateInfo, setUpdateInfo] = useState<{
    visible: boolean;
    version: string;
    apkUrl: string;
    releaseNotes: string;
  }>({ visible: false, version: '', apkUrl: '', releaseNotes: '' });

  useEffect(() => {
    fetch('/api/mobile/version')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.minVersion && isOutdated(APP_VERSION, data.minVersion)) {
          setUpdateInfo({
            visible: true,
            version: data.minVersion,
            apkUrl: data.apkUrl ?? '',
            releaseNotes: data.releaseNotes ?? '',
          });
        }
      })
      .catch(() => {});
  }, []);

  // ── Auth: check session on mount, expose login/logout ─────
  const { authState, userName, onUnauthorized, login, logout } = useAuthGuard();

  // ── Bootstrap API only when authenticated ─────────────────
  useApiSync({ enabled: authState === 'authenticated', onUnauthorized });

  // ── Push notifications (init after auth, teardown on logout) ──
  useEffect(() => {
    if (authState !== 'authenticated') return;
    void initPushNotifications({
      onForeground: (title, body, payload) => {
        toastIdRef.current += 1;
        setPushToast({
          id: String(toastIdRef.current),
          title,
          body,
          documentId: payload.documentId,
        });
        setHasUnread(true);
      },
      onTap: (payload) => {
        if (payload.documentId) {
          // Navigate to documents tab and open the document
          setActiveTab('documents');
          setEditingDocId(payload.documentId);
          setShowWizard(true);
        }
      },
    });
    return () => { void teardownPushNotifications(); };
  }, [authState]);

  // ── Biometric: check availability after auth, lock on resume ─
  useEffect(() => {
    if (authState !== 'authenticated') return;
    void checkBiometry().then(setBiometryInfo);
  }, [authState]);

  useEffect(() => {
    if (authState !== 'authenticated') return;

    const removeListener = addAppStateListener(async (isActive) => {
      if (!isActive) {
        backgroundedAtRef.current = Date.now();
        return;
      }
      // App came to foreground
      const bgAt = backgroundedAtRef.current;
      backgroundedAtRef.current = null;
      if (!bgAt) return;
      const elapsed = Date.now() - bgAt;
      if (elapsed < 5 * 60 * 1000) return; // < 5 min — no lock
      // Check settings + biometry
      const s = await getSettings();
      if (s.biometricEnabled && biometryInfo.available) {
        setShowBiometricLock(true);
      }
    });

    return () => { removeListener(); };
  // biometryInfo.available intentionally excluded — checked async at foreground time
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState]);

  // ── Show onboarding on first login ever ───────────────────
  useEffect(() => {
    if (authState !== 'authenticated') return;
    try {
      if (!localStorage.getItem('rakmana_onboarded')) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowOnboarding(true);
      }
    } catch { /* private browsing */ }
  }, [authState]);

  // ── Sync saved language setting → userStore locale (once on mount) ──
  const setLocale = useUserStore((s) => s.setLocale);
  useEffect(() => {
    getSettings().then((s) => {
      const map: Record<string, MobileLocale> = { FR: 'fr', AR: 'ar', EN: 'en' };
      const loc = map[s.language ?? 'FR'] ?? 'fr';
      setLocale(loc);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { dir } = useMobileI18n();

  // ── Duplicate guard (reactive — re-renders FAB when first doc saved) ─
  const hasSavedDocs = useDocumentStore((s) => s.savedDocuments.length > 0);

  // ── Network detection ─────────────────────────────────────
  const { isOnline } = useNetwork();

  // ── Tab navigation ────────────────────────────────────────
  const handleTabChange = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      // Reset company sub-view when switching to company tab
      if (tab === 'company') {
        setCompanyView('profile');
      }
      onTabChange?.(tab);
    },
    [onTabChange],
  );

  // ── Wizard handlers ───────────────────────────────────────
  const handleNewDevis = useCallback(() => {
    useDocumentStore.getState().setType('DEVIS');
    setShowWizard(true);
  }, []);
  const handleNewFacture = useCallback(() => {
    useDocumentStore.getState().setType('FACTURE');
    setShowWizard(true);
  }, []);
  const handleDuplicate = useCallback(() => setShowWizard(true), []);
  const handleWizardClose = useCallback(() => {
    setShowWizard(false);
    setEditingDocId(null);
  }, []);

  // ── Logout: clear FCM token then call auth logout ─────────
  const handleLogout = useCallback(async () => {
    // Best-effort: clear token server-side before logging out
    await fetch('/api/user/push-token', { method: 'DELETE', credentials: 'include' }).catch(() => {});
    await logout();
  }, [logout]);

  // ── Document tap handler ──────────────────────────────────
  const handleEditDocument = useCallback((doc: Document) => {
    setEditingDocId(doc.id);
    setShowWizard(true);
  }, []);

  // ── Duplicate from the documents list: prefill the draft (new doc,
  // new number/date) and open the creator — NOT edit mode. ──
  const handleDuplicateDocument = useCallback((doc: Document) => {
    useDocumentStore.getState().loadDocumentIntoWizard(doc.id);
    setEditingDocId(null);
    setShowWizard(true);
  }, []);

  // ── Missing-company guard → land on the Company tab ──────
  const handleConfigureCompany = useCallback(() => {
    setShowWizard(false);
    setEditingDocId(null);
    setCompanyView('profile');
    setActiveTab('company');
  }, []);

  // ── Company navigation ────────────────────────────────────
  const handleGoToClients = useCallback(() => setCompanyView('clients'), []);
  const handleBackToProfile = useCallback(() => setCompanyView('profile'), []);

  // ── Network retry: flush pending queue ───────────────────
  // NOTE: must use the REAL processor — a stub `() => true` used to
  // clear the queue without actually syncing (silent data loss).
  const processQueue = useSyncStore((s) => s.processQueue);
  const handleRetry = useCallback(() => {
    if (isOnline) {
      void processQueue(processWebSyncItem);
    }
  }, [isOnline, processQueue]);

  // ── Render active tab screen ──────────────────────────────
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            userName={userName || 'Utilisateur'}
            onDocumentTap={handleEditDocument}
            onSeeAll={() => setActiveTab('documents')}
            hasNotifications={hasUnread}
            onNotificationTap={() => {
              setHasUnread(false);
              setActiveTab('documents');
            }}
          />
        );

      case 'documents':
        return (
          <DocumentsListScreen
            onNewDocument={handleNewDevis}
            onEditDocument={handleEditDocument}
            onDuplicateDocument={handleDuplicateDocument}
          />
        );

      case 'company':
        if (companyView === 'clients') {
          return <ClientsScreen onBack={handleBackToProfile} />;
        }
        return <CompanyProfileScreen onGoToClients={handleGoToClients} />;

      case 'settings':
        return <SettingsScreen onLogout={handleLogout} />;

      default:
        return (
          <HomeScreen
            userName={userName || 'Utilisateur'}
            onDocumentTap={handleEditDocument}
            onSeeAll={() => setActiveTab('documents')}
          />
        );
    }
  };

  // ── Loading splash (checking session) ────────────────────
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--green-2)] flex items-center justify-center">
            <Loader2 size={26} className="text-white animate-spin" />
          </div>
          <p className="text-sm text-[var(--sand-muted)]">Chargement…</p>
        </div>
      </div>
    );
  }

  // ── Login screen ──────────────────────────────────────────
  if (authState === 'unauthenticated') {
    return <LoginScreen onLogin={login} />;
  }

  // ── First-run onboarding ───────────────────────────────────
  if (showOnboarding) {
    return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <div
      dir={dir}
      className={cn(
        'relative min-h-screen bg-[var(--navy)]',
        'max-w-lg mx-auto',
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* APK update banner */}
      <UpdateBanner
        visible={updateInfo.visible}
        newVersion={updateInfo.version}
        releaseNotes={updateInfo.releaseNotes}
        apkUrl={updateInfo.apkUrl}
        onDismiss={() => setUpdateInfo((u) => ({ ...u, visible: false }))}
      />

      {/* Foreground push notification toast */}
      <PushToast
        toast={pushToast}
        onDismiss={() => setPushToast(null)}
        onTap={(docId) => {
          setActiveTab('documents');
          setEditingDocId(docId);
          setShowWizard(true);
        }}
      />

      {/* Offline/Online banner */}
      <OfflineBanner isOnline={isOnline} onRetry={handleRetry} />

      {/* Page content */}
      <main className="min-h-screen">
        {renderScreen()}
      </main>

      {/* FAB — quick document creation (replaces HomeScreen QuickActions) */}
      <FAB
        onNewDevis={handleNewDevis}
        onNewFacture={handleNewFacture}
        onDuplicate={handleDuplicate}
        canDuplicate={hasSavedDocs}
      />

      {/* Bottom tab bar */}
      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Biometric lock overlay ────────────────────────────── */}
      {showBiometricLock && (
        <BiometricLockScreen
          biometryType={biometryInfo.type}
          onUnlock={() => setShowBiometricLock(false)}
          onLogout={async () => {
            setShowBiometricLock(false);
            await handleLogout();
          }}
        />
      )}

      {/* ── Create overlay (FlashFacture single-canvas) ──────── */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            key="create-overlay"
            variants={overlayVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-[var(--navy)]"
          >
            {/* CreateScreen handles its own back/exit button */}
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
