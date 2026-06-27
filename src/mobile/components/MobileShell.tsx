'use client';

// ============================================================
// CloudDevis Mobile — App Shell
// Complete app shell with tab routing, wizard overlay,
// offline banner, and safe area management
// ============================================================

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetwork } from '@/hooks/useNetwork';
import { useSyncStore } from '@/stores/syncStore';
import { useApiSync } from '@/mobile/lib/useApiSync';
import { BottomTabs, type TabId } from './BottomTabs';
import { OfflineBanner } from './OfflineBanner';
import { HomeScreen } from '../screens/HomeScreen';
import { DocumentsListScreen } from '../screens/DocumentsListScreen';
import { CompanyProfileScreen } from '../screens/CompanyProfileScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WizardScreen } from '../screens/WizardScreen';
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
  const [companyView, setCompanyView] = useState<CompanyView>('profile');

  // Bootstrap API: pull initial data + wire reconnect → flush queue
  useApiSync();

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
  const handleWizardClose = useCallback(() => setShowWizard(false), []);

  // ── Document tap handler ──────────────────────────────────
  const handleEditDocument = useCallback((doc: Document) => {
    // TODO: open document detail view or edit wizard
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
            userName="Utilisateur"
            onNewDevis={handleNewDevis}
            onNewFacture={handleNewFacture}
            onDuplicate={handleDuplicate}
            onDocumentTap={handleEditDocument}
            onSeeAll={() => setActiveTab('documents')}
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
        return <SettingsScreen />;

      default:
        return (
          <HomeScreen
            userName="Utilisateur"
            onNewDevis={handleNewDevis}
            onNewFacture={handleNewFacture}
            onDuplicate={handleDuplicate}
            onDocumentTap={handleEditDocument}
            onSeeAll={() => setActiveTab('documents')}
          />
        );
    }
  };

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
      {/* Offline/Online banner */}
      <OfflineBanner isOnline={isOnline} onRetry={handleRetry} />

      {/* Page content */}
      <main className="min-h-screen">
        {renderScreen()}
      </main>

      {/* Bottom tab bar */}
      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Wizard overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            key="wizard-overlay"
            variants={overlayVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-[var(--navy)]"
          >
            {/* Back button */}
            <button type="button"               onClick={handleWizardClose}
              className={cn(
                'absolute top-4 left-4 z-10',
                'flex items-center gap-1 px-3 py-2 rounded-lg',
                'bg-[rgba(15,39,71,0.08)] text-[var(--sand)]',
                'active:scale-95 transition-transform',
              )}
              aria-label="Retour"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Retour</span>
            </button>

            {/* Wizard content */}
            <WizardScreen
              onExit={handleWizardClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
