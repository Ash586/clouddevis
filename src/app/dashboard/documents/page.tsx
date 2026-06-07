'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

type DocStatus = 'DRAFT' | 'ACCEPTED' | 'PROGRESS' | 'DELIVERED';

interface Doc {
  id: string;
  number: string;
  type: string;
  client: string;
  total: string;
  date: string;
  status: string;
}

interface TypeInfo {
  count: number;
  total: number;
}

const TYPE_LABELS: Record<string, string> = {
  DEVIS: 'Devis',
  FACTURE: 'Facture',
  PROFORMA: 'Proforma',
  BC: 'BC',
  BR: 'BR',
};

const TYPE_COLORS: Record<string, string> = {
  DEVIS: 'bg-blue-100 text-blue-700',
  FACTURE: 'bg-emerald-100 text-emerald-700',
  PROFORMA: 'bg-purple-100 text-purple-700',
  BC: 'bg-amber-100 text-amber-700',
  BR: 'bg-teal-100 text-teal-700',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  PROGRESS: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
};

const STATUS_OPTIONS: DocStatus[] = ['DRAFT', 'ACCEPTED', 'PROGRESS', 'DELIVERED'];

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const tc = useTranslations('common');
  const router = useRouter();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [typeBreakdown, setTypeBreakdown] = useState<Record<string, TypeInfo>>({});
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doc | null>(null);

  const totalRevenue = Object.values(typeBreakdown).reduce((sum, t) => sum + t.total, 0);

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
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, dateFrom, dateTo, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') fetchData(); };
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('title')}</h1>

              {/* Filters */}
              <Card className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{tc('search')}</label>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder={t('searchPlaceholder')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{tc('type')}</label>
                    <select
                      value={typeFilter}
                      onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    >
                      <option value="">{t('allTypes')}</option>
                      <option value="DEVIS">Devis</option>
                      <option value="FACTURE">Facture</option>
                      <option value="PROFORMA">Proforma</option>
                      <option value="BC">BC</option>
                      <option value="BR">BR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{tc('status')}</label>
                    <select
                      value={statusFilter}
                      onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    >
                      <option value="">{t('allStatuses')}</option>
                      <option value="DRAFT">{tc('draft')}</option>
                      <option value="ACCEPTED">{tc('accepted')}</option>
                      <option value="PROGRESS">{tc('progress')}</option>
                      <option value="DELIVERED">{tc('delivered')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t('dateFrom')}</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t('dateTo')}</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => { setDateTo(e.target.value); setPage(1); }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="text-center">
                  <p className="text-2xl font-black text-slate-900">{totalDocs}</p>
                  <p className="text-xs text-slate-500 font-semibold">{t('totalDocs')}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-2xl font-black text-slate-900">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-slate-400">{tc('currency')}</span></p>
                  <p className="text-xs text-slate-500 font-semibold">{t('totalRevenue')}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-2xl font-black text-slate-900">{statusBreakdown['DRAFT'] || 0}</p>
                  <p className="text-xs text-slate-500 font-semibold">{tc('draft')}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-2xl font-black text-slate-900">{statusBreakdown['DELIVERED'] || 0}</p>
                  <p className="text-xs text-slate-500 font-semibold">{tc('delivered')}</p>
                </Card>
              </div>

              {/* Desktop Table */}
              <Card className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-start py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{tc('number')}</th>
                      <th className="text-start py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{tc('type')}</th>
                      <th className="text-start py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{tc('client')}</th>
                      <th className="text-end py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{tc('total')}</th>
                      <th className="text-start py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{tc('date')}</th>
                      <th className="text-start py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{tc('status')}</th>
                      <th className="text-end py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="py-8 text-center text-slate-400">{tc('loading')}</td></tr>
                    ) : docs.length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-slate-400">{t('noDocs')}</td></tr>
                    ) : docs.map(doc => (
                      <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900">{doc.number}</td>
                        <td className="py-3 px-3">
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', TYPE_COLORS[doc.type] || 'bg-slate-100 text-slate-600')}>
                            {TYPE_LABELS[doc.type] || doc.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{doc.client || '—'}</td>
                        <td className="py-3 px-3 text-end font-bold text-slate-900">{doc.total} <span className="text-xs font-normal text-slate-400">{tc('currency')}</span></td>
                        <td className="py-3 px-3 text-slate-500">{doc.date}</td>
                        <td className="py-3 px-3 relative">
                          <button
                            onClick={() => setStatusDropdownOpen(statusDropdownOpen === doc.id ? null : doc.id)}
                            className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer hover:opacity-80 transition', STATUS_COLORS[doc.status] || 'bg-slate-100 text-slate-600')}
                          >
                            {tc(doc.status?.toLowerCase()) || doc.status}
                          </button>
                          {statusDropdownOpen === doc.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(null)} />
                              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                                {STATUS_OPTIONS.map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusChange(doc.id, s)}
                                    className={cn(
                                      'w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition',
                                      s === doc.status && 'bg-blue-50 text-blue-600'
                                    )}
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
                            <button onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('edit')}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDuplicate(doc.id)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" title={t('duplicate')}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                            <button onClick={() => setDeleteTarget(doc)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title={tc('delete')}>
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
                  <Card className="py-8 text-center text-slate-400">{tc('loading')}</Card>
                ) : docs.length === 0 ? (
                  <Card className="py-8 text-center text-slate-400">{t('noDocs')}</Card>
                ) : docs.map(doc => (
                  <Card key={doc.id} className="space-y-3 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{doc.number}</p>
                        <p className="text-xs text-slate-400">{doc.client || '—'}</p>
                      </div>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', STATUS_COLORS[doc.status] || 'bg-slate-100 text-slate-600')}>
                        {tc(doc.status?.toLowerCase()) || doc.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', TYPE_COLORS[doc.type] || 'bg-slate-100 text-slate-600')}>
                        {TYPE_LABELS[doc.type] || doc.type}
                      </span>
                      <span className="font-bold text-slate-900">{doc.total} <span className="text-xs font-normal text-slate-400">{tc('currency')}</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{doc.date}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDuplicate(doc.id)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(doc)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center">
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
                  <span className="text-sm text-slate-500 font-medium px-3">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                    {t('next')}
                  </Button>
                </div>
              )}
            </div>
          </TrialGate>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={tc('yesDelete')}>
        <p className="text-sm text-slate-500 mb-4">
          {t('deleteConfirm')} <strong>{deleteTarget?.number}</strong> ?
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>{tc('cancel')}</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && handleDelete(deleteTarget.id)}>{tc('delete')}</Button>
        </div>
      </Modal>
    </div>
  );
}
