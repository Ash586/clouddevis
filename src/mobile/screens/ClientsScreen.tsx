'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, Phone, Mail, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface Client {
  id: string; name: string; phone: string | null; email: string | null;
  nif: string | null; rc: string | null; nis: string | null;
  docCount: number; lastDoc: { number: string; date: string } | null;
}

const EMPTY_FORM = { name: '', phone: '', email: '', address: '', nif: '', nis: '', rc: '' };

interface ClientsScreenProps {
  onNavigate?: (target: string) => void;
}

export function ClientsScreen({ onNavigate }: ClientsScreenProps) {
  const { t, dir } = useMobileI18n();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClients(data.clients || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { setClients([]); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { void fetchClients(); }, [fetchClients]);

  useEffect(() => {
    const debounce = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(debounce);
  }, [search]);

  function openAdd() { setForm(EMPTY_FORM); setEditTarget(null); setShowForm(true); }
  function openEdit(c: Client) { setEditTarget(c); setForm({ name: c.name, phone: c.phone ?? '', email: c.email ?? '', address: '', nif: c.nif ?? '', nis: c.nis ?? '', rc: c.rc ?? '' }); setShowForm(true); }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/clients/${editTarget.id}` : '/api/clients';
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setShowForm(false); setEditTarget(null); fetchClients(); }
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/clients/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchClients();
  }

  // Full-screen form
  if (showForm) {
    return (
      <div dir={dir} className="min-h-dvh bg-[#F3F6FC]">
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(15,39,71,0.08)] px-5 py-3 flex items-center justify-between">
          <button type="button" onClick={() => setShowForm(false)} className="p-2 -ms-2 rounded-xl hover:bg-[#EDF2FB] transition">
            <X size={20} className="text-[#0F2747]" />
          </button>
          <h2 className="text-base font-bold text-[#0F2747]">{editTarget ? t('clients.edit') : t('clients.add')}</h2>
          <button type="button" onClick={handleSave} disabled={saving || !form.name.trim()} className="p-2 -me-2 rounded-xl hover:bg-[#EDF2FB] transition disabled:opacity-40">
            <Check size={20} className="text-[#2563EB]" />
          </button>
        </div>
        <main className="px-5 pt-6 max-w-lg mx-auto space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-1.5">{t('clients.name')} *</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder={t('clients.namePh')}
              className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-white px-4 py-3 text-sm text-[#0F2747] placeholder:text-[#5A6B85] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-1.5">{t('clients.phone')}</label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="0555 55 55 55"
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-white px-4 py-3 text-sm text-[#0F2747] placeholder:text-[#5A6B85] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-1.5">{t('clients.email')}</label>
              <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="client@email.com" type="email"
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-white px-4 py-3 text-sm text-[#0F2747] placeholder:text-[#5A6B85] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-1.5">{t('clients.address')}</label>
            <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder={t('clients.addressPh')}
              className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-white px-4 py-3 text-sm text-[#0F2747] placeholder:text-[#5A6B85] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
          </div>
          <div className="pt-2">
            <p className="text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-3">{t('clients.groupFiscal')}</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#5A6B85] uppercase mb-1">NIF</label>
                <input value={form.nif} onChange={(e) => setForm((p) => ({ ...p, nif: e.target.value }))} maxLength={15}
                  className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-white px-3 py-2.5 text-sm text-[#0F2747] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#5A6B85] uppercase mb-1">NIS</label>
                <input value={form.nis} onChange={(e) => setForm((p) => ({ ...p, nis: e.target.value }))} maxLength={10}
                  className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-white px-3 py-2.5 text-sm text-[#0F2747] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#5A6B85] uppercase mb-1">RC</label>
                <input value={form.rc} onChange={(e) => setForm((p) => ({ ...p, rc: e.target.value }))} maxLength={14}
                  className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-white px-3 py-2.5 text-sm text-[#0F2747] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-dvh bg-[#F3F6FC] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(15,39,71,0.08)] px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-extrabold text-[#0F2747]">{t('clients.title')}</h1>
          <button type="button" onClick={openAdd} className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-[rgba(37,99,235,0.25)]">
            <Plus size={18} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B85]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('clients.searchPlaceholder')}
            className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[#F3F6FC] pl-10 pr-4 py-2.5 text-sm text-[#0F2747] placeholder:text-[#5A6B85] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
        </div>
      </div>

      <main className="px-5 pt-4 max-w-lg mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4 animate-pulse">
                <div className="h-4 w-32 bg-[#EDF2FB] rounded mb-2" /><div className="h-3 w-24 bg-[#EDF2FB] rounded" />
              </div>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-sm font-semibold text-[#0F2747]">{t('clients.empty')}</p>
            <p className="text-xs text-[#5A6B85] mt-1">{t('clients.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((c) => (
              <div key={c.id} className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F2747] text-[15px] truncate">{c.name}</p>
                    <div className="mt-1.5 space-y-0.5">
                      {c.phone && <p className="flex items-center gap-1.5 text-xs text-[#5A6B85]"><Phone size={11} /> {c.phone}</p>}
                      {c.email && <p className="flex items-center gap-1.5 text-xs text-[#5A6B85]"><Mail size={11} /> {c.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ms-3">
                    <button type="button" onClick={() => openEdit(c)} className="p-2 rounded-lg text-[#5A6B85] hover:text-[#2563EB] hover:bg-blue-500/10 transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg text-[#5A6B85] hover:text-red-500 hover:bg-red-50 transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#5A6B85]">
                  <div className="flex items-center gap-2">
                    {c.nif && <span className="px-2 py-0.5 rounded-full bg-[#EDF2FB] font-semibold">NIF {c.nif}</span>}
                    <span>{c.docCount} doc(s)</span>
                  </div>
                  {c.lastDoc && <span className="text-[10px]">{c.lastDoc.number}</span>}
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

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom">
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-[#0F2747] text-center mb-1">{t('clients.deleteTitle')}</p>
            <p className="text-xs text-[#5A6B85] text-center mb-5">{t('clients.deleteIrreversible')}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl border border-[rgba(15,39,71,0.1)] text-sm font-bold text-[#0F2747] hover:bg-[#EDF2FB] transition">
                {t('clients.cancel')}
              </button>
              <button type="button" onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition">
                {t('clients.deleteClient')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
