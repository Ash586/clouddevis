'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, CreditCard, Users, RefreshCw, FileStack,
  Plus, ArrowRight, PenLine, BarChart3, CreditCardIcon,
  Search, Trash2, ChevronRight, Clock, TrendingUp,
  Hammer, ClipboardList, Receipt, Eye, FileEdit, FilePen,
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
  userPhone?: string | null;
  companyInfo?: CompanyInfo | null;
  stats: DashboardStats;
  docs: DocSummary[];
  loading: boolean;
  onDelete: (id: string) => void;
  mode: 'ARTISAN' | 'ENTREPRISE';
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'draft', ACCEPTED: 'accepted', PROGRESS: 'progress', DELIVERED: 'delivered',
};

const TYPE_LABELS: Record<string, string> = {
  DEVIS: 'Devis', PROFORMA: 'Proforma', BC: 'B. Commande', BR: 'B. Réception',
  FACTURE: 'Facture', INTERVENTION: 'Intervention', ATTACHEMENT: 'Attachement',
};

const QUICK_CREATE_TYPES = [
  { type: 'devis', labelKey: 'devis', icon: FileText, color: 'blue', borderColor: 'border-blue-400/30', bgColor: 'bg-blue-400/5 hover:bg-blue-400/10', textColor: 'text-blue-400' },
  { type: 'facture', labelKey: 'facture', icon: Receipt, color: 'green', borderColor: 'border-[rgba(0,149,77,0.3)]', bgColor: 'bg-[rgba(0,149,77,0.05)] hover:bg-[rgba(0,149,77,0.1)]', textColor: 'text-[var(--green-3)]' },
  { type: 'proforma', labelKey: 'proforma', icon: ClipboardList, color: 'purple', borderColor: 'border-purple-400/30', bgColor: 'bg-purple-400/5 hover:bg-purple-400/10', textColor: 'text-purple-400' },
  { type: 'bon_commande', labelKey: 'bonCommande', icon: FileStack, color: 'amber', borderColor: 'border-amber-400/30', bgColor: 'bg-amber-400/5 hover:bg-amber-400/10', textColor: 'text-amber-400' },
  { type: 'attachement', labelKey: 'attachement', icon: FilePen, color: 'indigo', borderColor: 'border-indigo-400/30', bgColor: 'bg-indigo-400/5 hover:bg-indigo-400/10', textColor: 'text-indigo-400' },
];

const TYPE_FILTERS = ['ALL', 'DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR', 'INTERVENTION', 'ATTACHEMENT'] as const;

const DOC_TYPE_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  DEVIS: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/20' },
  FACTURE: { bg: 'bg-[rgba(0,149,77,0.1)]', text: 'text-[var(--green-3)]', border: 'border-[rgba(0,149,77,0.2)]' },
  PROFORMA: { bg: 'bg-purple-400/10', text: 'text-purple-400', border: 'border-purple-400/20' },
  BC: { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20' },
  BR: { bg: 'bg-teal-400/10', text: 'text-teal-400', border: 'border-teal-400/20' },
  INTERVENTION: { bg: 'bg-rose-400/10', text: 'text-rose-400', border: 'border-rose-400/20' },
  ATTACHEMENT: { bg: 'bg-orange-400/10', text: 'text-orange-400', border: 'border-orange-400/20' },
};

/* ─── Delete Modal ─── */
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
export function UnifiedDashboard({ userName, companyInfo, stats, docs, loading, onDelete, mode }: UnifiedDashboardProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const te = useTranslations('editor');
  const router = useRouter();
  const isEnt = mode === 'ENTREPRISE';
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = !searchQuery.trim() || (() => {
      const q = searchQuery.toLowerCase();
      return doc.number.toLowerCase().includes(q) || doc.client.toLowerCase().includes(q) || (TYPE_LABELS[doc.type] || doc.type).toLowerCase().includes(q);
    })();
    const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filterChipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
      active
        ? 'bg-[rgba(0,149,77,0.1)] text-[var(--green-3)] border-[rgba(0,149,77,0.2)]'
        : 'bg-transparent text-[var(--sand-muted)] border-[rgba(245,237,214,0.06)] hover:border-[rgba(245,237,214,0.12)] hover:text-[var(--sand)]'
    }`;

  const draftDoc = stats.recentDraft;

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && onDelete(deleteTarget)} />

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-sora font-extrabold text-[var(--sand)]">{getTimeGreeting()}, {userName}</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--green-glow)] text-[var(--green-3)] text-[10px] font-bold uppercase tracking-wider border border-[rgba(0,149,77,0.2)]">
            {isEnt ? t('businessMode') : t('artisanMode')}
          </span>
        </div>
        <p className="text-xs text-[var(--sand-muted)]">{t('subtitle')}</p>
      </div>

      {/* ── Trial Banner ── */}
      {stats.trialDaysRemaining > 0 && (
        <Card className="p-4 mb-6 border-[rgba(212,168,67,0.2)] bg-gradient-to-r from-[rgba(212,168,67,0.06)] to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,67,0.1)] flex items-center justify-center shrink-0">
              <Clock size={20} className="text-[var(--gold)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--sand)]">
                {t('trialDaysLeft', { count: stats.trialDaysRemaining })}
              </p>
              <p className="text-xs text-[var(--sand-muted)]">{t('trialUpgradeHint')}</p>
            </div>
            <Button variant="gold" onClick={() => router.push('/dashboard/subscription')}>
              {t('upgrade')} <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ── Quick Create Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {QUICK_CREATE_TYPES.map((qd) => (
          <button key={qd.type} onClick={() => router.push(`/dashboard/editor?type=${qd.type}`)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all active:scale-[0.98] ${qd.bgColor} ${qd.borderColor}`}>
            <qd.icon size={20} className={qd.textColor} />
            <div className="text-start">
              <div className={`text-sm font-bold ${qd.textColor}`}>{t(`docTypes.${qd.labelKey}`)}</div>
              <div className="text-[10px] text-[var(--sand-muted)]">{stats.typeBreakdown?.[({ devis:'DEVIS', facture:'FACTURE', proforma:'PROFORMA', bon_commande:'BC', intervention:'INTERVENTION', attachement:'ATTACHEMENT' } as Record<string,string>)[qd.type] || 'DEVIS'] || 0} {t('created')}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Actions Rapides ── */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-3">{t('quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Continue Draft */}
          {draftDoc && (
            <button onClick={() => router.push(`/dashboard/editor?id=${draftDoc.id}`)}
              className="flex items-center gap-4 p-4 rounded-xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] hover:border-[rgba(245,237,214,0.12)] hover:bg-[var(--navy-3)] transition-all text-start group">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center shrink-0 group-hover:bg-blue-400/20 transition">
                <FileEdit size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--sand)] truncate">{draftDoc.number || t('untitledDoc')}</p>
                <p className="text-[10px] text-[var(--sand-muted)]">{t('continueDraft')}</p>
              </div>
              <ChevronRight size={16} className="text-[var(--sand-muted)] group-hover:text-[var(--sand)] transition shrink-0" />
            </button>
          )}

          {/* New Devis */}
          <button onClick={() => router.push('/dashboard/editor?type=devis')}
            className="flex items-center gap-4 p-4 rounded-xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] hover:border-[rgba(245,237,214,0.12)] hover:bg-[var(--navy-3)] transition-all text-start group">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,149,77,0.1)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(0,149,77,0.2)] transition">
              <PenLine size={18} className="text-[var(--green-3)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--sand)]">{t('newDevis')}</p>
              <p className="text-[10px] text-[var(--sand-muted)]">{t('newDevisDesc')}</p>
            </div>
            <ChevronRight size={16} className="text-[var(--sand-muted)] group-hover:text-[var(--sand)] transition shrink-0" />
          </button>

          {/* Add Client */}
          <button onClick={() => router.push('/dashboard/clients')}
            className="flex items-center gap-4 p-4 rounded-xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] hover:border-[rgba(245,237,214,0.12)] hover:bg-[var(--navy-3)] transition-all text-start group">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center shrink-0 group-hover:bg-purple-400/20 transition">
              <Users size={18} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--sand)]">{t('addClient')}</p>
              <p className="text-[10px] text-[var(--sand-muted)]">{stats.totalClients} {t('registered')}</p>
            </div>
            <ChevronRight size={16} className="text-[var(--sand-muted)] group-hover:text-[var(--sand)] transition shrink-0" />
          </button>

          {/* Reports */}
          <button onClick={() => router.push('/dashboard/reports')}
            className="flex items-center gap-4 p-4 rounded-xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] hover:border-[rgba(245,237,214,0.12)] hover:bg-[var(--navy-3)] transition-all text-start group">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0 group-hover:bg-amber-400/20 transition">
              <BarChart3 size={18} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--sand)]">{t('viewReports')}</p>
              <p className="text-[10px] text-[var(--sand-muted)]">{t('viewReportsDesc')}</p>
            </div>
            <ChevronRight size={16} className="text-[var(--sand-muted)] group-hover:text-[var(--sand)] transition shrink-0" />
          </button>

          {/* Subscription */}
          <button onClick={() => router.push('/dashboard/subscription')}
            className="flex items-center gap-4 p-4 rounded-xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] hover:border-[rgba(245,237,214,0.12)] hover:bg-[var(--navy-3)] transition-all text-start group">
            <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,67,0.1)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(212,168,67,0.2)] transition">
              <CreditCardIcon size={18} className="text-[var(--gold)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--sand)]">{t('manageSubscription')}</p>
              <p className="text-[10px] text-[var(--sand-muted)]">{stats.trialDaysRemaining > 0 ? t('trialActive') : t('viewPlans')}</p>
            </div>
            <ChevronRight size={16} className="text-[var(--sand-muted)] group-hover:text-[var(--sand)] transition shrink-0" />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label={t('statDocuments')} value={stats.totalDocs} sub={`${t('statThisMonth')}: ${stats.monthDocs}`} icon={<FileText size={18} />} />
        <KpiCard label={t('statTotal')} value={`${stats.totalTTC}`} suffix={tc('currency')} sub={t('totalTTC')} icon={<TrendingUp size={18} />} color="green" />
        <KpiCard label={t('statClients')} value={stats.totalClients} sub={t('statRegistered')} icon={<Users size={18} />} color="blue" />
        <KpiCard label={t('statDrafts')} value={stats.draftCount} sub={t('statDraftsSub')} icon={<PenLine size={18} />} color="amber" />
      </div>

      {/* ── Recent Documents ── */}
      <Card className="overflow-hidden border-[rgba(245,237,214,0.06)]">
        <div className="px-6 pt-5 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-sora font-bold text-[var(--sand)]">{t('recentDocs')}</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]" />
                <input type="text" placeholder={tc('search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[var(--navy-2)] border border-[rgba(245,237,214,0.1)] rounded-lg text-xs text-[var(--sand)] focus:outline-none focus:ring-1 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all" />
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {TYPE_FILTERS.map((tf) => (
              <button key={tf} onClick={() => setTypeFilter(tf)} className={filterChipClass(typeFilter === tf)}>
                {tf === 'ALL' ? t('allTypes') : TYPE_LABELS[tf] || tf}
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
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 bg-[var(--navy-3)] text-[var(--sand-muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileStack size={32} />
            </div>
            <p className="text-sm font-bold text-[var(--sand)] mb-1">{docs.length === 0 ? t('emptyTitle') : t('noResults')}</p>
            <p className="text-xs text-[var(--sand-muted)] mb-6">{docs.length === 0 ? t('emptyDesc') : t('noResultsDesc')}</p>
            {docs.length === 0 && (
              <div className="flex items-center justify-center gap-3">
                <Button variant="primary" onClick={() => router.push('/dashboard/editor?type=devis')}>
                  <Plus size={16} className="mr-1" /> {t('createFirstDevis')}
                </Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard/editor?type=facture')}>
                  <Plus size={16} className="mr-1" /> {t('createFirstFacture')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[rgba(245,237,214,0.06)]">
                  <th className="px-6 py-3 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{t('tableNumber')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{t('tableType')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{t('tableClient')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider text-right">{t('tableTotal')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{t('tableStatus')}</th>
                  <th className="px-6 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(245,237,214,0.04)]">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-[rgba(245,237,214,0.02)] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                    <td className="px-6 py-3 text-sm font-mono text-[var(--sand)]">{doc.number || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${DOC_TYPE_BADGE[doc.type]?.bg || ''} ${DOC_TYPE_BADGE[doc.type]?.text || ''} ${DOC_TYPE_BADGE[doc.type]?.border || ''}`}>
                        {TYPE_LABELS[doc.type] || doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-[var(--sand-2)]">{doc.client || '—'}</td>
                    <td className="px-6 py-3 text-sm font-bold text-[var(--sand)] text-right">{doc.total} {tc('currency')}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={doc.status} label={tc(STATUS_LABELS[doc.status] || 'draft')} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/editor?id=${doc.id}`); }}
                          className="p-1.5 text-[var(--sand-muted)] hover:text-[var(--green-3)] hover:bg-[rgba(0,149,77,0.1)] rounded-lg transition-all" title={t('view')}>
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
        )}
      </Card>
    </main>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, sub, icon, suffix, color = 'default' }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; suffix?: string; color?: 'default' | 'green' | 'blue' | 'amber' }) {
  const colorMap = {
    default: { iconBg: 'bg-[var(--navy-3)]', iconText: 'text-[var(--sand-muted)]' },
    green: { iconBg: 'bg-[var(--green-glow)]', iconText: 'text-[var(--green-3)]' },
    blue: { iconBg: 'bg-blue-400/10', iconText: 'text-blue-400' },
    amber: { iconBg: 'bg-amber-400/10', iconText: 'text-amber-400' },
  };
  const c = colorMap[color];

  return (
    <Card className="p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.iconBg} ${c.iconText} mb-3`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-sora font-extrabold text-[var(--sand)]">{value}{suffix ? ` ${suffix}` : ''}</p>
      {sub && <p className="text-[10px] text-[var(--sand-muted)] mt-0.5">{sub}</p>}
    </Card>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status, label }: { status: string; label: string }) {
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
