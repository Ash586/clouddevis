'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, FileText, Users, AlertCircle,
  FileEdit, ChevronRight, CheckCircle2,
  Receipt, Truck, ClipboardList, FileStack, ScrollText, Wrench, FilePen,
  Search, Bell,
} from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { useUserStore } from '@/stores/userStore';
import type { UserMode } from '@/mobile/types';

interface DashboardStats {
  totalDocs: number;
  monthDocs: number;
  totalTTC: string | number;
  totalClients: number;
  draftCount: number;
  unpaidTotal: number;
  unpaidCount: number;
  statusBreakdown: Record<string, number>;
  recentDraft: { id: string; number: string; type: string; clientName: string } | null;
  typeBreakdown: Record<string, number>;
}

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
}

const QUICK_CREATE_TYPES = [
  { type: 'devis', labelKey: 'dashboard.docDevis' as const, icon: FileText },
  { type: 'facture', labelKey: 'dashboard.docFacture' as const, icon: Receipt },
  { type: 'bl', labelKey: 'dashboard.docBonLivraison' as const, icon: Truck },
  { type: 'proforma', labelKey: 'dashboard.docProforma' as const, icon: ClipboardList },
  { type: 'bon_commande', labelKey: 'dashboard.docBonCommande' as const, icon: FileStack },
  { type: 'bon_reception', labelKey: 'dashboard.docBonReception' as const, icon: ScrollText },
  { type: 'intervention', labelKey: 'dashboard.docIntervention' as const, icon: Wrench },
  { type: 'attachement', labelKey: 'dashboard.docAttachement' as const, icon: FilePen },
];

const STATUS_COLORS: Record<string, { dot: string; bg: string }> = {
  DRAFT: { dot: 'bg-[#5A6B85]', bg: 'bg-[#EDF2FB]' },
  SENT: { dot: 'bg-amber-400', bg: 'bg-amber-400/10' },
  PAID: { dot: 'bg-[#2563EB]', bg: 'bg-[rgba(37,99,235,0.1)]' },
  ACCEPTED: { dot: 'bg-blue-400', bg: 'bg-blue-400/10' },
  PROGRESS: { dot: 'bg-purple-400', bg: 'bg-purple-400/10' },
  DELIVERED: { dot: 'bg-teal-400', bg: 'bg-teal-400/10' },
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon', SENT: 'Envoyée', PAID: 'Payée',
  ACCEPTED: 'Acceptée', PROGRESS: 'En cours', DELIVERED: 'Livrée',
};

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const { t, dir } = useMobileI18n();
  const { userName, onUnauthorized } = useAuthGuard();
  const mode = useUserStore((s) => s.mode);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocs: 0, monthDocs: 0, totalTTC: 0, totalClients: 0,
    draftCount: 0, unpaidTotal: 0, unpaidCount: 0,
    statusBreakdown: {}, recentDraft: null, typeBreakdown: {},
  });
  const [quickSearch, setQuickSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) return;
      const data = await res.json();
      setStats({
        totalDocs: data.stats?.totalDocs || 0,
        monthDocs: data.stats?.monthDocs || 0,
        totalTTC: data.stats?.totalTTC || 0,
        totalClients: data.stats?.totalClients || 0,
        draftCount: data.stats?.draftCount || 0,
        unpaidTotal: data.stats?.unpaidTotal || 0,
        unpaidCount: data.stats?.unpaidCount || 0,
        statusBreakdown: data.stats?.statusBreakdown || {},
        recentDraft: data.stats?.recentDraft || null,
        typeBreakdown: data.stats?.typeBreakdown || {},
      });
    } catch { /* silent */ } finally { setLoading(false); }
  }, [onUnauthorized]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.greetingMorning');
    if (h < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  })();

  const fmtDA = (n: number) =>
    n >= 1_000_000
      ? (n / 1_000_000).toLocaleString('fr-DZ', { maximumFractionDigits: 1 }) + ' M'
      : Math.round(n).toLocaleString('fr-DZ');

  const unpaid = stats.statusBreakdown?.SENT || 0;
  const drafts = stats.draftCount || 0;
  const allClear = unpaid === 0 && drafts === 0;

  const breakdown = stats.statusBreakdown || {};
  const totalForBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const activeStatuses = Object.entries(breakdown).filter(([, v]) => v > 0);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickSearch.trim()) {
      onNavigate('documents');
    }
  };

  return (
    <div dir={dir} className="min-h-dvh bg-[#F3F6FC] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(15,39,71,0.08)] px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-[rgba(37,99,235,0.1)] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider mb-1">
              {mode === 'entreprise' ? t('dashboard.businessMode') : t('dashboard.artisanMode')}
            </span>
            <h1 className="text-lg font-[var(--font-sora)] font-extrabold text-[#0F2747] leading-tight">
              {greeting}, {userName}
            </h1>
          </div>
          <button type="button" className="w-10 h-10 rounded-full bg-[#EDF2FB] flex items-center justify-center text-[#5A6B85] hover:text-[#0F2747] transition-colors">
            <Bell size={18} />
          </button>
        </div>

        {/* Alert chips */}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {allClear ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB]">
              <CheckCircle2 size={14} />
              {t('dashboard.allClear')}
            </span>
          ) : (
            <>
              {unpaid > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate('documents')}
                  className="inline-flex items-center gap-1.5 ps-2.5 pe-2 py-1.5 rounded-full border border-red-400/25 bg-[rgba(239,68,68,0.06)] text-red-400 text-xs font-semibold transition-all"
                >
                  <AlertCircle size={13} />
                  <span>{t('dashboard.alertUnpaid')}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-400/15">{unpaid}</span>
                </button>
              )}
              {drafts > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate('documents')}
                  className="inline-flex items-center gap-1.5 ps-2.5 pe-2 py-1.5 rounded-full border border-[rgba(15,39,71,0.1)] bg-[#FFFFFF] text-[#5A6B85] text-xs font-semibold transition-all"
                >
                  <FileEdit size={13} />
                  <span>{t('dashboard.alertDrafts')}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EDF2FB]">{drafts}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <main className="px-5 pt-4 max-w-lg mx-auto">
        {/* Quick search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B85]" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={t('dashboard.searchDocs')}
              className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-white pl-10 pr-4 py-3 text-sm text-[#0F2747] placeholder:text-[#5A6B85] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] focus:border-[#2563EB] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Hero: CA Total */}
          <div className="col-span-2 relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] shadow-lg shadow-[rgba(37,99,235,0.2)]">
            <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 text-white mb-3">
                <Wallet size={17} />
              </div>
              <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-0.5">{t('stats.revenue')}</p>
              <p className="font-[var(--font-sora)] font-extrabold text-white text-2xl leading-tight">
                {loading ? '—' : stats.totalTTC}
                <span className="text-sm font-bold text-white/70 ms-1">DA</span>
              </p>
              <p className="text-[11px] text-white/60 mt-0.5">{t('stats.revenueSub')}</p>
            </div>
          </div>

          {/* Unpaid */}
          <div className="rounded-2xl p-4 bg-white border border-[rgba(15,39,71,0.06)] shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-400/10 text-red-400 mb-3">
              <AlertCircle size={17} />
            </div>
            <p className="text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-0.5">{t('stats.unpaid')}</p>
            <p className={`font-[var(--font-sora)] font-extrabold leading-tight text-xl ${stats.unpaidCount > 0 ? 'text-red-400' : 'text-[#0F2747]'}`}>
              {loading ? '—' : fmtDA(stats.unpaidTotal)} DA
            </p>
            <p className="text-[11px] text-[#5A6B85] mt-0.5">{stats.unpaidCount} {t('stats.unpaidSub')}</p>
          </div>

          {/* Documents */}
          <div className="rounded-2xl p-4 bg-white border border-[rgba(15,39,71,0.06)] shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#EDF2FB] text-[#5A6B85] mb-3">
              <FileText size={17} />
            </div>
            <p className="text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-0.5">{t('stats.docsCreated')}</p>
            <p className="font-[var(--font-sora)] font-extrabold text-[#0F2747] leading-tight text-xl">
              {loading ? '—' : stats.totalDocs}
            </p>
            <p className="text-[11px] text-[#5A6B85] mt-0.5">+{stats.monthDocs} {t('stats.thisMonth')}</p>
          </div>

          {/* Clients */}
          <div className="rounded-2xl p-4 bg-white border border-[rgba(15,39,71,0.06)] shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-400/10 text-blue-400 mb-3">
              <Users size={17} />
            </div>
            <p className="text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-0.5">{t('stats.clients')}</p>
            <p className="font-[var(--font-sora)] font-extrabold text-[#0F2747] leading-tight text-xl">
              {loading ? '—' : stats.totalClients}
            </p>
            <p className="text-[11px] text-[#5A6B85] mt-0.5">{t('stats.clientsSub')}</p>
          </div>
        </div>

        {/* Quick Create */}
        <div className="rounded-2xl p-5 bg-white border border-[rgba(15,39,71,0.06)] shadow-sm mb-5">
          <h2 className="text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-4">
            {t('dashboard.quickCreate')}
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_CREATE_TYPES.map((qd) => (
              <button
                key={qd.type}
                type="button"
                onClick={() => onNavigate(`editor:${qd.type}`)}
                className="flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border border-[rgba(15,39,71,0.08)] bg-[#F3F6FC] text-[#5A6B85] hover:text-[#2563EB] hover:border-[rgba(37,99,235,0.25)] hover:bg-[rgba(37,99,235,0.06)] transition-all"
              >
                <qd.icon size={18} />
                <span className="text-[10px] font-bold text-center leading-tight">{t(qd.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Continue draft */}
        {stats.recentDraft && (
          <button
            type="button"
            onClick={() => onNavigate(`editor:draft:${stats.recentDraft!.id}`)}
            className="w-full group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[rgba(37,99,235,0.08)] to-transparent border border-[rgba(37,99,235,0.18)] hover:border-[rgba(37,99,235,0.3)] transition-all text-start mb-5"
          >
            <div className="w-9 h-9 rounded-xl bg-[rgba(37,99,235,0.1)] flex items-center justify-center shrink-0">
              <FileEdit size={16} className="text-[#2563EB]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">{t('dashboard.continueDraft')}</p>
              <p className="text-xs font-semibold text-[#0F2747] truncate mt-0.5">
                {stats.recentDraft!.number || t('dashboard.untitledDoc')}
                {stats.recentDraft!.clientName ? ` · ${stats.recentDraft!.clientName}` : ''}
              </p>
            </div>
            <ChevronRight size={15} className="text-[#2563EB] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Status Breakdown */}
        {totalForBreakdown > 0 && activeStatuses.length > 0 && (
          <div className="rounded-2xl p-5 bg-white border border-[rgba(15,39,71,0.06)] shadow-sm mb-5">
            <h2 className="text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-3">
              {t('dashboard.statusBreakdown')}
            </h2>
            {/* Segmented bar */}
            <div className="flex h-2 rounded-full overflow-hidden mb-3 gap-px">
              {activeStatuses.map(([key]) => {
                const sc = STATUS_COLORS[key] || { dot: 'bg-[#5A6B85]' };
                const pct = Math.round(((breakdown[key] || 0) / totalForBreakdown) * 100);
                return (
                  <div key={key} className={`${sc.dot} transition-all`} style={{ width: `${pct}%` }} />
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-1.5">
              {activeStatuses.map(([key, count]) => {
                const sc = STATUS_COLORS[key] || { dot: 'bg-[#5A6B85]' };
                const pct = Math.round((count / totalForBreakdown) * 100);
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      <span className="text-[11px] text-[#5A6B85]">{STATUS_LABELS[key] || key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#0F2747]">{count}</span>
                      <span className="text-[10px] text-[#5A6B85] w-7 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
