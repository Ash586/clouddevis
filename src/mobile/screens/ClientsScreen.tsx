'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, Phone, Mail, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { fetchAllClients, createApiClient, deleteApiClient } from '@/mobile/lib/api';
import type { ApiClientRecord } from '@/mobile/lib/api';

interface ClientsScreenProps {
  onBack?: () => void;
}

export function ClientsScreen({ onBack }: ClientsScreenProps) {
  const { t } = useMobileI18n();
  const [clients, setClients] = useState<ApiClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllClients().then(setClients).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    clients.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)),
  [clients, search]);

  const handleAdd = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setSaving(true);
    try {
      const res = await createApiClient({ name: newName.trim(), phone: newPhone.trim(), email: newEmail.trim() } as any);
      setClients((prev) => [...prev, { id: res.id, name: newName.trim(), phone: newPhone.trim(), email: newEmail.trim(), address: null, nif: null, rc: null, nis: null, ai: null }]);
      setShowAdd(false);
      setNewName(''); setNewPhone(''); setNewEmail('');
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('clients.deleteTitle'))) return;
    try {
      await deleteApiClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  const inputCls = 'w-full rounded-lg border border-[rgba(0,26,77,0.08)] bg-[#F0F4FF] px-3.5 py-2.5 text-sm text-[#001A4D] placeholder-[#718096] transition-all duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-dvh bg-[#F8FAFD] pb-24">
      <div className="sticky z-10 bg-white/95 backdrop-blur border-b border-[rgba(0,26,77,0.06)]" style={{ top: 'var(--sat, env(safe-area-inset-top, 0px))' }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#001A4D] via-[#0052CC] to-[#001A4D]" />
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4A5568] hover:bg-[#F5F7FA] transition-colors duration-150">
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 className="text-base font-extrabold text-[#001A4D]">{t('clients.title')}</h1>
            <span className="text-[10px] text-[#718096]">({clients.length})</span>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            aria-label="Ajouter un client"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052CC] text-white shadow-sm shadow-[#0052CC]/20 transition-all duration-200 hover:bg-[#0047B3] active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-4 pb-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              placeholder={t('clients.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[rgba(0,26,77,0.06)] bg-[#F0F4FF] py-2 pl-8 pr-7 text-xs text-[#001A4D] placeholder-[#718096] transition-colors duration-200 focus:border-[#0052CC] focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC]">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3">
                <div className="pd-skeleton mb-1.5 h-3.5 w-28 rounded" />
                <div className="pd-skeleton h-2.5 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0052CC]/5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0052CC" strokeWidth="1.5" opacity="0.4">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-[#0052CC]">{t('clients.empty')}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((client) => (
              <div key={client.id} className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 transition-all duration-200 hover:border-[#0052CC]/15">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052CC]/8 text-[11px] font-bold text-[#0052CC]">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#001A4D]">{client.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {client.phone && (
                          <span className="flex items-center gap-0.5 text-[10px] text-[#718096]">
                            <Phone size={9} /> {client.phone}
                          </span>
                        )}
                        {client.email && (
                          <span className="flex items-center gap-0.5 text-[10px] text-[#718096]">
                            <Mail size={9} /> {client.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(client.id)}
                    aria-label="Supprimer"
                    className="flex h-6 w-6 items-center justify-center rounded text-[#718096] transition-colors duration-150 hover:text-[#DC3545] hover:bg-[#DC3545]/8"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001A4D]/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[rgba(0,26,77,0.06)]">
            <h3 className="mb-3 text-sm font-bold text-[#001A4D]">{t('clients.add')}</h3>
            <div className="space-y-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('clients.namePh')} className={inputCls} />
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder={t('clients.phone')} dir="ltr" className={inputCls} />
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t('clients.email')} dir="ltr" className={inputCls} />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-[rgba(0,26,77,0.08)] py-2.5 text-xs font-bold text-[#4A5568] hover:bg-[#E6F0FF] transition-colors duration-150">
                {t('clients.cancel')}
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || !newPhone.trim() || saving}
                className="flex-1 rounded-lg bg-[#0052CC] py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] disabled:opacity-50 active:scale-[0.97]"
              >
                {saving ? '...' : t('clients.addClientLabel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
