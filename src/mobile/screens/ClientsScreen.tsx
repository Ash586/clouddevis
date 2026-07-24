'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, Phone, Mail, Building, X } from 'lucide-react';
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
    fetchAllClients()
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    clients.filter((c) =>
      !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
    ), [clients, search]);

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

  const inputCls = 'w-full rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] px-4 py-2.5 text-sm text-[#2563EB] placeholder-[#5A6B85] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-dvh bg-[#F3F6FC] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[rgba(15,39,71,0.09)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-[#2563EB] via-[#1E40AF] to-[#2563EB]" />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#33425C] hover:bg-[#F3F6FC]">
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="text-lg font-extrabold text-[#2563EB]">{t('clients.title')}</h1>
            <span className="text-xs text-[#5A6B85]">({clients.length})</span>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6B85]" />
            <input
              type="text"
              placeholder={t('clients.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] py-2.5 pl-9 pr-8 text-sm text-[#2563EB] placeholder-[#5A6B85] focus:border-[#2563EB] focus:outline-none transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5A6B85]">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4">
                <div className="pd-skeleton mb-2 h-4 w-32 rounded" />
                <div className="pd-skeleton h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB]/5">
              <Users size={28} className="text-[#2563EB]/30" />
            </div>
            <p className="text-sm font-bold text-[#2563EB]">{t('clients.empty')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((client) => (
              <div key={client.id} className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-sm font-bold text-[#2563EB]">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#2563EB]">{client.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        {client.phone && (
                          <span className="flex items-center gap-1 text-xs text-[#5A6B85]">
                            <Phone size={10} /> {client.phone}
                          </span>
                        )}
                        {client.email && (
                          <span className="flex items-center gap-1 text-xs text-[#5A6B85]">
                            <Mail size={10} /> {client.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="flex h-7 w-7 items-center justify-center rounded text-[#5A6B85] hover:text-[#E8542E] hover:bg-[#E8542E]/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add client modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2563EB]/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[rgba(15,39,71,0.09)]">
            <h3 className="mb-4 text-lg font-bold text-[#2563EB]">{t('clients.add')}</h3>
            <div className="space-y-3">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('clients.namePh')} className={inputCls} />
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder={t('clients.phone')} dir="ltr" className={inputCls} />
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t('clients.email')} dir="ltr" className={inputCls} />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-[rgba(15,39,71,0.09)] py-2.5 text-sm font-bold text-[#33425C] hover:bg-[#EDF2FB] transition-colors">
                {t('clients.cancel')}
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || !newPhone.trim() || saving}
                className="flex-1 rounded-lg bg-[#2563EB] py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-all disabled:opacity-50 active:scale-[0.97]"
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

function Users(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
