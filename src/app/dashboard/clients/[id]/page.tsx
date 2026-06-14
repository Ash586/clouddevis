'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClientInfo {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  ice: string | null;
  matriculeFiscal: string | null;
  siret: string | null;
  createdAt: string;
}

interface ClientStats {
  totalDocs: number;
  totalTTC: number;
  totalTVA: number;
}

interface Doc {
  id: string;
  number: string;
  type: string;
  status: string;
  total: string;
  date: string;
}

const TYPE_LABELS: Record<string, string> = {
  DEVIS: 'Devis', PROFORMA: 'Proforma', BC: 'B. Commande', BR: 'B. Réception', FACTURE: 'Facture',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACCEPTED: 'bg-green-50 text-green-600',
  PROGRESS: 'bg-amber-50 text-amber-600',
  DELIVERED: 'bg-blue-50 text-blue-600',
};

export default function ClientDetailPage() {
  const t = useTranslations('clients');
  const tc = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<ClientInfo | null>(null);
  const [stats, setStats] = useState<ClientStats>({ totalDocs: 0, totalTTC: 0, totalTVA: 0 });
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setStats(data.stats);
        setDocuments(data.documents);
      } else {
        router.push('/dashboard/clients');
      }
    } catch {
      router.push('/dashboard/clients');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchClient(); }, [fetchClient]);

  function formatCurrency(value: number) {
    return value.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-row flex-1">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <TrialGate>
              <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 w-48 bg-slate-200 rounded" />
                  <div className="h-32 bg-slate-100 rounded-xl" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
                  </div>
                </div>
              </div>
            </TrialGate>
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/clients')}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  {t('back')}
                </Button>
              </div>

              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900">{client.name}</h1>
                    <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                      {client.address && <p>{client.address}</p>}
                      {client.phone && <p>{client.phone}</p>}
                      {client.email && <p>{client.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {client.nif && <span className="px-2 py-1 bg-slate-100 rounded-lg font-medium">NIF: {client.nif}</span>}
                    {client.nis && <span className="px-2 py-1 bg-slate-100 rounded-lg font-medium">NIS: {client.nis}</span>}
                    {client.rc && <span className="px-2 py-1 bg-slate-100 rounded-lg font-medium">RC: {client.rc}</span>}
                  </div>
                </div>
                {(client.ice || client.matriculeFiscal || client.siret) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    {client.ice && <span>ICE: {client.ice}</span>}
                    {client.matriculeFiscal && <span>MF: {client.matriculeFiscal}</span>}
                    {client.siret && <span>SIRET: {client.siret}</span>}
                  </div>
                )}
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('totalDocs')}</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{stats.totalDocs}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('totalTTC')}</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalTTC)}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('totalTVA')}</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(stats.totalTVA)}</p>
                </Card>
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900 mb-4">{t('documents')}</h2>
                {documents.length === 0 ? (
                  <Card className="text-center py-8">
                    <div className="text-3xl mb-2">📄</div>
                    <p className="text-sm text-slate-500">{t('noDocuments')}</p>
                  </Card>
                ) : (
                  <Card className="overflow-x-auto p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{t('number')}</th>
                          <th className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{t('type')}</th>
                          <th className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{tc('status')}</th>
                          <th className="text-end px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{t('total')}</th>
                          <th className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{t('date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3 font-medium text-slate-900">{doc.number}</td>
                            <td className="px-4 py-3 text-slate-600">{TYPE_LABELS[doc.type] ?? doc.type}</td>
                            <td className="px-4 py-3">
                              <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-semibold', STATUS_COLORS[doc.status] ?? 'bg-slate-100 text-slate-600')}>
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-end font-medium text-slate-900">{doc.total}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{doc.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                )}
              </div>
            </div>
          </TrialGate>
        </div>
      </div>
    </div>
  );
}
