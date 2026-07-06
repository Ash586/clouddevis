'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { TrialGate } from '@/components/layout/TrialGate';
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';
import { ClientsPanel } from '@/components/dashboard/panels/ClientsPanel';
import { DocumentsPanel } from '@/components/dashboard/panels/DocumentsPanel';
import type { DashboardStats } from '@/components/dashboard/dashboardConstants';

const DEFAULT_STATS: DashboardStats = {
  totalDocs: 0, monthDocs: 0, totalTTC: '0', totalClients: 0,
  trialDaysRemaining: 0, draftCount: 0, statusBreakdown: {}, typeBreakdown: {}, recentDraft: null,
};

const STALE_MS = 2 * 60 * 1000;

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') || '';

  const [userName, setUserName] = useState('');
  const [userMode, setUserMode] = useState('');
  const [companyInfo, setCompanyInfo] = useState<{ name?: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);

  const lastFetchRef = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = res.ok ? await res.json() : { user: {}, stats: {} };
      setUserName(data.user?.name || '');
      setUserMode(data.user?.mode || '');
      setCompanyInfo(data.user?.companyInfo || null);
      setStats(data.stats || DEFAULT_STATS);
      lastFetchRef.current = Date.now();
    } catch { /* silent */ }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchData(); }, [fetchData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetchRef.current > STALE_MS) fetchData();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchData]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 min-w-0">
        <TrialGate>
          {tab === 'clients' ? (
            <ClientsPanel />
          ) : tab === 'documents' ? (
            <DocumentsPanel />
          ) : (
            <UnifiedDashboard
              userName={userName}
              companyInfo={companyInfo}
              stats={stats}
              mode={userMode as 'ARTISAN' | 'ENTREPRISE'}
            />
          )}
        </TrialGate>
      </div>
    </div>
  );
}
