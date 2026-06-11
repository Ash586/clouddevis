'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DocSummary {
  id: string; number: string; type: string; client: string;
  total: string; date: string; status: string;
}

interface ArtisanDashboardProps {
  userName: string;
  userPhone: string | null;
  stats: { totalDocs: number; monthDocs: number; totalTTC: string; totalClients: number; trialDaysRemaining: number };
  docs: DocSummary[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'draft', ACCEPTED: 'accepted', PROGRESS: 'progress', DELIVERED: 'delivered',
};

const TYPE_LABELS: Record<string, string> = {
  DEVIS: 'Devis', PROFORMA: 'Proforma', BC: 'B. Commande', BR: 'B. Réception', FACTURE: 'Facture',
};

export function ArtisanDashboard({ userName, userPhone, stats, docs, loading, onDelete }: ArtisanDashboardProps) {
  const t = useTranslations('dashboard');
  const common = useTranslations('common');
  const router = useRouter();

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--sand)]">{t('welcome')} {userName}</h1>
        <p className="text-sm text-[var(--sand-muted)] mt-1">{t('artisanMode')} — {t('subtitle')}</p>
        {userPhone && <p className="text-xs text-[var(--sand-muted)] mt-1">{common('phone')} : {userPhone}</p>}
      </div>

      <div className="flex gap-3 mb-8">
        <Button size="lg" onClick={() => router.push('/dashboard/editor?mode=artisan')}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('newQuote')}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide">{t('statDocuments')}</p>
          <p className="text-2xl font-black text-[var(--sand)] mt-1">{stats.totalDocs}</p>
          <p className="text-[10px] text-[var(--sand-muted)] mt-0.5">{t('statThisMonth')} : {stats.monthDocs}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide">{t('statTotal')}</p>
          <p className="text-2xl font-black text-[var(--sand)] mt-1">{stats.totalTTC} {common('currency')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide">{t('statClients')}</p>
          <p className="text-2xl font-black text-[var(--sand)] mt-1">{stats.totalClients}</p>
          <p className="text-[10px] text-[var(--sand-muted)] mt-0.5">{t('statRegistered')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide">{t('statTrialDays')}</p>
          <p className="text-2xl font-black text-[var(--sand)] mt-1">{stats.trialDaysRemaining}</p>
          <p className="text-[10px] text-[var(--sand-muted)] mt-0.5">{t('statRemaining')}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--sand)]">{t('recentDocs')}</h2>
        </div>
        {loading ? (
          <div className="text-center py-12"><p className="text-sm text-[var(--sand-muted)]">{common('loading')}</p></div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm text-[var(--sand-muted)]">{t('noDocs')}</p>
            <Button className="mt-4" size="sm" onClick={() => router.push('/dashboard/editor?mode=artisan')}>
              {t('createFirst')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[var(--sand-muted)] text-xs font-semibold">
                  <th className="pb-3 px-2">{t('tableNumber')}</th>
                  <th className="pb-3 px-2">{t('tableType')}</th>
                  <th className="pb-3 px-2">{t('tableClient')}</th>
                  <th className="pb-3 px-2 text-right">{t('tableTotal')}</th>
                  <th className="pb-3 px-2">{t('tableDate')}</th>
                  <th className="pb-3 px-2">{t('tableStatus')}</th>
                  <th className="pb-3 px-2 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} className="border-b border-[rgba(245,237,214,0.04)] hover:bg-[rgba(245,237,214,0.02)] transition cursor-pointer"
                    onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                    <td className="py-3 px-2 font-medium text-[var(--sand)]">{doc.number || '—'}</td>
                    <td className="py-3 px-2 text-[var(--sand-muted)]">{TYPE_LABELS[doc.type] || doc.type}</td>
                    <td className="py-3 px-2 text-[var(--sand-2)]">{doc.client || '—'}</td>
                    <td className="py-3 px-2 text-right font-semibold text-[var(--sand)]">{doc.total} {common('currency')}</td>
                    <td className="py-3 px-2 text-[var(--sand-muted)]">{doc.date}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        doc.status === 'DRAFT' ? 'bg-[var(--navy-4)] text-[var(--sand-muted)]' :
                        doc.status === 'DELIVERED' ? 'bg-[rgba(0,149,77,0.1)] text-[var(--green-3)]' :
                        doc.status === 'ACCEPTED' ? 'bg-blue-400/10 text-blue-400' :
                        doc.status === 'PROGRESS' ? 'bg-amber-400/10 text-amber-400' :
                        'bg-[var(--navy-4)] text-[var(--sand-muted)]'
                      }`}>
                        {common(STATUS_LABELS[doc.status] || 'draft')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                        className="text-red-400 hover:text-red-600 text-xs font-bold transition"
                        title={common('delete')}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-6 p-4 bg-amber-400/10 border-amber-400/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-400">{common('freeTrial')}</p>
            <p className="text-xs text-amber-400">{common('trialDaysLeft', { days: String(stats.trialDaysRemaining) })}</p>
          </div>
          <Button size="sm" variant="outline" className="border-amber-400/20 text-amber-400 hover:bg-amber-400/10">
            {common('upgradeToPro')}
          </Button>
        </div>
      </Card>
    </main>
  );
}
