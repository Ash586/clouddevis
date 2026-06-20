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
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [stats, setStats] = useState({ totalDocs: 0, monthDocs: 0, totalTTC: '0', totalClients: 0, trialDaysRemaining: 0, draftCount: 0, statusBreakdown: {} as Record<string, number>, typeBreakdown: {} as Record<string, number>, recentDraft: null as { id: string; number: string; type: string; clientName: string; updatedAt: string } | null });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    Promise.all([
      fetch('/api/documents').then(r => r.ok ? r.json() : { documents: [] }),
      fetch('/api/dashboard').then(r => r.ok ? r.json() : { user: {}, stats: {} }),
    ])
      .then(([docData, dashData]) => {
        setDocs(docData.documents);
        setUserName(dashData.user?.name || '');
        setUserMode(dashData.user?.mode || '');
        setUserPhone(dashData.user?.phone || null);
        setCompanyInfo(dashData.user?.companyInfo || null);
        setStats(dashData.stats || { totalDocs: 0, monthDocs: 0, totalTTC: '0', totalClients: 0, trialDaysRemaining: 0, draftCount: 0, statusBreakdown: {}, typeBreakdown: {}, recentDraft: null });
      })
      .catch(() => { setDocs([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.ok) setDocs(prev => prev.filter(d => d.id !== id));
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
            userPhone={userPhone}
            companyInfo={companyInfo}
            stats={stats}
            docs={docs}
            loading={loading}
            onDelete={handleDelete}
            mode={userMode as 'ARTISAN' | 'ENTREPRISE'}
          />
        </TrialGate>

        {/* Mobile FAB — hidden on md+ */}
        <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
          <button
            onClick={() => router.push('/dashboard/editor')}
            className="w-14 h-14 rounded-full bg-[var(--green)] text-white shadow-lg shadow-[var(--green-glow)] flex items-center justify-center text-2xl font-bold active:scale-95 transition-transform"
            title="Nouveau document"
          >
            +
          </button>
        </div>

      </div>
    </div>
    </div>
  );
}
