'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';

interface CompanyInfo {
  name?: string;
  address?: string;
  capital?: string;
  taxIds?: { nif?: string; nis?: string; rc?: string; ai?: string };
}

interface DocSummary {
  id: string; number: string; type: string; client: string;
  total: string; date: string; status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [userName, setUserName] = useState('');
  const [userMode, setUserMode] = useState('');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [stats, setStats] = useState({ totalDocs: 0, monthDocs: 0, totalTTC: '0', totalClients: 0, trialDaysRemaining: 0, draftCount: 0, statusBreakdown: {} as Record<string, number>, typeBreakdown: {} as Record<string, number>, recentDraft: null as { id: string; number: string; type: string; clientName: string; updatedAt: string } | null });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const docParams = new URLSearchParams({ page: String(page), limit: '20', sortBy, sortOrder });
      if (searchQuery.trim()) docParams.set('search', searchQuery.trim());
      if (typeFilter !== 'ALL') docParams.set('type', typeFilter);

      const [docRes, dashRes] = await Promise.all([
        fetch(`/api/documents?${docParams}`),
        fetch('/api/dashboard'),
      ]);

      const docData = docRes.ok ? await docRes.json() : { documents: [], pagination: { totalPages: 1 } };
      const dashData = dashRes.ok ? await dashRes.json() : { user: {}, stats: {} };

      setDocs(docData.documents || []);
      setTotalPages(docData.pagination?.totalPages || 1);
      setUserName(dashData.user?.name || '');
      setUserMode(dashData.user?.mode || '');
      setCompanyInfo(dashData.user?.companyInfo || null);
      setStats(dashData.stats || { totalDocs: 0, monthDocs: 0, totalTTC: '0', totalClients: 0, trialDaysRemaining: 0, draftCount: 0, statusBreakdown: {}, typeBreakdown: {}, recentDraft: null });
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, typeFilter, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  }, [fetchData]);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const handleTypeFilterChange = useCallback((t: string) => {
    setTypeFilter(t);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((column: string) => {
    setSortBy(prev => {
      if (prev === column) {
        setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        return prev;
      }
      setSortOrder('desc');
      return column;
    });
    setPage(1);
  }, []);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') fetchData(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchData]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
          <UnifiedDashboard
            userName={userName}
            companyInfo={companyInfo}
            stats={stats}
            docs={docs}
            loading={loading}
            onDelete={handleDelete}
            mode={userMode as 'ARTISAN' | 'ENTREPRISE'}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            typeFilter={typeFilter}
            onTypeFilterChange={handleTypeFilterChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        </TrialGate>

        {/* Mobile primary FAB — stacked above the nav-menu trigger, same right edge */}
        <button
          onClick={() => router.push('/dashboard/editor')}
          className="md:hidden fixed right-5 z-[140] h-14 px-5 rounded-full bg-[var(--green-2)] text-white shadow-lg shadow-[rgba(37,99,235,0.35)] flex items-center gap-2 text-sm font-bold active:scale-95 transition-transform hover:bg-[var(--green-3)]"
          style={{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom, 0px))' }}
          title="Nouveau document"
          aria-label="Nouveau document"
        >
          <span className="text-xl leading-none">+</span>
          <span>Nouveau</span>
        </button>

      </div>
    </div>
    </div>
  );
}
