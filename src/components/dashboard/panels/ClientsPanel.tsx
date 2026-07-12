'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useHaptics } from '@/hooks/useHaptics';
import { NotificationType } from '@capacitor/haptics';

interface ClientDoc {
  number: string;
  total: string;
  date: string;
}

interface Client {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  docCount: number;
  lastDoc: ClientDoc | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const EMPTY_FORM = { name: '', address: '', phone: '', email: '', nif: '', nis: '', rc: '' };

export function ClientsPanel() {
  const t = useTranslations('clients');
  const router = useRouter();
  const { notification } = useHaptics();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/clients?${params}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients);
        setPagination(data.pagination);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    const debounce = setTimeout(() => { setPage(1); }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setShowAddModal(true);
  }

  function openEdit(client: Client) {
    setEditTarget(client);
    setForm({
      name: client.name,
      address: client.address ?? '',
      phone: client.phone ?? '',
      email: client.email ?? '',
      nif: client.nif ?? '',
      nis: client.nis ?? '',
      rc: client.rc ?? '',
    });
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(false);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/clients/${editTarget.id}` : '/api/clients';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddModal(false);
        setEditTarget(null);
        setForm(EMPTY_FORM);
        fetchClients();
      } else {
        setSaveError(true);
      }
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/clients/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteTarget(null);
      fetchClients();
      notification(NotificationType.Success);
    }
  }

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl font-black text-[var(--sand)]">{t('title')}</h1>
          <Button onClick={openAdd}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('newClient')}
          </Button>
        </div>

        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-4 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
        />

        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t('fetchError')}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse h-20" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-sm text-[var(--sand-muted)]">{t('empty')}</p>
          </Card>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Card className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(15,39,71,0.06)]">
                      <th className="text-start px-4 py-3 font-semibold text-[var(--sand-muted)] text-xs uppercase tracking-wide">{t('name')}</th>
                      <th className="text-start px-4 py-3 font-semibold text-[var(--sand-muted)] text-xs uppercase tracking-wide">{t('phone')}</th>
                      <th className="text-start px-4 py-3 font-semibold text-[var(--sand-muted)] text-xs uppercase tracking-wide">{t('email')}</th>
                      <th className="text-start px-4 py-3 font-semibold text-[var(--sand-muted)] text-xs uppercase tracking-wide">NIF</th>
                      <th className="text-center px-4 py-3 font-semibold text-[var(--sand-muted)] text-xs uppercase tracking-wide">{t('docs')}</th>
                      <th className="text-start px-4 py-3 font-semibold text-[var(--sand-muted)] text-xs uppercase tracking-wide">{t('lastDoc')}</th>
                      <th className="text-end px-4 py-3 font-semibold text-[var(--sand-muted)] text-xs uppercase tracking-wide">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id} className="border-b border-[rgba(15,39,71,0.04)] hover:bg-[rgba(15,39,71,0.02)] transition">
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => router.push(`/dashboard/clients/${client.id}`)} className="font-semibold text-[var(--sand)] hover:text-blue-400 transition text-start">
                            {client.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-[var(--sand-2)]">{client.phone || '—'}</td>
                        <td className="px-4 py-3 text-[var(--sand-2)]">{client.email || '—'}</td>
                        <td className="px-4 py-3 text-[var(--sand-2)]">{client.nif || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-400/10 text-blue-400 text-xs font-bold">
                            {client.docCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--sand-muted)] text-xs">
                          {client.lastDoc ? `${client.lastDoc.number} · ${client.lastDoc.date}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" onClick={() => openEdit(client)} className="p-1.5 rounded-lg text-[var(--sand-muted)] hover:text-blue-400 hover:bg-blue-400/10 transition" title={t('edit')}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button type="button" onClick={() => setDeleteTarget(client)} className="p-1.5 rounded-lg text-[var(--sand-muted)] hover:text-red-400 hover:bg-red-400/10 transition" title={t('delete')}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {clients.map(client => (
                <Card key={client.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <button type="button" onClick={() => router.push(`/dashboard/clients/${client.id}`)} className="font-semibold text-[var(--sand)] hover:text-blue-400 transition min-h-[44px] flex items-center text-[15px]">
                      {client.name}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => openEdit(client)} className="p-2.5 rounded-lg text-[var(--sand-muted)] hover:text-blue-400 hover:bg-blue-400/10 transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(client)} className="p-2.5 rounded-lg text-[var(--sand-muted)] hover:text-red-400 hover:bg-red-400/10 transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-[var(--sand-muted)]">
                    {client.phone && <p>{client.phone}</p>}
                    {client.email && <p>{client.email}</p>}
                    {client.nif && <p>NIF: {client.nif}</p>}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--sand-muted)]">
                    <span>{client.docCount} {t('docs').toLowerCase()}</span>
                    {client.lastDoc && <span>{client.lastDoc.number}</span>}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  {t('prev')}
                </Button>
                <span className="text-sm text-[var(--sand-muted)] font-medium">
                  {page} / {pagination.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                  {t('next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={showAddModal || !!editTarget}
        onClose={() => { setShowAddModal(false); setEditTarget(null); }}
        title={editTarget ? t('editClient') : t('newClient')}
      >
        <div className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('name')} *</label>
            <input
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
              placeholder={t('namePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('address')}</label>
            <input
              value={form.address}
              onChange={e => setField('address', e.target.value)}
              className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
              placeholder={t('addressPlaceholder')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('phone')}</label>
              <input
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
                placeholder={t('phonePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">{t('email')}</label>
              <input
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
                placeholder={t('emailPlaceholder')}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">NIF</label>
              <input value={form.nif} onChange={e => setField('nif', e.target.value)} className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">NIS</label>
              <input value={form.nis} onChange={e => setField('nis', e.target.value)} className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide mb-1">RC</label>
              <input value={form.rc} onChange={e => setField('rc', e.target.value)} className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-3)] px-3.5 py-2.5 text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setShowAddModal(false); setEditTarget(null); }}>
              {t('cancel')}
            </Button>
            <Button className="flex-1" disabled={saving || !form.name.trim()} onClick={handleSave}>
              {saving ? '...' : editTarget ? t('save') : t('add')}
            </Button>
          </div>
          {saveError && <p className="mt-2 text-xs text-red-600">{t('saveError')}</p>}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('deleteClient')}>
        <div className="text-center">
          <div className="text-3xl mb-3">
            <svg className="w-10 h-10 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </div>
          <h3 className="text-sm font-bold text-[var(--sand)] mb-2">{t('deleteConfirm')}</h3>
          <p className="text-xs text-[var(--sand-muted)] mb-5">{t('deleteWarning')}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 py-2 bg-[var(--navy-3)] text-[var(--sand-2)] text-sm font-bold rounded-xl hover:bg-[var(--navy-4)] transition">
              {t('cancel')}
            </button>
            <button type="button" onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition">
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
