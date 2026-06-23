'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Card } from '@/components/ui/card';
import { MobileTable } from '@/components/mobile/MobileTable';

interface SharedDoc {
  id: string; number: string; type: string; status: string;
  total: number; client: string; sharedBy: string;
  permission: string; date: string; sharedAt: string;
}

export default function SharedDocumentsPage() {
  const t = useTranslations('shared');
  const tc = useTranslations('common');
  const router = useRouter();
  const [docs, setDocs] = useState<SharedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch('/api/documents/shared')
      .then(r => r.ok ? r.json() : { documents: [] })
      .then(d => setDocs(d.documents))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? docs : docs.filter(d => d.permission === filter.toUpperCase());

  const columns = [
    { key: 'number', label: t('table.number') },
    { key: 'type', label: t('table.type') },
    { key: 'sharedBy', label: t('table.sharedBy') },
    { key: 'total', label: t('table.total'), render: (v: unknown) => `${Number(v).toLocaleString()} ${tc('currency')}` },
    { key: 'permission', label: t('table.permission') },
    { key: 'date', label: t('table.date') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
            <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--sand)] mb-6">{t('title')}</h1>

              <div className="flex gap-2 mb-4">
                {['all', 'view', 'edit'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filter === f ? 'bg-[var(--green-2)] text-white' : 'bg-[var(--navy-3)] text-[var(--sand-2)] hover:bg-[var(--navy-4)]'}`}>
                    {t(`filter.${f}`)}
                  </button>
                ))}
              </div>

              <Card className="p-4">
                {loading ? (
                  <div className="py-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-10 h-10 text-[var(--sand-muted)] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    <p className="text-sm text-[var(--sand-muted)]">{t('empty')}</p>
                  </div>
                ) : (
                  <MobileTable columns={columns} data={filtered} keyField="id"
                    onRowClick={(row) => {
                      const d = row as SharedDoc;
                      if (d.permission === 'EDIT') router.push(`/dashboard/editor?id=${d.id}`);
                    }} />
                )}
              </Card>
            </main>
          </TrialGate>
        </div>
      </div>
    </div>
  );
}
