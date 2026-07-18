'use client';

// ============================================================
// Rakmana Mobile — Clients Screen
// Client management: list, search, add, edit, delete
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, UserPlus, Users, Phone, Mail, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientStore } from '@/stores/clientStore';
import { useDocumentStore } from '@/stores/documentStore';
import { Badge } from '@/components/ui/badge';
import { ConfirmSheet } from '@/mobile/components/ConfirmSheet';
import { ClientFields, type ClientFieldsState } from '@/mobile/components/ClientFields';
import { useMobileI18n } from '@/mobile/lib/i18n';
import type { Client } from '@/mobile/types';

interface ClientsScreenProps {
  /** Navigate back to company profile */
  onBack?: () => void;
}

// ── Client Form ──────────────────────────────────────────────

interface ClientFormProps {
  client?: Client | null;
  onSave: (data: Omit<Client, 'id'>) => void;
  onCancel: () => void;
}

function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const { t } = useMobileI18n();
  const [form, setForm] = useState<ClientFieldsState>({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
    nif: client?.nif || '',
    rc: client?.rc || '',
    nis: client?.nis || '',
    ai: client?.ai || '',
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      nif: form.nif.trim() || undefined,
      rc: form.rc.trim() || undefined,
      nis: form.nis.trim() || undefined,
      ai: form.ai.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-3"
    >
      <ClientFields
        form={form}
        onChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
        autoFocusName={!client}
      />
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[var(--navy-3)] text-[var(--sand-muted)]"
        >
          {t('clients.cancel')}
        </button>
        <button type="button" onClick={handleSubmit}
          disabled={!form.name.trim()}
          className={cn(
            'flex-1 py-3 rounded-xl text-sm font-semibold transition-all',
            form.name.trim()
              ? 'bg-[var(--green-2)] text-white active:scale-[0.98]'
              : 'bg-[var(--navy-3)] text-[var(--sand-muted)] cursor-not-allowed',
          )}
        >
          {client ? t('clients.edit') : t('clients.add')}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Screen ──────────────────────────────────────────────

export function ClientsScreen({ onBack }: ClientsScreenProps) {
  const { t } = useMobileI18n();
  const clients = useClientStore((s) => s.clients);
  const addClient = useClientStore((s) => s.addClient);
  const updateClient = useClientStore((s) => s.updateClient);
  const deleteClient = useClientStore((s) => s.deleteClient);
  const searchClients = useClientStore((s) => s.searchClients);

  const savedDocuments = useDocumentStore((s) => s.savedDocuments);

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // ── Filtered clients ──
  const filteredClients = useMemo(() => {
    return searchQuery ? searchClients(searchQuery) : clients;
  }, [clients, searchQuery, searchClients]);

  // ── Client document count ──
  const getClientDocCount = useCallback(
    (clientId: string) => {
      return savedDocuments.filter((d) => d.client?.id === clientId).length;
    },
    [savedDocuments]
  );

  const handleSave = (data: Omit<Client, 'id'>) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient(data);
    }
    setShowForm(false);
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button type="button"                 onClick={onBack}
                className="w-11 h-11 rounded-xl bg-[var(--navy-3)] flex items-center justify-center text-[var(--sand-muted)] active:scale-95 transition-transform"
                aria-label="Retour"
              >
                <ArrowLeft size={18} className="rtl:rotate-180" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-[var(--sand)]">{t('clients.title')}</h1>
              <p className="text-xs text-[var(--sand-muted)] mt-0.5">
                {clients.length} {t('stats.clientsSub')}
              </p>
            </div>
          </div>
          <button type="button"             onClick={() => {
              setEditingClient(null);
              setShowForm(true);
            }}
            className="w-11 h-11 rounded-xl bg-[var(--green-2)] flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Ajouter un client"
          >
            <UserPlus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('clients.searchPlaceholder')}
            className={cn(
              'w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl text-sm',
              'bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
              'border border-[var(--border)]',
              'focus:outline-none focus:border-[var(--green-2)]',
            )}
          />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <AnimatePresence mode="wait">
          {showForm ? (
            /* ── Add/Edit form ── */
            <ClientForm
              key="form"
              client={editingClient}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : filteredClients.length === 0 ? (
            /* ── Empty state ── */
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--navy-3)] flex items-center justify-center mb-4">
                <Users size={28} className="text-[var(--sand-muted)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--sand-muted)]">
                {searchQuery ? t('clients.noResults') : t('clients.empty')}
              </p>
              <p className="text-xs text-[var(--sand-muted)] mt-1 text-center max-w-[200px]">
                {searchQuery ? t('clients.noResultsHint') : t('clients.emptyHint')}
              </p>
            </motion.div>
          ) : (
            /* ── Client list ── */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredClients.map((client, i) => {
                const docCount = getClientDocCount(client.id);
                return (
                  <motion.div
                    key={client.id}
                    className="mb-3 rounded-2xl bg-[var(--navy-2)] border border-[var(--border)] p-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--sand)] truncate">
                          {client.name}
                        </p>
                        {client.nif && (
                          <p className="text-[11px] text-[var(--sand-muted)] font-mono mt-0.5">
                            NIF: {client.nif}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {client.phone && (
                            <span className="flex items-center gap-1 text-[11px] text-[var(--sand-muted)]">
                              <Phone size={10} />
                              {client.phone}
                            </span>
                          )}
                          {client.email && (
                            <span className="flex items-center gap-1 text-[11px] text-[var(--sand-muted)]">
                              <Mail size={10} />
                              {client.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="info">{docCount} doc{docCount !== 1 ? 's' : ''}</Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                      <button type="button" onClick={() => handleEdit(client)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[var(--navy-3)] text-[var(--sand-muted)] active:scale-[0.98] transition-transform"
                      >
                        {t('clients.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientToDelete(client)}
                        className="py-2 px-3 min-h-[44px] rounded-xl text-xs font-semibold bg-red-400/10 text-red-400 active:scale-[0.98] transition-transform"
                        aria-label={`Supprimer ${client.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete confirmation */}
      <ConfirmSheet
        open={clientToDelete !== null}
        title={`${t('clients.deleteTitle')} ${clientToDelete?.name ?? ''} ?`}
        message={
          clientToDelete && getClientDocCount(clientToDelete.id) > 0
            ? `${t('clients.deleteLinked')} ${t('clients.deleteIrreversible')}`
            : t('clients.deleteIrreversible')
        }
        onConfirm={() => {
          if (clientToDelete) deleteClient(clientToDelete.id);
        }}
        onClose={() => setClientToDelete(null)}
      />
    </div>
  );
}
