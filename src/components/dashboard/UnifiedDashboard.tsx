'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FileText, Users, FileStack,
  Plus, ArrowRight, PenLine, BarChart3, CreditCardIcon,
  Search, Trash2, ChevronRight, Clock, Wallet,
  ClipboardList, Receipt, Eye, FileEdit, FilePen,
  ChevronLeft, ScrollText, Wrench, X, ArrowUpDown,
} from 'lucide-react';

interface CompanyInfo {
  name?: string; address?: string; capital?: string;
  taxIds?: { nif?: string; nis?: string; rc?: string; ai?: string };
}

interface DocSummary {
  id: string; number: string; type: string; client: string;
  total: string; date: string; status: string;
}

interface RecentDraft {
  id: string; number: string; type: string; clientName: string; updatedAt: string;
}

interface DashboardStats {
  totalDocs: number; monthDocs: number; totalTTC: string;
  totalClients: number; trialDaysRemaining: number;
  draftCount: number; statusBreakdown: Record<string, number>;
  recentDraft: RecentDraft | null;
  typeBreakdown: Record<string, number>;
}

interface UnifiedDashboardProps {
  userName: string;
  companyInfo?: CompanyInfo | null;
  stats: DashboardStats;
  docs: DocSummary[];
  loading: boolean;
  onDelete: (id: string) => void;
  mode: 'ARTISAN' | 'ENTREPRISE';
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: string;
  onTypeFilterChange: (t: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (column: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'draft', ACCEPTED: 'accepted', PROGRESS: 'progress', DELIVERED: 'delivered',
};

const DOC_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  devis: { label: 'Devis', bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/20' },
  facture: { label: 'Facture', bg: 'bg-[rgba(37,99,235,0.1)]', text: 'text-[var(--green-3)]', border: 'border-[rgba(37,99,235,0.2)]' },
  proforma: { label: 'Proforma', bg: 'bg-purple-400/10', text: 'text-purple-400', border: 'border-purple-400/20' },
  bc: { label: 'B. Commande', bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20' },
  br: { label: 'B. Réception', bg: 'bg-teal-400/10', text: 'text-teal-400', border: 'border-teal-400/20' },
  intervention: { label: 'Intervention', bg: 'bg-rose-400/10', text: 'text-rose-400', border: 'border-rose-400/20' },
  attachement: { label: 'Attachement', bg: 'bg-orange-400/10', text: 'text-orange-400', border: 'border-orange-400/20' },
};

const QUICK_CREATE_TYPES = [
  { type: 'devis', labelKey: 'devis', icon: FileText, iconBg: 'bg-blue-400/10', textColor: 'text-blue-400' },
  { type: 'facture', labelKey: 'facture', icon: Receipt, iconBg: 'bg-[rgba(37,99,235,0.12)]', textColor: 'text-[var(--green-3)]' },
  { type: 'proforma', labelKey: 'proforma', icon: ClipboardList, iconBg: 'bg-purple-400/10', textColor: 'text-purple-400' },
  { type: 'bon_commande', labelKey: 'bonCommande', icon: FileStack, iconBg: 'bg-amber-400/10', textColor: 'text-amber-400' },
  { type: 'bon_reception', labelKey: 'bonReception', icon: ScrollText, iconBg: 'bg-teal-400/10', textColor: 'text-teal-400' },
  { type: 'intervention', labelKey: 'intervention', icon: Wrench, iconBg: 'bg-rose-400/10', textColor: 'text-rose-400' },
  { type: 'attachement', labelKey: 'attachement', icon: FilePen, iconBg: 'bg-indigo-400/10', textColor: 'text-indigo-400' },
];

const TYPE_FILTERS = ['ALL', 'DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR', 'INTERVENTION', 'ATTACHEMENT'] as const;

/* ─── Delete Modal ─── */
function DeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const tc = useTranslations('common');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
      <div className="relative bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] sm:rounded-2xl rounded-t-2xl shadow-2xl p-6 w-full sm:w-80 sm:max-w-[90%] animate-in sm:mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center sm:hidden pt-1 pb-2"><div className="w-10 h-1 rounded-full bg-[rgba(15,39,71,0.1)]" /></div>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-400/10 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} />
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

/* ─── Main Dashboard ─── */
export function UnifiedDashboard({ userName, stats, docs, loading, onDelete, mode, page, totalPages, onPageChange, searchQuery, onSearchChange, typeFilter, onTypeFilterChange, sortBy, sortOrder, onSortChange }: UnifiedDashboardProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const router = useRouter();
  const isEnt = mode === 'ENTREPRISE';
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  })();

  const filterChipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
      active
        ? 'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)] border-[rgba(37,99,235,0.2)]'
        : 'bg-transparent text-[var(--sand-muted)] border-[rgba(15,39,71,0.06)] hover:border-[rgba(15,39,71,0.12)] hover:text-[var(--sand)]'
    }`;

  const draftDoc = stats.recentDraft;

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-6 pt-6 pb-24 md:pb-6">
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && onDelete(deleteTarget)} />

      {/* ── Hero band ── */}
      <div className="relative overflow-hidden rounded-3xl mb-6 p-6 sm:p-8 bg-gradient-to-br from-[var(--green-2)] via-[var(--green)] to-[#1E3A8A] shadow-xl shadow-[rgba(37,99,235,0.22)]">
        <div className="absolute -top-20 -right-12 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-[var(--teal)]/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm mb-3">
              {isEnt ? t('businessMode') : t('artisanMode')}
            </span>
            <h1 className="text-2xl sm:text-[30px] font-sora font-extrabold text-white leading-tight">{greeting}, {userName}</h1>
            <p className="text-sm text-white/75 mt-1.5">{t('subtitle')}</p>
          </div>
          <button onClick={() => router.push('/dashboard/editor?type=devis')}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[var(--green-2)] text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]">
            <Plus size={18} /> {t('newQuote')}
          </button>
        </div>
      </div>

      {/* ── Trial Banner ── */}
      {stats.trialDaysRemaining > 0 && (() => {
        const urgent = stats.trialDaysRemaining <= 2;
        return (
          <Card className={`p-4 mb-6 border ${urgent ? 'border-red-400/30 bg-gradient-to-r from-[rgba(239,68,68,0.08)] to-transparent' : 'border-[rgba(212,168,67,0.2)] bg-gradient-to-r from-[rgba(212,168,67,0.06)] to-transparent'}`}>
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-red-400/10 animate-pulse' : 'bg-[rgba(212,168,67,0.1)]'}`}>
                <Clock size={20} className={urgent ? 'text-red-400' : 'text-[var(--gold)]'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${urgent ? 'text-red-400' : 'text-[var(--sand)]'}`}>
                  {t('trialDaysLeft', { count: stats.trialDaysRemaining })}
                </p>
                <p className="text-xs text-[var(--sand-muted)]">{urgent ? (t('trialUrgent') || 'Votre accès expire bientôt ! Passez à un forfait payant.') : t('trialUpgradeHint')}</p>
                <Button variant={urgent ? 'danger' : 'gold'} onClick={() => router.push('/dashboard/subscription')} className="mt-3 sm:hidden w-full justify-center">
                  {t('upgrade')} <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
              <Button variant={urgent ? 'danger' : 'gold'} onClick={() => router.push('/dashboard/subscription')} className="hidden sm:inline-flex shrink-0">
                {t('upgrade')} <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </Card>
        );
      })()}

      {/* ── KPI Cards (F-pattern: revenue hero top-left) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="sm:col-span-1">
          <KpiCard hero label={t('statTotal')} value={`${stats.totalTTC}`} suffix={tc('currency')} sub={t('totalTTC')} icon={<Wallet size={19} />} color="green" />
        </div>
        <div>
          <KpiCard label={t('statDocuments')} value={stats.totalDocs} sub={`+${stats.monthDocs} ${t('statThisMonth')}`} icon={<FileText size={18} />} />
        </div>
        <div>
          <KpiCard label={t('statClients')} value={stats.totalClients} sub={t('statRegistered')} icon={<Users size={18} />} color="blue" />
        </div>
        <div>
          <KpiCard label={t('statDrafts')} value={stats.draftCount} sub={t('statDraftsSub')} icon={<PenLine size={18} />} color="amber" />
        </div>
      </div>

      {/* ── Continue Draft (contextual) ── */}
      {draftDoc && (
        <div className="flex items-start gap-3 sm:gap-4 p-3.5 mb-6 rounded-2xl bg-gradient-to-r from-[rgba(37,99,235,0.08)] to-transparent border border-[rgba(37,99,235,0.18)]">
          <button onClick={() => router.push(`/dashboard/editor?id=${draftDoc.id}`)}
            className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 text-start group">
            <div className="w-10 h-10 rounded-xl bg-[var(--green-glow)] flex items-center justify-center shrink-0">
              <FileEdit size={18} className="text-[var(--green-3)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[var(--green-3)] uppercase tracking-wider">{t('continueDraft')}</p>
              <p className="text-sm font-bold text-[var(--sand)] truncate">{draftDoc.number || t('untitledDoc')}{draftDoc.clientName ? ` · ${draftDoc.clientName}` : ''}</p>
            </div>
            <ChevronRight size={18} className="text-[var(--green-3)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); router.push('/dashboard/documents?status=DRAFT'); }}
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[var(--navy-3)] text-[var(--sand-muted)] text-[10px] font-bold hover:bg-[var(--navy-4)] hover:text-[var(--sand)] transition-all">
            {tc('viewAll')}
          </button>
        </div>
      )}

      {/* ── Quick Create ── */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-3">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_CREATE_TYPES.map((qd) => {
            const count = stats.typeBreakdown?.[({ devis:'DEVIS', facture:'FACTURE', proforma:'PROFORMA', bon_commande:'BC', bon_reception:'BR', intervention:'INTERVENTION', attachement:'ATTACHEMENT' } as Record<string,string>)[qd.type] || 'DEVIS'] || 0;
            return (
              <button key={qd.type} onClick={() => router.push(`/dashboard/editor?type=${qd.type}`)}
                className="group flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)] hover:border-[rgba(15,39,71,0.14)] hover:bg-[var(--navy-3)] transition-all active:scale-[0.98] text-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${qd.iconBg} ${qd.textColor}`}>
                  <qd.icon size={19} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--sand)] truncate">{t(`docTypes.${qd.labelKey}`)}</div>
                  <div className="text-[11px] text-[var(--sand-muted)]">{count} {t('created')}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Secondary quick links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <SecondaryLink icon={<Users size={16} />} label={t('addClient')} sub={`${stats.totalClients} ${t('statRegistered')}`} onClick={() => router.push('/dashboard/clients')} />
        <SecondaryLink icon={<BarChart3 size={16} />} label={t('viewReports')} sub={t('viewReportsDesc')} onClick={() => router.push('/dashboard/reports')} />
        <SecondaryLink icon={<CreditCardIcon size={16} />} label={t('manageSubscription')} sub={stats.trialDaysRemaining > 0 ? t('trialActive') : t('viewPlans')} onClick={() => router.push('/dashboard/subscription')} />
      </div>

      {/* ── Recent Documents ── */}
      <Card className="overflow-hidden border-[rgba(15,39,71,0.06)]">
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-sora font-bold text-[var(--sand)]">{t('recentDocs')}</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]" />
                <input type="text" placeholder={tc('search')} value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-lg text-xs text-[var(--sand)] focus:outline-none focus:ring-1 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all" />
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {TYPE_FILTERS.map((tf) => (
              <button key={tf} onClick={() => onTypeFilterChange(tf)} className={filterChipClass(typeFilter === tf)}>
                {tf === 'ALL' ? t('allTypes') : DOC_TYPE_CONFIG[tf.toLowerCase()]?.label || tf}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="px-6 pb-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-[var(--navy-3)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 bg-[var(--navy-3)] text-[var(--sand)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileStack size={32} />
            </div>
            <p className="text-sm font-bold text-[var(--sand)] mb-1">{stats.totalDocs === 0 ? t('emptyTitle') : t('noResults')}</p>
            <p className="text-xs text-[var(--sand-muted)] mb-6">{stats.totalDocs === 0 ? t('emptyDesc') : t('noResultsDesc')}</p>
            {stats.totalDocs === 0 ? (
              <div className="flex items-center justify-center gap-3">
                <Button variant="primary" onClick={() => router.push('/dashboard/editor?type=devis')}>
                  <Plus size={16} className="mr-1" /> {t('createFirstDevis')}
                </Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard/editor?type=facture')}>
                  <Plus size={16} className="mr-1" /> {t('createFirstFacture')}
                </Button>
              </div>
            ) : (
              <button onClick={() => { onSearchChange(''); onTypeFilterChange('ALL'); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--navy-3)] text-[var(--sand-muted)] text-[11px] font-bold hover:bg-[var(--navy-4)] hover:text-[var(--sand)] transition-all">
                <X size={13} /> {t('clearFilters') || 'Réinitialiser les filtres'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card list — full info + always-visible delete (touch has no hover) */}
            <div className="sm:hidden">
              {docs.map((doc) => {
                const cfg = DOC_TYPE_CONFIG[doc.type.toLowerCase()];
                return (
                  <div key={doc.id} onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}
                    className="flex items-center gap-3 px-5 py-3 border-t border-[rgba(15,39,71,0.04)] active:bg-[rgba(15,39,71,0.03)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg?.bg || ''} ${cfg?.text || ''} ${cfg?.border || ''}`}>
                          {cfg?.label || doc.type}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--sand-muted)] truncate">{doc.number || '—'}</span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--sand)] truncate">{doc.client || '—'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-[var(--sand)] whitespace-nowrap">{doc.total} {tc('currency')}</span>
                      <StatusBadge status={doc.status} label={tc(STATUS_LABELS[doc.status] || 'draft')} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc.id); }}
                      className="shrink-0 -mr-1 p-2 text-red-400/70 active:text-red-400 active:bg-red-400/10 rounded-lg transition-colors" aria-label={tc('delete')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full">
                <thead>
              <tr className="text-left border-b border-[rgba(15,39,71,0.06)]">
                <SortHeader column="number" label={t('tableNumber')} current={sortBy} dir={sortOrder} onSort={onSortChange} />
                <SortHeader column="client" label={t('tableClient')} current={sortBy} dir={sortOrder} onSort={onSortChange} />
                <SortHeader column="type" label={t('tableType')} current={sortBy} dir={sortOrder} onSort={onSortChange} />
                <SortHeader column="total" label={t('tableTotal')} current={sortBy} dir={sortOrder} onSort={onSortChange} align="right" />
                <SortHeader column="status" label={t('tableStatus')} current={sortBy} dir={sortOrder} onSort={onSortChange} />
                <th className="px-6 py-3 w-20"></th>
              </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(15,39,71,0.04)]">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="group hover:bg-[rgba(15,39,71,0.02)] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                      <td className="px-6 py-3 text-sm font-mono text-[var(--sand)]">{doc.number || '—'}</td>
                      <td className="px-6 py-3 text-sm text-[var(--sand-2)] max-w-xs truncate">{doc.client || '—'}</td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${DOC_TYPE_CONFIG[doc.type.toLowerCase()]?.bg || ''} ${DOC_TYPE_CONFIG[doc.type.toLowerCase()]?.text || ''} ${DOC_TYPE_CONFIG[doc.type.toLowerCase()]?.border || ''}`}>
                          {DOC_TYPE_CONFIG[doc.type.toLowerCase()]?.label || doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-[var(--sand)] text-right">{doc.total} {tc('currency')}</td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <StatusBadge status={doc.status} label={tc(STATUS_LABELS[doc.status] || 'draft')} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/editor?id=${doc.id}`); }}
                            className="p-1.5 text-[var(--sand-muted)] hover:text-[var(--green-3)] hover:bg-[rgba(37,99,235,0.1)] rounded-lg transition-all" title={t('view')}>
                            <Eye size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc.id); }}
                            className="p-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title={tc('delete')}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(15,39,71,0.06)]">
                <span className="text-[11px] text-[var(--sand-muted)]">{page} / {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}
                    className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border',
                      page <= 1 ? 'opacity-50 cursor-not-allowed border-[rgba(15,39,71,0.04)] text-[var(--sand-muted)]/50 grayscale' : 'border-[rgba(15,39,71,0.06)] hover:border-[rgba(15,39,71,0.14)] text-[var(--sand-muted)] hover:text-[var(--sand)]')}>
                    <ChevronLeft size={14} /> {tc('back')}
                  </button>
                  <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                    className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border',
                      page >= totalPages ? 'opacity-50 cursor-not-allowed border-[rgba(37,99,235,0.1)] bg-[rgba(37,99,235,0.05)] text-[var(--green-3)]/50 grayscale' : 'border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] text-[var(--green-3)] hover:bg-[rgba(37,99,235,0.15)]')}>
                    {t('next')} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, sub, icon, suffix, color = 'default', hero = false }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; suffix?: string; color?: 'default' | 'green' | 'blue' | 'amber'; hero?: boolean }) {
  const colorMap = {
    default: { iconBg: 'bg-[var(--navy-3)]', iconText: 'text-[var(--sand-muted)]' },
    green: { iconBg: 'bg-[var(--green-glow)]', iconText: 'text-[var(--green-3)]' },
    blue: { iconBg: 'bg-blue-400/10', iconText: 'text-blue-400' },
    amber: { iconBg: 'bg-amber-400/10', iconText: 'text-amber-400' },
  };
  const c = colorMap[color];

  if (hero) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-5 h-full bg-gradient-to-br from-[var(--green-2)] to-[var(--green)] shadow-lg shadow-[rgba(37,99,235,0.2)]">
        <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15 text-white mb-3">{icon}</div>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">{label}</p>
          <p className="font-sora font-extrabold text-white leading-tight text-2xl">
            {value}{suffix ? <span className="text-sm font-bold text-white/70 ml-1">{suffix}</span> : ''}
          </p>
          {sub && <p className="text-[11px] text-white/60 mt-1">{sub}</p>}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 sm:p-5 h-full hover:-translate-y-0.5 hover:shadow-lg transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg} ${c.iconText} mb-3`}>
        {icon}
      </div>
      <p className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className="font-sora font-extrabold text-[var(--sand)] leading-tight text-xl">
        {value}{suffix ? <span className="text-sm font-bold text-[var(--sand-muted)] ml-1">{suffix}</span> : ''}
      </p>
      {sub && <p className="text-[11px] text-[var(--sand-muted)] mt-1">{sub}</p>}
    </Card>
  );
}

/* ─── Secondary quick link ─── */
function SecondaryLink({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group flex items-center gap-2.5 p-3 rounded-xl bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)] hover:border-[rgba(15,39,71,0.14)] hover:bg-[var(--navy-3)] transition-all text-start min-w-0">
      <div className="w-8 h-8 rounded-lg bg-[var(--navy-3)] text-[var(--sand-muted)] group-hover:text-[var(--sand)] flex items-center justify-center shrink-0 transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-[var(--sand)] truncate">{label}</div>
        {sub && <div className="text-[10px] text-[var(--sand-muted)] truncate">{sub}</div>}
      </div>
      <ChevronRight size={14} className="text-[var(--sand-muted)] shrink-0 hidden sm:block group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-[var(--navy-4)] text-[var(--sand-muted)] border-[rgba(15,39,71,0.1)]',
    DELIVERED: 'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)] border-[rgba(37,99,235,0.2)]',
    ACCEPTED: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    PROGRESS: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[status] || styles.DRAFT}`}>
      {label}
    </span>
  );
}

/* ─── Sortable Header ─── */
function SortHeader({ column, label, current, dir, onSort, align }: { column: string; label: string; current: string; dir: string; onSort: (c: string) => void; align?: 'left' | 'right' }) {
  const active = current === column;
  return (
    <th className={`px-6 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
          active ? 'text-[var(--green-3)]' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]'
        }`}>
        {label}
        <ArrowUpDown size={11} className={active ? 'opacity-100' : 'opacity-30'} />
      </button>
    </th>
  );
}
