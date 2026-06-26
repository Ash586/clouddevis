'use client';

// ============================================================
// CloudDevis Mobile — Step 2: Client Selection
// Search + saved clients + inline NIF validation
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Plus, Check, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { validateNIF } from '@/lib/dgi';
import { useClientStore } from '@/stores/clientStore';
import type { Client } from '@/mobile/types';
import { z } from 'zod';

// ── Inline new client form schema ─────────────────────────────

const NewClientSchema = z.object({
  name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  nif: z.string().optional(),
  rc: z.string().optional(),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
});

type NewClientFormData = z.infer<typeof NewClientSchema>;

// ── Component ─────────────────────────────────────────────────

interface StepClientSelectionProps {
  selectedClient: Partial<Client> | null;
  onSelect: (client: Client) => void;
  onClear: () => void;
}

export function StepClientSelection({
  selectedClient,
  onSelect,
  onClear,
}: StepClientSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [nifValid, setNifValid] = useState<boolean | null>(null);

  const clients = useClientStore((s) => s.clients);
  const searchClients = useClientStore((s) => s.searchClients);
  const addClient = useClientStore((s) => s.addClient);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewClientFormData>({
    resolver: zodResolver(NewClientSchema),
    defaultValues: {
      name: '',
      nif: '',
      rc: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  // ── Search filtered clients ──
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients.slice(0, 10); // Show recent 10
    return searchClients(searchQuery);
  }, [searchQuery, clients, searchClients]);

  // ── NIF validation on change ──
  const handleNifChange = useCallback((value: string) => {
    if (!value.trim()) {
      setNifValid(null);
      return;
    }
    setNifValid(validateNIF(value));
  }, []);

  // ── Submit new client ──
  const onSubmitNewClient = useCallback(
    (data: NewClientFormData) => {
      const newClient = addClient({
        name: data.name,
        nif: data.nif || undefined,
        rc: data.rc || undefined,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
      });
      onSelect(newClient);
      setShowNewClientForm(false);
      reset();
    },
    [addClient, onSelect, reset],
  );

  // ── Select existing client ──
  const handleSelectClient = useCallback(
    (client: Client) => {
      onSelect(client);
      setSearchQuery('');
    },
    [onSelect],
  );

  return (
    <div className="flex flex-col gap-5 px-5">
      {/* Header */}
      <div>
        <h2
          className="text-lg font-bold text-[var(--sand)]"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Client
        </h2>
        <p className="text-sm text-[var(--sand-muted)] mt-1">
          Sélectionnez ou créez un client
        </p>
      </div>

      {/* Selected client chip */}
      <AnimatePresence>
        {selectedClient?.name && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.25)]"
          >
            <User size={16} className="text-[var(--green-3)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--sand)] truncate">
                {selectedClient.name}
              </p>
              {selectedClient.nif && (
                <p className="text-[10px] text-[var(--sand-muted)]">
                  NIF: {selectedClient.nif}
                </p>
              )}
            </div>
            <button type="button"               onClick={onClear}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--navy-3)] text-[var(--sand-muted)] active:scale-95 transition-transform"
              aria-label="Retirer le client"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un client..."
          className={cn(
            'w-full h-12 pl-10 pr-4 rounded-xl',
            'bg-[var(--navy-2)] border border-[rgba(15,39,71,0.08)]',
            'text-sm text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
            'transition-all duration-200',
          )}
        />
      </div>

      {/* Client list */}
      {filteredClients.length > 0 && !showNewClientForm && (
        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
          {filteredClients.map((client) => (
            <button type="button"               key={client.id}
              onClick={() => handleSelectClient(client)}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl text-left',
                'bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)]',
                'active:scale-[0.98] active:bg-[var(--navy-3)] transition-all',
                'min-h-[56px]',
              )}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--navy-3)] text-[var(--sand-muted)] flex-shrink-0">
                <User size={18} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--sand)] truncate">
                  {client.name}
                </p>
                <p className="text-[11px] text-[var(--sand-muted)] mt-0.5">
                  {client.nif ? `NIF: ${client.nif}` : client.phone}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Nouveau client button / form */}
      {!showNewClientForm ? (
        <button type="button"           onClick={() => setShowNewClientForm(true)}
          className={cn(
            'flex items-center justify-center gap-2 h-12 rounded-xl',
            'border-2 border-dashed border-[rgba(15,39,71,0.12)]',
            'text-sm font-semibold text-[var(--sand-muted)]',
            'active:scale-[0.97] transition-all',
          )}
        >
          <Plus size={18} />
          Nouveau client
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmitNewClient)}
          className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--navy-2)] border border-[rgba(15,39,71,0.08)]"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-[var(--sand)]">Nouveau client</p>
            <button
              type="button"
              onClick={() => { setShowNewClientForm(false); reset(); }}
              className="text-xs text-[var(--sand-muted)] active:opacity-60"
            >
              Annuler
            </button>
          </div>

          {/* Name */}
          <div>
            <input
              {...register('name')}
              placeholder="Nom du client *"
              className={cn(
                'w-full h-11 px-3.5 rounded-xl text-sm',
                'bg-[var(--navy-3)] border text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
                errors.name ? 'border-red-400/50' : 'border-[rgba(15,39,71,0.08)]',
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* NIF with validation badge */}
          <div>
            <div className="relative">
              <input
                {...register('nif')}
                placeholder="NIF (11 ou 15 chiffres)"
                onChange={(e) => {
                  register('nif').onChange(e);
                  handleNifChange(e.target.value);
                }}
                className={cn(
                  'w-full h-11 px-3.5 pr-10 rounded-xl text-sm',
                  'bg-[var(--navy-3)] border text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
                  nifValid === true
                    ? 'border-emerald-400/50'
                    : nifValid === false
                      ? 'border-red-400/50'
                      : 'border-[rgba(15,39,71,0.08)]',
                )}
              />
              {nifValid === true && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </span>
              )}
            </div>
          </div>

          {/* RC */}
          <input
            {...register('rc')}
            placeholder="RC (optionnel)"
            className={cn(
              'w-full h-11 px-3.5 rounded-xl text-sm',
              'bg-[var(--navy-3)] border border-[rgba(15,39,71,0.08)]',
              'text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
            )}
          />

          {/* Phone */}
          <div>
            <input
              {...register('phone')}
              placeholder="Téléphone *"
              className={cn(
                'w-full h-11 px-3.5 rounded-xl text-sm',
                'bg-[var(--navy-3)] border text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
                errors.phone ? 'border-red-400/50' : 'border-[rgba(15,39,71,0.08)]',
              )}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-400 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <input
            {...register('email')}
            placeholder="Email (optionnel)"
            className={cn(
              'w-full h-11 px-3.5 rounded-xl text-sm',
              'bg-[var(--navy-3)] border text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
              errors.email ? 'border-red-400/50' : 'border-[rgba(15,39,71,0.08)]',
            )}
          />

          {/* Submit */}
          <button
            type="submit"
            className={cn(
              'h-11 rounded-xl text-sm font-semibold text-white',
              'active:scale-[0.97] transition-transform',
            )}
            style={{
              background: 'var(--green-2)',
              boxShadow: '0 2px 12px rgba(37,99,235, 0.3)',
            }}
          >
            Sélectionner ce client
          </button>
        </motion.form>
      )}

      {/* Empty state */}
      {!showNewClientForm && filteredClients.length === 0 && (
        <div className="text-center py-6">
          <User size={32} strokeWidth={1.5} className="text-[var(--sand-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--sand-muted)]">
            {searchQuery ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </p>
        </div>
      )}
    </div>
  );
}
