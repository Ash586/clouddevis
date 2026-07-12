'use client';
import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKpiRow } from './DashboardKpiRow';
import { DashboardSidebar } from './DashboardSidebar';
import { QUICK_CREATE_TYPES, type DashboardStats } from './dashboardConstants';

interface UnifiedDashboardProps {
  userName: string;
  companyInfo?: { name?: string } | null;
  stats: DashboardStats;
  mode: 'ARTISAN' | 'ENTREPRISE';
}

export function UnifiedDashboard({ userName, stats, mode }: UnifiedDashboardProps) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState('');

  const handleQuickSearch = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickSearch.trim()) {
      router.push(`/dashboard?tab=documents&search=${encodeURIComponent(quickSearch.trim())}`);
    }
  }, [quickSearch, router]);

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-6 pt-6 pb-24 md:pb-6">
      <DashboardHeader userName={userName} mode={mode} stats={stats} />

      {/* Quick search — visible on mobile */}
      <div className="mb-4 md:hidden">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sand-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={quickSearch}
            onChange={e => setQuickSearch(e.target.value)}
            onKeyDown={handleQuickSearch}
            placeholder={t('searchDocs') || 'Rechercher un document...'}
            className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-2)] pl-10 pr-4 py-3 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all shadow-sm"
          />
        </div>
      </div>

      <DashboardKpiRow stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <QuickCreateSection />
        </div>
        <div className="lg:col-span-1">
          <DashboardSidebar stats={stats} />
        </div>
      </div>
    </main>
  );
}

function QuickCreateSection() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  return (
    <Card data-tour="quick-create-grid" className="p-5 border-[rgba(15,39,71,0.06)]">
      <h2 className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-4">
        {t('quickCreate')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {QUICK_CREATE_TYPES.map((qd) => (
          <button
            key={qd.type}
            type="button"
            onClick={() => router.push(`/dashboard/editor?type=${qd.type}`)}
            className="group flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl border border-[rgba(15,39,71,0.08)] bg-[var(--navy-2)] text-[var(--sand-muted)] hover:text-[var(--green-3)] hover:border-[rgba(37,99,235,0.25)] hover:bg-[rgba(37,99,235,0.06)] transition-all min-h-[80px]"
          >
            <qd.icon size={20} className="shrink-0" />
            <span className="text-[11px] font-bold text-center leading-tight">{t(`docTypes.${qd.labelKey}`)}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
