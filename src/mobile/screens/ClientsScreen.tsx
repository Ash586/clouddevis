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
  const [form, setForm] = useState({
    name: client?.name || '',
    nif: client?.nif || '',
    rc: client?.rc || '',
    nis: client?.nis || '',
    ai: client?.ai || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave({
      ...form,
      nif: form.nif || undefined,
      rc: form.rc || undefined,
      nis: form.nis || undefined,
      ai: form.ai || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-3"
    >
      <div>
        <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">Nom *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Nom du client"
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)] border border-[var(--border)] focus:border-[var(--green-2)]"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">NIF</label>
        <input
          type="text"
          value={form.nif}
          onChange={(e) => setForm((p) => ({ ...p, nif: e.target.value }))}
          placeholder="123456789012345"
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)] border border-[var(--border)] focus:border-[var(--green-2)]"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">RC</label>
        <input
          type="text"
          value={form.rc}
          onChange={(e) => setForm((p) => ({ ...p, rc: e.target.value }))}
          placeholder="16B1234567"
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)] border border-[var(--border)] focus:border-[var(--green-2)]"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">NIS</label>
        <input
          type="text"
          value={form.nis}
          onChange={(e) => setForm((p) => ({ ...p, nis: e.target.value }))}
          placeholder="1234567890"
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)] border border-[var(--border)] focus:border-[var(--green-2)]"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">AI</label>
        <input
          type="text"
          value={form.ai}
          onChange={(e) => setForm((p) => ({ ...p, ai: e.target.value }))}
          placeholder="1234567890"
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)] border border-[var(--border)] focus:border-[var(--green-2)]"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">Téléphone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="0555 12 34 56"
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)] border border-[var(--border)] focus:border-[var(--green-2)]"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="client@example.com"
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)] border border-[var(--border)] focus:border-[var(--green-2)]"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">Adresse</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          placeholder="123 Rue Principale, Alger"
          className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)] border border-[var(--border)] focus:border-[var(--green-2)]"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button"           onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[var(--navy-3)] text-[var(--sand-muted)]"
        >
          Annuler
        </button>
        <button type="button"           onClick={handleSubmit}
          disabled={!form.name.trim()}
          className={cn(
            'flex-1 py-3 rounded-xl text-sm font-semibold transition-all',
            form.name.trim()
              ? 'bg-[var(--green-2)] text-white active:scale-[0.98]'
              : 'bg-[var(--navy-3)] text-[var(--sand-muted)] cursor-not-allowed',
          )}
        >
          {client ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Screen ──────────────────────────────────────────────

export function ClientsScreen({ onBack }: ClientsScreenProps) {
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
              <h1 className="text-xl font-bold text-[var(--sand)]">Clients</h1>
              <p className="text-xs text-[var(--sand-muted)] mt-0.5">
                {clients.length} client{clients.length !== 1 ? 's' : ''}
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
            placeholder="Rechercher un client..."
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
                {searchQuery ? 'Aucun résultat' : 'Aucun client'}
              </p>
              <p className="text-xs text-[var(--sand-muted)] mt-1 text-center max-w-[200px]">
                {searchQuery
                  ? 'Essayez un autre terme'
                  : 'Ajoutez votre premier client en appuyant sur +'}
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
                      <button type="button"                         onClick={() => handleEdit(client)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[var(--navy-3)] text-[var(--sand-muted)] active:scale-[0.98] transition-transform"
                      >
                        Modifier
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
        title={`Supprimer ${clientToDelete?.name ?? 'ce client'} ?`}
        message={
          clientToDelete && getClientDocCount(clientToDelete.id) > 0
            ? `Ce client est lié à ${getClientDocCount(clientToDelete.id)} document(s). Cette action est irréversible.`
            : 'Cette action est irréversible.'
        }
        onConfirm={() => {
          if (clientToDelete) deleteClient(clientToDelete.id);
        }}
        onClose={() => setClientToDelete(null)}
      />
    </div>
  );
}
