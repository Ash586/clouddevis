'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

type DocStatus = 'DRAFT' | 'ACCEPTED' | 'PROGRESS' | 'DELIVERED' | 'SENT' | 'PAID';

interface Doc {
  id: string;
  number: string;
  type: string;
  client: string;
  total: string;
  date: string;
  status: string;
  netAPayer?: number;
  amountPaid?: number;
  remaining?: number;
  isPaid?: boolean;
  overdue?: boolean;
  clientEmail?: string | null;
}

const EMAILABLE_TYPES = ['FACTURE', 'DEVIS', 'PROFORMA'];

interface TypeInfo {
  count: number;
  total: number;
}

const TYPE_LABELS: Record<string, string> = {
  devis: 'Devis',
  facture: 'Facture',
  proforma: 'Proforma',
  bc: 'B. Commande',
  br: 'B. Réception',
  bl: 'B. Livraison',
  intervention: 'Intervention',
  attachement: 'Attachement',
};

const TYPE_COLORS: Record<string, string> = {
  DEVIS: 'bg-blue-400/10 text-blue-400',
  FACTURE: 'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)]',
  PROFORMA: 'bg-purple-400/10 text-purple-400',
  BC: 'bg-amber-400/10 text-amber-400',
  BR: 'bg-teal-400/10 text-teal-400',
  BL: 'bg-cyan-400/10 text-cyan-400',
  INTERVENTION: 'bg-rose-400/10 text-rose-400',
  ATTACHEMENT: 'bg-indigo-400/10 text-indigo-400',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-[var(--navy-4)] text-[var(--sand-muted)]',
  ACCEPTED: 'bg-blue-400/10 text-blue-400',
  PROGRESS: 'bg-amber-400/10 text-amber-400',
  DELIVERED: 'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)]',
  SENT: 'bg-sky-400/10 text-sky-400',
  PAID: 'bg-emerald-400/10 text-emerald-400',
};

const STATUS_OPTIONS: DocStatus[] = ['DRAFT', 'ACCEPTED', 'PROGRESS', 'DELIVERED', 'SENT', 'PAID'];

const CURRENCY = 'DA';
const fmt = (n: number) => n.toLocaleString('fr-DZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const STALE_MS = 2 * 60 * 1000;

export function DocumentsPanel() {
  const t = useTranslations('documents');
  const tc = useTranslations('common');
  const router = useRouter();
  const sp = useSearchParams();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(sp?.get('status') || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [typeBreakdown, setTypeBreakdown] = useState<Record<string, TypeInfo>>({});
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doc | null>(null);
  const [payTarget, setPayTarget] = useState<Doc | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paySaving, setPaySaving] = useState(false);
  const [sendTarget, setSendTarget] = useState<Doc | null>(null);
  const [sendTo, setSendTo] = useState('');
  const [sendMsg, setSendMsg] = useState('');
  const [sendSaving, setSendSaving] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendOk, setSendOk] = useState(false);

  const totalRevenue = Object.values(typeBreakdown).reduce((sum, ti) => sum + ti.total, 0);
  const lastFetchRef = useRef(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/documents?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      setDocs(data.documents);
      setTotalPages(data.pagination.totalPages);
      setTotalDocs(data.pagination.total);
      setStatusBreakdown(data.statusBreakdown);
      setTypeBreakdown(data.typeBreakdown);
      lastFetchRef.current = Date.now();
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, dateFrom, dateTo, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetchRef.current > STALE_MS) fetchData();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchData]);

  const handleStatusChange = async (id: string, status: DocStatus) => {
    await fetch('/api/documents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setStatusDropdownOpen(null);
    fetchData();
  };

  const patchPayment = async (id: string, payload: Record<string, unknown>) => {
    setPaySaving(true);
    try {
      await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      });
      setPayTarget(null);
      setPayAmount('');
      await fetchData();
    } finally {
      setPaySaving(false);
    }
  };

  const openPayModal = (doc: Doc) => {
    setPayTarget(doc);
    setPayAmount(String(doc.remaining ?? doc.netAPayer ?? ''));
  };

  const openSendModal = (doc: Doc) => {
    setSendTarget(doc);
    setSendTo(doc.clientEmail ?? '');
    setSendMsg('');
    setSendError(null);
    setSendOk(false);
  };

  const handleSend = async () => {
    if (!sendTarget) return;
    setSendSaving(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/documents/${sendTarget.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: sendTo.trim(), message: sendMsg.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Échec');
      setSendOk(true);
      await fetchData();
      setTimeout(() => setSendTarget(null), 1200);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Échec');
    } finally {
      setSendSaving(false);
    }
  };

  const handleDuplicate = async (sourceId: string) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/editor?id=${data.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchData();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { setPage(1); fetchData(); }
  };

  return (
    <>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-xl sm:text-2xl font-black text-[var(--sand)]">{t('title')}</h1>

        {/* Filters */}
        <Card className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{tc('search')}</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sand-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={t('searchPlaceholder')}
                  className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{tc('type')}</label>
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
              >
                <option value="">{t('allTypes')}</option>
                <option value="DEVIS">Devis</option>
                <option value="FACTURE">Facture</option>
                <option value="PROFORMA">Proforma</option>
                <option value="BC">BC</option>
                <option value="BR">BR</option>
                <option value="INTERVENTION">Intervention</option>
                <option value="ATTACHEMENT">Attachement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{tc('status')}</label>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
              >
                <option value="">{t('allStatuses')}</option>
                <option value="DRAFT">{tc('draft')}</option>
                <option value="ACCEPTED">{tc('accepted')}</option>
                <option value="PROGRESS">{tc('progress')}</option>
                <option value="DELIVERED">{tc('delivered')}</option>
                <option value="SENT">{tc('sent')}</option>
                <option value="PAID">{tc('paid')}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('dateFrom')}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('dateTo')}</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
              />
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="text-center animate-pulse">
                <div className="h-7 w-16 bg-[var(--navy-3)] rounded mx-auto mb-1" />
                <div className="h-3 w-20 bg-[var(--navy-4)] rounded mx-auto" />
              </Card>
            ))
          ) : (<>
            <Card className="text-center">
              <p className="text-2xl font-black text-[var(--sand)]">{totalDocs}</p>
              <p className="text-xs text-[var(--sand-muted)] font-semibold">{t('totalDocs')}</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-black text-[var(--sand)]">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-[var(--sand-muted)]">{tc('currency')}</span></p>
              <p className="text-xs text-[var(--sand-muted)] font-semibold">{t('totalRevenue')}</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-black text-[var(--sand)]">{statusBreakdown['DRAFT'] || 0}</p>
              <p className="text-xs text-[var(--sand-muted)] font-semibold">{tc('draft')}</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-black text-[var(--sand)]">{statusBreakdown['DELIVERED'] || 0}</p>
              <p className="text-xs text-[var(--sand-muted)] font-semibold">{tc('delivered')}</p>
            </Card>
          </>)}
        </div>

        {/* Desktop Table */}
        <Card className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(15,39,71,0.06)]">
                <th className="text-start py-3 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('number')}</th>
                <th className="text-start py-3 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('type')}</th>
                <th className="text-start py-3 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('client')}</th>
                <th className="text-end py-3 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('total')}</th>
                <th className="text-start py-3 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('date')}</th>
                <th className="text-start py-3 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{tc('status')}</th>
                <th className="text-end py-3 px-3 text-xs font-semibold text-[var(--sand-muted)] uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[rgba(15,39,71,0.04)] animate-pulse">
                    <td className="py-3 px-3"><div className="h-4 w-20 bg-[var(--navy-3)] rounded" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-16 bg-[var(--navy-3)] rounded-full" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-28 bg-[var(--navy-3)] rounded" /></td>
                    <td className="py-3 px-3 text-end"><div className="h-4 w-16 bg-[var(--navy-3)] rounded ms-auto" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-20 bg-[var(--navy-3)] rounded" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-14 bg-[var(--navy-3)] rounded-full" /></td>
                    <td className="py-3 px-3 text-end"><div className="h-4 w-16 bg-[var(--navy-3)] rounded ms-auto" /></td>
                  </tr>
                ))
              ) : docs.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-[var(--sand-muted)]">{t('noDocs')}</td></tr>
              ) : docs.map(doc => (
                <tr key={doc.id} className="border-b border-[rgba(15,39,71,0.04)] hover:bg-[rgba(15,39,71,0.02)] transition">
                  <td className="py-3 px-3 font-semibold text-[var(--sand)]">{doc.number}</td>
                  <td className="py-3 px-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', TYPE_COLORS[doc.type] || 'bg-[var(--navy-4)] text-[var(--sand-2)]')}>
                      {TYPE_LABELS[doc.type.toLowerCase()] || doc.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[var(--sand-2)]">{doc.client || '—'}</td>
                  <td className="py-3 px-3 text-end font-bold text-[var(--sand)]">
                    {doc.total} <span className="text-xs font-normal text-[var(--sand-muted)]">{tc('currency')}</span>
                    {doc.type === 'FACTURE' && !doc.isPaid && (doc.remaining ?? 0) > 0 && (
                      <div className="text-[10px] font-semibold text-amber-500 mt-0.5">{t('remaining')}: {fmt(doc.remaining ?? 0)} {CURRENCY}</div>
                    )}
                    {doc.type === 'FACTURE' && doc.isPaid && (
                      <div className="text-[10px] font-semibold text-emerald-500 mt-0.5">✓ {tc('paid')}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[var(--sand-muted)]">
                    {doc.date}
                    {doc.overdue && <div className="text-[10px] font-bold text-red-500 mt-0.5">⚠ {t('overdue')}</div>}
                  </td>
                  <td className="py-3 px-3 relative">
                    <button
                      type="button"
                      onClick={() => setStatusDropdownOpen(statusDropdownOpen === doc.id ? null : doc.id)}
                      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer hover:opacity-80 transition', STATUS_COLORS[doc.status] || 'bg-[var(--navy-4)] text-[var(--sand-2)]')}
                    >
                      {tc(doc.status?.toLowerCase()) || doc.status}
                    </button>
                    {statusDropdownOpen === doc.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(null)} />
                        <div className="absolute left-0 top-full mt-1 z-20 bg-[var(--navy-3)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                          {STATUS_OPTIONS.map(s => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => handleStatusChange(doc.id, s)}
                              className={cn('w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[var(--navy-3)] transition', s === doc.status && 'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)]')}
                            >
                              {tc(s.toLowerCase())}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="py-3 px-3 text-end">
                    <div className="flex items-center justify-end gap-1">
                      {EMAILABLE_TYPES.includes(doc.type) && (
                        <button type="button" onClick={() => openSendModal(doc)} className="p-1.5 text-[var(--sand-muted)] hover:text-[var(--green-3)] hover:bg-[rgba(37,99,235,0.1)] rounded-lg transition" title={t('sendEmail')}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </button>
                      )}
                      {EMAILABLE_TYPES.includes(doc.type) && (
                        <button type="button" onClick={() => {
                          const msg = encodeURIComponent(`Bonjour,\nVeuillez trouver ci-joint le document ${doc.number} d'un montant de ${doc.total} DA.\nCordialement.`);
                          window.open(`https://wa.me/?text=${msg}`, '_blank');
                        }} className="p-1.5 text-[var(--sand-muted)] hover:text-emerald-500 hover:bg-emerald-400/10 rounded-lg transition" title="WhatsApp">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
                      )}
                      {doc.type === 'FACTURE' && (
                        <button type="button" onClick={() => openPayModal(doc)} className={cn('p-1.5 rounded-lg transition', doc.isPaid ? 'text-emerald-500 hover:bg-emerald-400/10' : 'text-[var(--sand-muted)] hover:text-emerald-500 hover:bg-emerald-400/10')} title={t('recordPayment')}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                      )}
                      <button type="button" onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)} className="p-1.5 text-[var(--sand-muted)] hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition" title={t('edit')}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button type="button" onClick={() => handleDuplicate(doc.id)} className="p-1.5 text-[var(--sand-muted)] hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition" title={t('duplicate')}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(doc)} className="p-1.5 text-[var(--sand-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition" title={tc('delete')}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-3 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5"><div className="h-4 w-24 bg-[var(--navy-3)] rounded" /><div className="h-3 w-20 bg-[var(--navy-4)] rounded" /></div>
                  <div className="h-5 w-16 bg-[var(--navy-3)] rounded-full" />
                </div>
                <div className="flex items-center justify-between"><div className="h-4 w-16 bg-[var(--navy-3)] rounded-full" /><div className="h-4 w-20 bg-[var(--navy-3)] rounded" /></div>
                <div className="flex items-center justify-between"><div className="h-3 w-20 bg-[var(--navy-4)] rounded" /><div className="flex gap-2"><div className="h-10 w-10 bg-[var(--navy-3)] rounded-lg" /><div className="h-10 w-10 bg-[var(--navy-3)] rounded-lg" /><div className="h-10 w-10 bg-[var(--navy-3)] rounded-lg" /></div></div>
              </Card>
            ))
          ) : docs.length === 0 ? (
            <Card className="py-8 text-center text-[var(--sand-muted)]">{t('noDocs')}</Card>
          ) : docs.map(doc => (
            <Card key={doc.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-[var(--sand)] text-[15px]">{doc.number}</p>
                  <p className="text-xs text-[var(--sand-muted)] mt-0.5">{doc.client || '—'}</p>
                </div>
                <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold', STATUS_COLORS[doc.status] || 'bg-[var(--navy-4)] text-[var(--sand-2)]')}>
                  {tc(doc.status?.toLowerCase()) || doc.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold', TYPE_COLORS[doc.type] || 'bg-[var(--navy-4)] text-[var(--sand-2)]')}>
                  {TYPE_LABELS[doc.type] || doc.type}
                </span>
                <span className="font-bold text-[var(--sand)] text-[15px]">{doc.total} <span className="text-xs font-normal text-[var(--sand-muted)]">{tc('currency')}</span></span>
              </div>
              {doc.type === 'FACTURE' && !doc.isPaid && (doc.remaining ?? 0) > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-amber-500">{t('remaining')}: {fmt(doc.remaining ?? 0)} {CURRENCY}</span>
                  {doc.overdue && <span className="font-bold text-red-500">⚠ {t('overdue')}</span>}
                </div>
              )}
              {doc.type === 'FACTURE' && doc.isPaid && (
                <div className="text-[11px] font-semibold text-emerald-500">✓ {tc('paid')}</div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--sand-muted)]">{doc.date}</span>
                <div className="flex items-center gap-1.5">
                  {EMAILABLE_TYPES.includes(doc.type) && (
                    <button type="button" onClick={() => openSendModal(doc)} className="p-2.5 text-[var(--sand-muted)] hover:text-[var(--green-3)] hover:bg-[rgba(37,99,235,0.1)] rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center" title={t('sendEmail')}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </button>
                  )}
                  {EMAILABLE_TYPES.includes(doc.type) && (
                    <button type="button" onClick={() => {
                      const msg = encodeURIComponent(`Bonjour,\nVeuillez trouver ci-joint le document ${doc.number} d'un montant de ${doc.total} DA.\nCordialement.`);
                      window.open(`https://wa.me/?text=${msg}`, '_blank');
                    }} className="p-2.5 text-[var(--sand-muted)] hover:text-emerald-500 hover:bg-emerald-400/10 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center" title="WhatsApp">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </button>
                  )}
                  <button type="button" onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)} className="p-2.5 text-[var(--sand-muted)] hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button type="button" onClick={() => handleDuplicate(doc.id)} className="p-2.5 text-[var(--sand-muted)] hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(doc)} className="p-2.5 text-[var(--sand-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              {tc('back')}
            </Button>
            <span className="text-sm text-[var(--sand-muted)] font-medium px-3">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              {t('next')}
            </Button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title={t('recordPayment')} size="md">
        {payTarget && (() => {
          const net = payTarget.netAPayer ?? 0;
          const paid = payTarget.amountPaid ?? 0;
          const remaining = payTarget.remaining ?? Math.max(0, net - paid);
          const pct = net > 0 ? Math.min(100, Math.round((paid / net) * 100)) : 0;
          return (
            <div className="text-start space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--sand-muted)]">{payTarget.number} · {payTarget.client || '—'}</span>
                <span className="font-bold text-[var(--sand)]">{fmt(net)} {CURRENCY}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-emerald-500 font-semibold">{t('paidAmount')}: {fmt(paid)} {CURRENCY}</span>
                  <span className="text-amber-500 font-semibold">{t('remaining')}: {fmt(remaining)} {CURRENCY}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--navy-3)] overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              {!payTarget.isPaid && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('paymentAmount')}</label>
                  <input
                    type="number" min="0" value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    onFocus={e => e.target.select()}
                    className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {!payTarget.isPaid && (
                  <>
                    <Button className="flex-1 min-w-[120px]" disabled={paySaving || !(parseFloat(payAmount) > 0)}
                      onClick={() => patchPayment(payTarget.id, { payment: parseFloat(payAmount) || 0 })}>
                      {paySaving ? '…' : t('addPayment')}
                    </Button>
                    <Button variant="secondary" className="flex-1 min-w-[120px]" disabled={paySaving}
                      onClick={() => patchPayment(payTarget.id, { markPaid: true })}>
                      {t('markPaid')}
                    </Button>
                  </>
                )}
                {payTarget.isPaid && (
                  <Button variant="outline" className="flex-1" disabled={paySaving}
                    onClick={() => patchPayment(payTarget.id, { markUnpaid: true })}>
                    {t('markUnpaid')}
                  </Button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Send by Email Modal */}
      <Modal open={!!sendTarget} onClose={() => setSendTarget(null)} title={t('sendEmail')} size="md">
        {sendTarget && (
          <div className="text-start space-y-3">
            <p className="text-xs text-[var(--sand-muted)]">{sendTarget.number} · {sendTarget.client || '—'}</p>
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('recipient')}</label>
              <input
                type="email" value={sendTo} onChange={e => setSendTo(e.target.value)}
                placeholder="client@example.com"
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('message')} <span className="normal-case font-normal">({t('optional')})</span></label>
              <textarea
                value={sendMsg} onChange={e => setSendMsg(e.target.value)} maxLength={2000}
                placeholder={t('messagePlaceholder')}
                className="w-full h-24 resize-none rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] p-3 text-sm text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]"
              />
            </div>
            {sendError && <p className="text-xs text-red-500">{sendError}</p>}
            <Button className="w-full" disabled={sendSaving || sendOk || !sendTo.trim()} onClick={handleSend}>
              {sendOk ? `✓ ${t('sent')}` : sendSaving ? '…' : t('sendNow')}
            </Button>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={tc('yesDelete')}>
        <p className="text-sm text-[var(--sand-muted)] mb-4">
          {t('deleteConfirm')} <strong>{deleteTarget?.number}</strong> ?
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>{tc('cancel')}</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && handleDelete(deleteTarget.id)}>{tc('delete')}</Button>
        </div>
      </Modal>
    </>
  );
}
