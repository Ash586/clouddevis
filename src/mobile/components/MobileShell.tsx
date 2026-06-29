'use client';

// ============================================================
// CloudDevis Mobile — App Shell
// Complete app shell with tab routing, wizard overlay,
// offline banner, and safe area management
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetwork } from '@/hooks/useNetwork';
import { useSyncStore } from '@/stores/syncStore';
import { useApiSync } from '@/mobile/lib/useApiSync';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { initPushNotifications, teardownPushNotifications } from '@/mobile/lib/pushNotifications';
import { BottomTabs, type TabId } from './BottomTabs';
import { OfflineBanner } from './OfflineBanner';
import { PushToast, type PushToastData } from './PushToast';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DocumentsListScreen } from '../screens/DocumentsListScreen';
import { CompanyProfileScreen } from '../screens/CompanyProfileScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CreateScreen } from '../screens/CreateScreen';
import type { Document } from '@/mobile/types';

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
  const [showWizard, setShowWizard] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [companyView, setCompanyView] = useState<CompanyView>('profile');
  const [pushToast, setPushToast] = useState<PushToastData | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const toastIdRef = useRef(0);

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
  const handleNewDevis = useCallback(() => setShowWizard(true), []);
  const handleNewFacture = useCallback(() => setShowWizard(true), []);
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

  // ── Company navigation ────────────────────────────────────
  const handleGoToClients = useCallback(() => setCompanyView('clients'), []);
  const handleBackToProfile = useCallback(() => setCompanyView('profile'), []);

  // ── Network retry: flush pending queue ───────────────────
  const processQueue = useSyncStore((s) => s.processQueue);
  const handleRetry = useCallback(() => {
    if (isOnline) {
      void processQueue(async () => true);
    }
  }, [isOnline, processQueue]);

  // ── Render active tab screen ──────────────────────────────
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            userName={userName || 'Utilisateur'}
            onNewDevis={handleNewDevis}
            onNewFacture={handleNewFacture}
            onDuplicate={handleDuplicate}
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
            onNewDevis={handleNewDevis}
            onNewFacture={handleNewFacture}
            onDuplicate={handleDuplicate}
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

  return (
    <div
      className={cn(
        'relative min-h-screen bg-[var(--navy)]',
        'max-w-lg mx-auto',
      )}
      style={{
        // Safe area insets for notch/home indicator
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
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

      {/* Bottom tab bar */}
      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />

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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
