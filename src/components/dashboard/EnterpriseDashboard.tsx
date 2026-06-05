'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

interface EnterpriseDashboardProps {
  userName: string;
  companyInfo: CompanyInfo | null;
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

export function EnterpriseDashboard({ userName, companyInfo, stats, docs, loading, onDelete }: EnterpriseDashboardProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const te = useTranslations('editor');
  const router = useRouter();
  const tax = companyInfo?.taxIds;

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('welcome')} {userName}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('businessMode')} — {t('subtitle')}</p>
        {companyInfo && (
          <Card className="mt-3 p-3 bg-blue-50/50 border-blue-100">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              {companyInfo.name && (
                <div>
                  <span className="font-semibold text-slate-500">{te('client.companyName')} :</span>
                  <span className="ml-1 text-slate-800">{companyInfo.name}</span>
                </div>
              )}
              {tax?.rc && (
                <div>
                  <span className="font-semibold text-slate-500">{te('client.companyRc')} :</span>
                  <span className="ml-1 text-slate-800">{tax.rc}</span>
                </div>
              )}
              {tax?.nif && (
                <div>
                  <span className="font-semibold text-slate-500">{te('client.companyNif')} :</span>
                  <span className="ml-1 text-slate-800">{tax.nif}</span>
                </div>
              )}
              {tax?.nis && (
                <div>
                  <span className="font-semibold text-slate-500">{te('client.companyNis')} :</span>
                  <span className="ml-1 text-slate-800">{tax.nis}</span>
                </div>
              )}
              {tax?.ai && (
                <div>
                  <span className="font-semibold text-slate-500">{te('client.companyAi')} :</span>
                  <span className="ml-1 text-slate-800">{tax.ai}</span>
                </div>
              )}
              {companyInfo.capital && (
                <div>
                  <span className="font-semibold text-slate-500">{tc('total')} :</span>
                  <span className="ml-1 text-slate-800">{companyInfo.capital} {tc('currency')}</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="flex gap-3 mb-4 sm:mb-8">
        <Button size="md" className="sm:hidden" onClick={() => router.push('/dashboard/editor?mode=entreprise')}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('newQuote')}
        </Button>
        <Button size="lg" className="hidden sm:inline-flex" onClick={() => router.push('/dashboard/editor?mode=entreprise')}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('newQuote')}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        <Card className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('statDocuments')}</p>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{stats.totalDocs}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{t('statThisMonth')} : {stats.monthDocs}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('statTotal')}</p>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{stats.totalTTC} {tc('currency')}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('statClients')}</p>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{stats.totalClients}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{t('statRegistered')}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('statTrialDays')}</p>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{stats.trialDaysRemaining}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{t('statRemaining')}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">{t('recentDocs')}</h2>
        </div>
        {loading ? (
          <div className="text-center py-12"><p className="text-sm text-slate-400">{tc('loading')}</p></div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm text-slate-400">{t('noDocs')}</p>
            <Button className="mt-4" size="sm" onClick={() => router.push('/dashboard/editor?mode=entreprise')}>
              {t('createFirst')}
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-400 text-xs font-semibold">
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
                    <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer"
                      onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                      <td className="py-3 px-2 font-medium text-slate-800">{doc.number || '—'}</td>
                      <td className="py-3 px-2 text-slate-500">{TYPE_LABELS[doc.type] || doc.type}</td>
                      <td className="py-3 px-2 text-slate-700">{doc.client || '—'}</td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-900">{doc.total} {tc('currency')}</td>
                      <td className="py-3 px-2 text-slate-400">{doc.date}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          doc.status === 'DRAFT' ? 'bg-slate-100 text-slate-500' :
                          doc.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                          doc.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-600' :
                          doc.status === 'PROGRESS' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {tc(STATUS_LABELS[doc.status] || 'draft')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                          className="text-red-400 hover:text-red-600 text-xs font-bold transition"
                          title={tc('delete')}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="bg-slate-50 rounded-xl p-3 cursor-pointer active:bg-slate-100 transition"
                  onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{doc.number || '—'}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      doc.status === 'DRAFT' ? 'bg-slate-200 text-slate-500' :
                      doc.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                      doc.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-600' :
                      doc.status === 'PROGRESS' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {tc(STATUS_LABELS[doc.status] || 'draft')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{TYPE_LABELS[doc.type] || doc.type}</span>
                    <span className="font-bold text-slate-900">{doc.total} {tc('currency')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{doc.client || '—'}</span>
                    <span>{doc.date}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                    className="text-red-400 hover:text-red-600 text-[10px] font-bold mt-1">
                    {tc('delete')}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50/50 border-amber-100">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-amber-800">{tc('freeTrial')}</p>
            <p className="text-[10px] sm:text-xs text-amber-600">{tc('trialDaysLeft', { days: String(stats.trialDaysRemaining) })}</p>
          </div>
          <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100 shrink-0">
            {tc('upgradeToPro')}
          </Button>
        </div>
      </Card>
    </main>
  );
}
