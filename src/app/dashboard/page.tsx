'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { ArtisanDashboard } from '@/components/dashboard/ArtisanDashboard';
import { EnterpriseDashboard } from '@/components/dashboard/EnterpriseDashboard';

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
  const common = useTranslations('common');
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [userName, setUserName] = useState('');
  const [userMode, setUserMode] = useState('');
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [stats, setStats] = useState({ totalDocs: 0, monthDocs: 0, totalTTC: '0', totalClients: 0, trialDaysRemaining: 0 });
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
        setStats(dashData.stats || { totalDocs: 0, monthDocs: 0, totalTTC: '0', totalClients: 0, trialDaysRemaining: 0 });
      })
      .catch(() => { setDocs([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(common('yesDelete'))) return;
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.ok) setDocs(prev => prev.filter(d => d.id !== id));
  }, [common]);

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
          {userMode === 'ENTREPRISE' ? (
            <EnterpriseDashboard
              userName={userName}
              companyInfo={companyInfo}
              stats={stats}
              docs={docs}
              loading={loading}
              onDelete={handleDelete}
            />
          ) : (
            <ArtisanDashboard
              userName={userName}
              userPhone={userPhone}
              stats={stats}
              docs={docs}
              loading={loading}
              onDelete={handleDelete}
            />
          )}
        </TrialGate>
      </div>
    </div>
    </div>
  );
}
