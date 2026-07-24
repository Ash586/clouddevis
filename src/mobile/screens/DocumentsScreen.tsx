'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, MoreVertical, Pencil, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface Doc {
  id: string; number: string; type: string; client: string;
  total: string; date: string; status: string;
}

const TYPE_COLORS: Record<string, string> = {
  DEVIS: 'bg-blue-500/10 text-blue-600', FACTURE: 'bg-blue-600/10 text-[#2563EB]',
  PROFORMA: 'bg-purple-500/10 text-purple-600', BC: 'bg-amber-500/10 text-amber-600',
  BR: 'bg-teal-500/10 text-teal-600', BL: 'bg-cyan-500/10 text-cyan-600',
  INTERVENTION: 'bg-rose-500/10 text-rose-600', ATTACHEMENT: 'bg-indigo-500/10 text-indigo-600',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-500', ACCEPTED: 'bg-blue-500/10 text-blue-600',
  PROGRESS: 'bg-amber-500/10 text-amber-600', DELIVERED: 'bg-teal-500/10 text-teal-600',
  SENT: 'bg-sky-500/10 text-sky-600', PAID: 'bg-emerald-500/10 text-emerald-600',
};

const TYPE_LABELS: Record<string, string> = {
  devis: 'Devis', facture: 'Facture', proforma: 'Proforma',
  bc: 'B. Commande', br: 'B. Réception', bl: 'B. Livraison',
  intervention: 'Intervention', attachement: 'Attachement',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon', ACCEPTED: 'Acceptée', PROGRESS: 'En cours',
  DELIVERED: 'Livrée', SENT: 'Envoyée', PAID: 'Payée',
};

interface DocumentsScreenProps {
  onNavigate?: (target: string) => void;
}

export function DocumentsScreen({ onNavigate }: DocumentsScreenProps) {
  const { t, dir } = useMobileI18n();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/documents?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDocs(data.documents || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { setDocs([]); } finally { setLoading(false); }
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleDuplicate = async (id: string) => {
    setOpenMenu(null);
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId: id }),
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    setOpenMenu(null);
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filteredTypes = ['DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BL'];

  return (
    <div dir={dir} className="min-h-dvh bg-[#F3F6FC] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(15,39,71,0.08)] px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-extrabold text-[#0F2747]">{t('docs.title')}</h1>
          <button type="button" onClick={() => onNavigate?.('editor:new')} className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[rgba(37,99,235,0.25)]">
            <Plus size={18} />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B85]" />
          <input
            type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('docs.searchPlaceholder')}
            className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[#F3F6FC] pl-10 pr-4 py-2.5 text-sm text-[#0F2747] placeholder:text-[#5A6B85] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all"
          />
        </div>
      </div>

      <main className="px-5 pt-4 max-w-lg mx-auto">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
          <button type="button" onClick={() => { setTypeFilter(''); setPage(1); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!typeFilter ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#5A6B85] border-[rgba(15,39,71,0.1)]'}`}>
            {t('docs.filterAll')}
          </button>
          {filteredTypes.map((ty) => (
            <button key={ty} type="button" onClick={() => { setTypeFilter(typeFilter === ty ? '' : ty); setPage(1); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${typeFilter === ty ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#5A6B85] border-[rgba(15,39,71,0.1)]'}`}>
              {TYPE_LABELS[ty.toLowerCase()] || ty}
            </button>
          ))}
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button key={key} type="button" onClick={() => { setStatusFilter(statusFilter === key ? '' : key); setPage(1); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusFilter === key ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#5A6B85] border-[rgba(15,39,71,0.1)]'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Doc list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4 space-y-3 animate-pulse">
                <div className="flex justify-between"><div className="h-4 w-28 bg-[#EDF2FB] rounded" /><div className="h-5 w-16 bg-[#EDF2FB] rounded-full" /></div>
                <div className="flex justify-between"><div className="h-3 w-20 bg-[#EDF2FB] rounded" /><div className="h-4 w-20 bg-[#EDF2FB] rounded" /></div>
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm font-semibold text-[#0F2747]">{t('docs.empty')}</p>
            <p className="text-xs text-[#5A6B85] mt-1">{t('docs.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc.id} className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[#0F2747] text-[15px]">{doc.number}</p>
                    <p className="text-xs text-[#5A6B85] mt-0.5">{doc.client || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${STATUS_COLORS[doc.status] || ''}`}>
                    {STATUS_LABELS[doc.status] || doc.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${TYPE_COLORS[doc.type] || ''}`}>
                    {TYPE_LABELS[doc.type?.toLowerCase()] || doc.type}
                  </span>
                  <span className="font-bold text-[#0F2747] text-[15px]">{doc.total} <span className="text-xs font-normal text-[#5A6B85]">DA</span></span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#5A6B85]">{doc.date}</span>
                  <div className="flex items-center gap-1 relative">
                    <button type="button" onClick={() => onNavigate?.(`editor:${doc.id}`)} className="p-2 rounded-lg text-[#5A6B85] hover:text-[#2563EB] hover:bg-blue-500/10 transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => setOpenMenu(openMenu === doc.id ? null : doc.id)} className="p-2 rounded-lg text-[#5A6B85] hover:text-[#0F2747] hover:bg-[#EDF2FB] transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <MoreVertical size={15} />
                    </button>
                    {openMenu === doc.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 bottom-full mb-1 z-20 bg-white border border-[rgba(15,39,71,0.1)] rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                          <button type="button" onClick={() => handleDuplicate(doc.id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-[#0F2747] hover:bg-[#EDF2FB] transition">
                            <Copy size={13} /> {t('docs.swipeDuplicate')}
                          </button>
                          <button type="button" onClick={() => { setOpenMenu(null); handleDelete(doc.id); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                            <Trash2 size={13} /> {t('docs.swipeDelete')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4 pb-4">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-[rgba(15,39,71,0.1)] bg-white disabled:opacity-40">
              <ChevronLeft size={16} className="text-[#0F2747]" />
            </button>
            <span className="text-sm text-[#5A6B85] font-medium">{page} / {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-[rgba(15,39,71,0.1)] bg-white disabled:opacity-40">
              <ChevronRight size={16} className="text-[#0F2747]" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
