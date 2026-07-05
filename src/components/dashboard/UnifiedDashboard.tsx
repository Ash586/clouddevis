'use client';
import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Clock, ArrowRight, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKpiRow } from './DashboardKpiRow';
import { DashboardDocumentsPanel } from './DashboardDocumentsPanel';
import { DashboardSidebar } from './DashboardSidebar';
import type { DashboardStats, DocSummary } from './dashboardConstants';

interface UnifiedDashboardProps {
  userName: string;
  companyInfo?: { name?: string } | null;
  stats: DashboardStats;
  docs: DocSummary[];
  loading: boolean;
  onDelete: (id: string) => void;
  mode: 'ARTISAN' | 'ENTREPRISE';
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: string;
  onTypeFilterChange: (t: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (column: string) => void;
}

export function UnifiedDashboard({
  userName, stats, docs, loading, onDelete, mode,
  page, totalPages, onPageChange,
  searchQuery, onSearchChange,
  typeFilter, onTypeFilterChange,
  sortBy, sortOrder, onSortChange,
}: UnifiedDashboardProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) { onDelete(deleteTarget); setDeleteTarget(null); }
  }, [deleteTarget, onDelete]);

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-6 pt-6 pb-24 md:pb-6">
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />

      {/* Trial banner — slim strip */}
      {stats.trialDaysRemaining > 0 && (
        <TrialBanner days={stats.trialDaysRemaining} onUpgrade={() => router.push('/dashboard/subscription')} />
      )}

      <DashboardHeader
        userName={userName}
        mode={mode}
      />

      <DashboardKpiRow stats={stats} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <DashboardDocumentsPanel
            docs={docs}
            loading={loading}
            totalDocs={stats.totalDocs}
            page={page}
            totalPages={totalPages}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={onPageChange}
            onSearchChange={onSearchChange}
            onTypeFilterChange={onTypeFilterChange}
            onSortChange={onSortChange}
            onDeleteRequest={setDeleteTarget}
          />
        </div>
        <div className="lg:col-span-1">
          <DashboardSidebar stats={stats} />
        </div>
      </div>
    </main>
  );
}

/* ── Trial Banner ── */
function TrialBanner({ days, onUpgrade }: { days: number; onUpgrade: () => void }) {
  const t = useTranslations('dashboard');
  const urgent = days <= 2;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-5 border ${
      urgent
        ? 'border-red-400/25 bg-[rgba(239,68,68,0.07)]'
        : 'border-[rgba(212,168,67,0.18)] bg-[rgba(212,168,67,0.05)]'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${urgent ? 'bg-red-400/10 animate-pulse' : 'bg-[rgba(212,168,67,0.1)]'}`}>
        <Clock size={16} className={urgent ? 'text-red-400' : 'text-[var(--gold)]'} />
      </div>
      <p className={`flex-1 text-xs font-semibold ${urgent ? 'text-red-400' : 'text-[var(--sand)]'}`}>
        {t('trialDaysLeft', { count: days })}
        {!urgent && <span className="text-[var(--sand-muted)] font-normal ms-2">{t('trialUpgradeHint')}</span>}
      </p>
      <Button variant={urgent ? 'danger' : 'gold'} onClick={onUpgrade} className="shrink-0 !py-1.5 !text-xs">
        {t('upgrade')} <ArrowRight size={13} className="ms-1" />
      </Button>
    </div>
  );
}

/* ── Delete Modal ── */
function DeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const tc = useTranslations('common');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
      <div className="relative bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] sm:rounded-2xl rounded-t-2xl shadow-2xl p-6 w-full sm:w-80 sm:max-w-[90%] animate-in sm:mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center sm:hidden pt-1 pb-2"><div className="w-10 h-1 rounded-full bg-[rgba(15,39,71,0.1)]" /></div>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-400/10 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--sand)] mb-2">{tc('deleteModal.title')}</h3>
          <p className="text-xs text-[var(--sand-muted)] mb-6">{tc('deleteModal.description')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[var(--navy-3)] text-[var(--sand-muted)] text-sm font-bold rounded-xl hover:bg-[var(--navy-4)] transition order-2 sm:order-1">
              {tc('deleteModal.cancel')}
            </button>
            <button type="button" onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition order-1 sm:order-2">
              {tc('deleteModal.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
