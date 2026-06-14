'use client';

// ============================================================
// CloudDevis Mobile — Home Screen
// Composed layout: Header → Stats → Quick Actions → Recent Docs
// ============================================================

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDocumentStore } from '@/stores/documentStore';
import { useCompanyStore } from '@/stores/companyStore';
import { HomeHeader } from '../components/HomeHeader';
import { StatCards } from '../components/StatCards';
import { QuickActions } from '../components/QuickActions';
import { RecentDocuments } from '../components/RecentDocuments';
import type { Document } from '@/mobile/types';

interface HomeScreenProps {
  /** User display name */
  userName: string;
  /** Callback when "Nouveau devis" is tapped */
  onNewDevis?: () => void;
  /** Callback when "Facture" is tapped */
  onNewFacture?: () => void;
  /** Callback when "Dupliquer" is tapped */
  onDuplicate?: () => void;
  /** Callback when a document row is tapped */
  onDocumentTap?: (doc: Document) => void;
  /** Callback when "Voir tout" is tapped */
  onSeeAll?: () => void;
  /** Callback when notification bell is tapped */
  onNotificationTap?: () => void;
  /** Whether there are unread notifications */
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
  const setType = useDocumentStore((s) => s.setType);
  const resetDocument = useDocumentStore((s) => s.resetDocument);

  // ── Compute stats ──
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonth = savedDocuments.filter((doc) => {
      const d = new Date(doc.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return {
      monthlyCount: thisMonth.length,
      paidCount: thisMonth.filter((d) => d.status === 'PAID').length,
    };
  }, [savedDocuments]);

  // ── User initials for avatar ──
  const initials = useMemo(() => {
    return userName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [userName]);

  // ── Action handlers ──
  const handleNewDevis = useCallback(() => {
    resetDocument();
    setType('DEVIS');
    onNewDevis?.();
  }, [resetDocument, setType, onNewDevis]);

  const handleNewFacture = useCallback(() => {
    resetDocument();
    setType('FACTURE');
    onNewFacture?.();
  }, [resetDocument, setType, onNewFacture]);

  const handleDuplicate = useCallback(() => {
    // If there's a most recent document, load it into wizard
    if (savedDocuments.length > 0) {
      const lastDoc = savedDocuments[savedDocuments.length - 1];
      const loadDocument = useDocumentStore.getState().loadDocumentIntoWizard;
      loadDocument(lastDoc.id);
    }
    onDuplicate?.();
  }, [savedDocuments, onDuplicate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 pb-4"
    >
      {/* 1. Header: logo + avatar */}
      <HomeHeader
        userName={userName}
        userInitials={initials}
        hasNotifications={hasNotifications}
        onNotificationTap={onNotificationTap}
      />

      {/* 2. Stats row */}
      <StatCards
        monthlyCount={stats.monthlyCount}
        paidCount={stats.paidCount}
      />

      {/* 3. Quick action buttons */}
      <QuickActions
        onNewDevis={handleNewDevis}
        onNewFacture={handleNewFacture}
        onDuplicate={handleDuplicate}
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
