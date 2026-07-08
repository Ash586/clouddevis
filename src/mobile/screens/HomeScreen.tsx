'use client';

// ============================================================
// Rakmana Mobile — Home Screen
// Composed layout: Header → Stats → Quick Actions → Recent Docs
// Stats fetched from /api/dashboard; falls back to local store.
// ============================================================

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDocumentStore } from '@/stores/documentStore';
import { useDashboardStats } from '@/mobile/lib/useDashboardStats';
import { HomeHeader } from '../components/HomeHeader';
import { StatCards } from '../components/StatCards';
import { QuickActions } from '../components/QuickActions';
import { RecentDocuments } from '../components/RecentDocuments';
import type { Document } from '@/mobile/types';

interface HomeScreenProps {
  userName: string;
  onNewDevis?: () => void;
  onNewFacture?: () => void;
  onDuplicate?: () => void;
  onDocumentTap?: (doc: Document) => void;
  onSeeAll?: () => void;
  onNotificationTap?: () => void;
  hasNotifications?: boolean;
}

export function HomeScreen({
  userName,
  onNewDevis,
  onNewFacture,
  onDuplicate,
  onDocumentTap,
  onSeeAll,
  onNotificationTap,
  hasNotifications = false,
}: HomeScreenProps) {
  const savedDocuments = useDocumentStore((s) => s.savedDocuments);
  const setType        = useDocumentStore((s) => s.setType);
  const resetDocument  = useDocumentStore((s) => s.resetDocument);

  // ── Stats from API (falls back to local on error) ──────────
  const { stats, loading: statsLoading } = useDashboardStats(true);

  // ── User initials ──────────────────────────────────────────
  const initials = useMemo(() =>
    userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
  [userName]);

  // ── Action handlers ────────────────────────────────────────
  const handleNewDevis = useCallback(() => {
    resetDocument(); setType('DEVIS'); onNewDevis?.();
  }, [resetDocument, setType, onNewDevis]);

  const handleNewFacture = useCallback(() => {
    resetDocument(); setType('FACTURE'); onNewFacture?.();
  }, [resetDocument, setType, onNewFacture]);

  const handleDuplicate = useCallback(() => {
    if (savedDocuments.length === 0) return;
    useDocumentStore.getState().loadDocumentIntoWizard(
      savedDocuments[savedDocuments.length - 1].id,
    );
    onDuplicate?.();
  }, [savedDocuments, onDuplicate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 pb-4"
    >
      {/* 1. Header */}
      <HomeHeader
        userName={userName}
        userInitials={initials}
        hasNotifications={hasNotifications}
        onNotificationTap={onNotificationTap}
      />

      {/* 2. Stats 2×2 grid */}
      <StatCards stats={stats} loading={statsLoading} />

      {/* 3. Quick actions */}
      <QuickActions
        onNewDevis={handleNewDevis}
        onNewFacture={handleNewFacture}
        onDuplicate={handleDuplicate}
        canDuplicate={savedDocuments.length > 0}
      />

      {/* 4. Recent documents */}
      <RecentDocuments
        documents={savedDocuments}
        onDocumentTap={onDocumentTap}
        onSeeAll={onSeeAll}
      />
    </motion.div>
  );
}
