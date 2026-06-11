'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CreditCard, Users, RefreshCw, FileStack } from 'lucide-react';

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
  const tc = useTranslations('common');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
      <div className="relative bg-[var(--navy-2)] border border-[rgba(245,237,214,0.1)] sm:rounded-2xl rounded-t-2xl shadow-2xl p-6 w-full sm:w-80 sm:max-w-[90%] animate-in sm:mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center sm:hidden pt-1 pb-2"><div className="w-10 h-1 rounded-full bg-[rgba(245,237,214,0.1)]" /></div>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-400/10 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <h3 className="text-base font-bold text-[var(--sand)] mb-2">{tc('deleteModal.title')}</h3>
          <p className="text-xs text-[var(--sand-muted)] mb-6">{tc('deleteModal.description')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-[var(--navy-3)] text-[var(--sand-muted)] text-sm font-bold rounded-xl hover:bg-[var(--navy-4)] transition order-2 sm:order-1">{tc('deleteModal.cancel')}</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition order-1 sm:order-2">{tc('deleteModal.confirm')}</button>
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

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const DOC_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    DEVIS: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/20' },
    FACTURE: { bg: 'bg-[rgba(0,149,77,0.1)]', text: 'text-[var(--green-3)]', border: 'border-[rgba(0,149,77,0.2)]' },
    PROFORMA: { bg: 'bg-purple-400/10', text: 'text-purple-400', border: 'border-purple-400/20' },
    BC: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20' },
    BR: { bg: 'bg-teal-400/10', text: 'text-teal-400', border: 'border-teal-400/20' },
  };

  const filteredDocs = docs.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return doc.number.toLowerCase().includes(q) || doc.client.toLowerCase().includes(q) || (TYPE_LABELS[doc.type] || doc.type).toLowerCase().includes(q);
  });

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && onDelete(deleteTarget)} />
      
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-sora font-extrabold text-[var(--sand)]">{getTimeGreeting()}, {userName}</h1>
          <span className="px-3 py-1 rounded-full bg-[var(--green-glow)] text-[var(--green-3)] text-[10px] font-bold uppercase tracking-wider border border-[rgba(0,149,77,0.2)]">
            {isEnt ? t('businessMode') : t('artisanMode')}
          </span>
        </div>
        <p className="text-sm text-[var(--sand-muted)]">{t('subtitle')}</p>
        
        {isEnt && companyInfo && (
          <div className="mt-6 p-4 rounded-xl bg-[var(--navy-3)] border border-[rgba(245,237,214,0.06)] grid grid-cols-2 md:grid-cols-4 gap-4">
            {tax?.rc && <div><label className="text-[10px] text-[var(--sand-muted)] uppercase font-bold tracking-tight block mb-1">{te('client.companyRc')}</label><span className="text-xs text-[var(--sand)] font-mono">{tax.rc}</span></div>}
            {tax?.nif && <div><label className="text-[10px] text-[var(--sand-muted)] uppercase font-bold tracking-tight block mb-1">{te('client.companyNif')}</label><span className="text-xs text-[var(--sand)] font-mono">{tax.nif}</span></div>}
            {tax?.nis && <div><label className="text-[10px] text-[var(--sand-muted)] uppercase font-bold tracking-tight block mb-1">{te('client.companyNis')}</label><span className="text-xs text-[var(--sand)] font-mono">{tax.nis}</span></div>}
            {tax?.ai && <div><label className="text-[10px] text-[var(--sand-muted)] uppercase font-bold tracking-tight block mb-1">{te('client.companyAi')}</label><span className="text-xs text-[var(--sand)] font-mono">{tax.ai}</span></div>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label={t('statDocuments')} value={stats.totalDocs} sub={`${t('statThisMonth')}: ${stats.monthDocs}`} icon={<FileText size={20} />} />
        <StatCard label={t('statTotal')} value={`${stats.totalTTC} ${tc('currency')}`} sub="Total TTC cumulé" icon={<CreditCard size={20} />} color="green" />
        <StatCard label={t('statClients')} value={stats.totalClients} sub={t('statRegistered')} icon={<Users size={20} />} color="blue" />
        <StatCard label={t('statTrialDays')} value={stats.trialDaysRemaining} sub={t('statRemaining')} icon={<RefreshCw size={20} />} color="gold" />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-sora font-bold text-[var(--sand)]">{t('recentDocs')}</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sand-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder={tc('search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--navy-2)] border border-[rgba(245,237,214,0.1)] rounded-xl text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all" />
          </div>
          <Button variant="primary" onClick={() => router.push(`/dashboard/editor?mode=${isEnt ? 'entreprise' : 'artisan'}`)}>
            <Plus size={18} className="mr-1" /> {t('newQuote')}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-[rgba(245,237,214,0.06)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-[var(--green-glow)] border-t-[var(--green-2)] rounded-full animate-spin" />
            <p className="text-sm text-[var(--sand-muted)]">{tc('loading')}</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[var(--navy-3)] text-[var(--sand-muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileStack size={32} />
            </div>
            <p className="text-[var(--sand-muted)] font-medium">{t('noDocs')}</p>
            <Button variant="ghost" className="mt-4" onClick={() => router.push('/dashboard/editor')}>{t('createFirst')}</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[rgba(245,237,214,0.06)]">
                  <th className="px-6 py-4 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{t('tableNumber')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{t('tableType')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{t('tableClient')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider text-right">{t('tableTotal')}</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{t('tableStatus')}</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(245,237,214,0.04)]">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-[rgba(245,237,214,0.02)] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                    <td className="px-6 py-4 text-sm font-mono text-[var(--sand)]">{doc.number || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${DOC_TYPE_COLORS[doc.type]?.bg} ${DOC_TYPE_COLORS[doc.type]?.text} ${DOC_TYPE_COLORS[doc.type]?.border}`}>
                        {TYPE_LABELS[doc.type] || doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--sand-2)]">{doc.client || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--sand)] text-right">{doc.total} {tc('currency')}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} label={tc(STATUS_LABELS[doc.status] || 'draft')} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc.id); }}
                        className="p-2 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
}

function StatCard({ label, value, sub, icon, color = 'default' }: { label: string, value: string | number, sub?: string, icon: React.ReactNode, color?: 'default' | 'green' | 'blue' | 'gold' }) {
  const colorMap = {
    default: 'text-[var(--sand-muted)] bg-[var(--navy-3)]',
    green: 'text-[var(--green-3)] bg-[var(--green-glow)]',
    blue: 'text-blue-400 bg-blue-400/10',
    gold: 'text-[var(--gold-2)] bg-[var(--gold-bg)]',
  };
  
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-sora font-extrabold text-[var(--sand)]">{value}</p>
        <p className="text-[10px] text-[var(--sand-muted)] mt-1">{sub}</p>
      </div>
    </Card>
  );
}

function StatusBadge({ status, label }: { status: string, label: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-[var(--navy-4)] text-[var(--sand-muted)] border-[rgba(245,237,214,0.1)]',
    DELIVERED: 'bg-[rgba(0,149,77,0.1)] text-[var(--green-3)] border-[rgba(0,149,77,0.2)]',
    ACCEPTED: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    PROGRESS: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[status] || styles.DRAFT}`}>
      {label}
    </span>
  );
}

function Plus({ size, className }: { size: number, className?: string }) {
  return <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
}
