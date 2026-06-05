'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CompanyInfo {
  name?: string; address?: string; capital?: string;
  taxIds?: { nif?: string; nis?: string; rc?: string; ai?: string };
}

interface DocSummary {
  id: string; number: string; type: string; client: string;
  total: string; date: string; status: string;
}

interface UnifiedDashboardProps {
  userName: string;
  userPhone?: string | null;
  companyInfo?: CompanyInfo | null;
  stats: { totalDocs: number; monthDocs: number; totalTTC: string; totalClients: number; trialDaysRemaining: number };
  docs: DocSummary[];
  loading: boolean;
  onDelete: (id: string) => void;
  mode: 'ARTISAN' | 'ENTREPRISE';
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'draft', ACCEPTED: 'accepted', PROGRESS: 'progress', DELIVERED: 'delivered',
};

const TYPE_LABELS: Record<string, string> = {
  DEVIS: 'Devis', PROFORMA: 'Proforma', BC: 'B. Commande', BR: 'B. Réception', FACTURE: 'Facture',
};

function DeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 max-w-[90%] animate-in" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-3xl mb-3">
            <svg className="w-10 h-10 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Supprimer ce document ?</h3>
          <p className="text-xs text-slate-500 mb-5">Cette action est irréversible.</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition">Annuler</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UnifiedDashboard({ userName, userPhone, companyInfo, stats, docs, loading, onDelete, mode }: UnifiedDashboardProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const te = useTranslations('editor');
  const router = useRouter();
  const isEnt = mode === 'ENTREPRISE';
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const tax = companyInfo?.taxIds;

  const filteredDocs = docs.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return doc.number.toLowerCase().includes(q) || doc.client.toLowerCase().includes(q) || (TYPE_LABELS[doc.type] || doc.type).toLowerCase().includes(q);
  });

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('welcome')} {userName}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isEnt ? t('businessMode') : t('artisanMode')} — {t('subtitle')}
        </p>
        {!isEnt && userPhone && <p className="text-xs text-slate-400 mt-1">{tc('phone')} : {userPhone}</p>}
        {isEnt && companyInfo && (
          <Card className="mt-3 p-3 bg-blue-50/50 border-blue-100">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              {companyInfo.name && <div><span className="font-semibold text-slate-500">{te('client.companyName')} :</span><span className="ml-1 text-slate-800">{companyInfo.name}</span></div>}
              {tax?.rc && <div><span className="font-semibold text-slate-500">{te('client.companyRc')} :</span><span className="ml-1 text-slate-800">{tax.rc}</span></div>}
              {tax?.nif && <div><span className="font-semibold text-slate-500">{te('client.companyNif')} :</span><span className="ml-1 text-slate-800">{tax.nif}</span></div>}
              {tax?.nis && <div><span className="font-semibold text-slate-500">{te('client.companyNis')} :</span><span className="ml-1 text-slate-800">{tax.nis}</span></div>}
              {tax?.ai && <div><span className="font-semibold text-slate-500">{te('client.companyAi')} :</span><span className="ml-1 text-slate-800">{tax.ai}</span></div>}
              {companyInfo.capital && <div><span className="font-semibold text-slate-500">{tc('total')} :</span><span className="ml-1 text-slate-800">{companyInfo.capital} {tc('currency')}</span></div>}
            </div>
          </Card>
        )}
      </div>

      <div className="flex gap-3 mb-4 sm:mb-8">
        <Button size="md" className="sm:hidden" onClick={() => router.push(`/dashboard/editor?mode=${isEnt ? 'entreprise' : 'artisan'}`)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('newQuote')}
        </Button>
        <Button size="lg" className="hidden sm:inline-flex" onClick={() => router.push(`/dashboard/editor?mode=${isEnt ? 'entreprise' : 'artisan'}`)}>
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
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="font-semibold text-slate-900">{t('recentDocs')}</h2>
          {docs.length > 0 && (
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder={tc('search') || 'Rechercher…'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-40 sm:w-56" />
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-center py-12"><p className="text-sm text-slate-400">{tc('loading')}</p></div>
        ) : docs.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m0-3h6m-6 6h6m2.25-9V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0022.5 18V9z" /></svg>
            <p className="text-sm text-slate-400">{t('noDocs')}</p>
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
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer"
                      onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                      <td className="py-3 px-2 font-medium text-slate-800">{doc.number || '—'}</td>
                      <td className="py-3 px-2 text-slate-500">{TYPE_LABELS[doc.type] || doc.type}</td>
                      <td className="py-3 px-2 text-slate-700">{doc.client || '—'}</td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-900">{doc.total} {tc('currency')}</td>
                      <td className="py-3 px-2 text-slate-400">{doc.date}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${doc.status === 'DRAFT' ? 'bg-slate-100 text-slate-500' : doc.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : doc.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-600' : doc.status === 'PROGRESS' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          {tc(STATUS_LABELS[doc.status] || 'draft')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc.id); }}
                          className="text-red-400 hover:text-red-600 text-xs font-bold transition" title={tc('delete')}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-2">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="bg-slate-50 rounded-xl p-3 cursor-pointer active:bg-slate-100 transition"
                  onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{doc.number || '—'}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${doc.status === 'DRAFT' ? 'bg-slate-200 text-slate-500' : doc.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : doc.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-600' : doc.status === 'PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
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
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc.id); }}
                    className="text-red-400 hover:text-red-600 text-[10px] font-bold mt-1">{tc('delete')}</button>
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

      <DeleteModal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) onDelete(deleteTarget); }} />
    </main>
  );
}
