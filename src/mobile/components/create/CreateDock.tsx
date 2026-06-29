'use client';

// ============================================================
// CloudDevis Mobile — FlashFacture: the persistent dock
// One thumb-anchored container that swaps CONTENT (never stacks
// sheet-on-sheet) between four modes: add · line · client · details.
// Every action maps 1:1 onto the document store setters.
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Check, Trash2, ChevronLeft, Search, UserPlus, CornerDownLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateNIF } from '@/lib/dgi';
import { useDocumentStore } from '@/stores/documentStore';
import { useClientStore } from '@/stores/clientStore';
import { DOCUMENT_TYPE_LABELS, UNIT_LABELS } from '@/mobile/types';
import type { DocumentType, Client, UnitMeasure, PaymentMode, Language } from '@/mobile/types';

export type DockMode = 'add' | 'line' | 'client' | 'details';

export interface CatalogItem {
  label: string;
  unitPrice: number;
  unit: UnitMeasure;
  tvaRate: 0 | 9 | 19;
}

const UNIT_OPTIONS = Object.keys(UNIT_LABELS) as UnitMeasure[];
const TVA_OPTIONS: Array<0 | 9 | 19> = [0, 9, 19];
const DOC_TYPES: DocumentType[] = ['DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR'];
const PAYMENT_MODES: Array<{ id: PaymentMode; label: string }> = [
  { id: 'especes', label: 'Espèces' },
  { id: 'cheque', label: 'Chèque' },
  { id: 'virement', label: 'Virement' },
  { id: 'cb', label: 'Carte' },
];
const LANGS: Language[] = ['FR', 'AR', 'EN'];

const inputCls =
  'h-11 px-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] ' +
  'placeholder:text-[var(--sand-muted)] border border-[var(--border)] ' +
  'focus:outline-none focus:border-[var(--green-2)]';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-wide text-[var(--sand-muted)] mb-1.5">{children}</p>;
}

interface CreateDockProps {
  mode: DockMode;
  editingLineId: string | null;
  catalog: CatalogItem[];
  onModeChange: (m: DockMode) => void;
}

export function CreateDock({ mode, editingLineId, catalog, onModeChange }: CreateDockProps) {
  return (
    <div className="bg-[var(--navy-2)] border-t border-[var(--border)] px-3 pt-2.5 pb-2">
      {/* Mode header (back-to-add for non-default modes) */}
      {mode !== 'add' && (
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => onModeChange('add')}
            className="w-9 h-9 -ml-1 rounded-lg flex items-center justify-center text-[var(--sand-muted)] active:scale-95 transition-transform"
            aria-label="Retour aux articles"
          >
            <ChevronLeft size={20} className="rtl:rotate-180" />
          </button>
          <span className="text-sm font-semibold text-[var(--sand)]">
            {mode === 'line' ? "Modifier l'article" : mode === 'client' ? 'Client' : 'Détails du document'}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={mode + (editingLineId ?? '')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {mode === 'add' && <AddMode catalog={catalog} />}
          {mode === 'line' && (
            <LineForm editingLineId={editingLineId} onDone={() => onModeChange('add')} />
          )}
          {mode === 'client' && <ClientMode onDone={() => onModeChange('add')} />}
          {mode === 'details' && <DetailsMode />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── ADD mode: catalog quick-add + inline new-line form ────────
function AddMode({ catalog }: { catalog: CatalogItem[] }) {
  const addItem = useDocumentStore((s) => s.addItem);

  return (
    <div className="flex flex-col gap-2.5">
      {catalog.length > 0 && (
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-0.5 scrollbar-hide">
          {catalog.map((c, i) => (
            <button
              key={`${c.label}-${i}`}
              type="button"
              onClick={() => addItem({ label: c.label, quantity: 1, unit: c.unit, unitPrice: c.unitPrice, tvaRate: c.tvaRate })}
              className="shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-full bg-[var(--navy-3)] border border-[var(--border)] text-xs text-[var(--sand)] active:scale-95 transition-transform"
            >
              <Plus size={13} className="text-[var(--green-2)]" />
              <span className="font-medium">{c.label}</span>
              <span className="text-[var(--sand-muted)]">· {c.unitPrice.toLocaleString('fr-DZ')}</span>
            </button>
          ))}
        </div>
      )}
      <LineForm editingLineId={null} onDone={() => { /* stays in add */ }} />
    </div>
  );
}

// ── Shared line form (used by ADD as new + LINE as edit) ──────
function LineForm({ editingLineId, onDone }: { editingLineId: string | null; onDone: () => void }) {
  const items = useDocumentStore((s) => s.currentDoc.items);
  const addItem = useDocumentStore((s) => s.addItem);
  const updateItem = useDocumentStore((s) => s.updateItem);
  const removeItem = useDocumentStore((s) => s.removeItem);
  const editing = editingLineId ? items.find((i) => i.id === editingLineId) ?? null : null;

  const [label, setLabel] = useState(editing?.label ?? '');
  const [qty, setQty] = useState(String(editing?.quantity ?? 1));
  const [unit, setUnit] = useState<UnitMeasure>(editing?.unit ?? 'u');
  const [price, setPrice] = useState(editing ? String(editing.unitPrice) : '');
  const [tva, setTva] = useState<0 | 9 | 19>(editing?.tvaRate ?? 19);

  const priceNum = parseFloat(price.replace(',', '.')) || 0;
  const qtyNum = parseFloat(qty.replace(',', '.')) || 0;
  const lineTotal = qtyNum * priceNum;
  const canSubmit = label.trim().length > 0 && priceNum > 0 && qtyNum > 0;

  function submit() {
    if (!canSubmit) return;
    const data = { label: label.trim(), quantity: qtyNum, unit, unitPrice: priceNum, tvaRate: tva };
    if (editing) {
      updateItem(editing.id, data);
      onDone();
    } else {
      addItem(data);
      setLabel(''); setQty('1'); setUnit('u'); setPrice(''); setTva(19);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Désignation de l'article"
        className={cn(inputCls, 'w-full')}
      />
      <div className="flex gap-2">
        <input
          type="text" inputMode="decimal" value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Qté"
          className={cn(inputCls, 'w-16 text-center')}
          aria-label="Quantité"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as UnitMeasure)}
          className={cn(inputCls, 'w-[88px] px-2')}
          aria-label="Unité"
        >
          {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
        </select>
        <input
          type="text" inputMode="decimal" value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Prix unitaire"
          className={cn(inputCls, 'flex-1')}
          aria-label="Prix unitaire"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 flex-1">
          {TVA_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTva(r)}
              className={cn(
                'flex-1 h-9 rounded-lg text-xs font-semibold border transition-colors',
                tva === r
                  ? 'bg-[var(--green-2)] border-[var(--green-2)] text-white'
                  : 'bg-[var(--navy-3)] border-[var(--border)] text-[var(--sand-muted)]',
              )}
            >
              {r}%
            </button>
          ))}
        </div>
        {lineTotal > 0 && (
          <span className="text-xs font-semibold text-[var(--sand)] whitespace-nowrap min-w-[64px] text-right">
            {lineTotal.toLocaleString('fr-DZ')} DA
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {editing && (
          <button
            type="button"
            onClick={() => { removeItem(editing.id); onDone(); }}
            className="h-11 px-4 rounded-xl flex items-center justify-center gap-1.5 bg-red-400/10 text-red-400 text-sm font-semibold active:scale-[0.97] transition-transform"
          >
            <Trash2 size={16} /> Supprimer
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={cn(
            'flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white',
            'active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed',
          )}
          style={{ background: 'var(--green-2)' }}
        >
          {editing ? <Check size={16} /> : <CornerDownLeft size={16} />}
          {editing ? 'Enregistrer' : 'Ajouter la ligne'}
        </button>
      </div>
    </div>
  );
}

// ── CLIENT mode: search saved + inline new ────────────────────
function ClientMode({ onDone }: { onDone: () => void }) {
  const clients = useClientStore((s) => s.clients);
  const searchClients = useClientStore((s) => s.searchClients);
  const addClient = useClientStore((s) => s.addClient);
  const setClient = useDocumentStore((s) => s.setClient);

  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', nif: '', rc: '' });

  const list = useMemo(() => (q.trim() ? searchClients(q) : clients.slice(0, 12)), [q, clients, searchClients]);
  const nifState = form.nif.trim() ? validateNIF(form.nif) : null;
  const canCreate = form.name.trim().length >= 2 && form.phone.trim().length >= 8;

  function pick(c: Client) { setClient(c); onDone(); }
  function create() {
    if (!canCreate) return;
    const c = addClient({
      name: form.name.trim(),
      phone: form.phone.trim(),
      nif: form.nif.trim() || undefined,
      rc: form.rc.trim() || undefined,
    });
    setClient(c);
    onDone();
  }

  if (creating) {
    return (
      <div className="flex flex-col gap-2">
        <input className={cn(inputCls, 'w-full')} placeholder="Nom du client *" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className={cn(inputCls, 'w-full')} inputMode="tel" placeholder="Téléphone *" value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <div className="relative">
          <input className={cn(inputCls, 'w-full pr-9')} inputMode="numeric" placeholder="NIF (11 ou 15 chiffres)" value={form.nif}
            onChange={(e) => setForm((f) => ({ ...f, nif: e.target.value }))} />
          {nifState === true && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check size={12} className="text-white" strokeWidth={3} />
            </span>
          )}
        </div>
        <input className={cn(inputCls, 'w-full')} placeholder="RC (optionnel)" value={form.rc}
          onChange={(e) => setForm((f) => ({ ...f, rc: e.target.value }))} />
        <div className="flex gap-2">
          <button type="button" onClick={() => setCreating(false)}
            className="flex-1 h-11 rounded-xl text-sm font-semibold bg-[var(--navy-3)] text-[var(--sand-muted)]">
            Annuler
          </button>
          <button type="button" onClick={create} disabled={!canCreate}
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--green-2)' }}>
            Sélectionner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search size={16} className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]" />
        <input className={cn(inputCls, 'w-full ltr:pl-9 rtl:pr-9')} placeholder="Rechercher un client…" value={q}
          onChange={(e) => setQ(e.target.value)} autoFocus />
      </div>
      <div className="max-h-[176px] overflow-y-auto flex flex-col gap-1.5">
        {list.map((c) => (
          <button key={c.id} type="button" onClick={() => pick(c)}
            className="flex items-center gap-2.5 p-2.5 rounded-xl text-left bg-[var(--navy-3)] active:scale-[0.99] transition-transform min-h-[48px]">
            <span className="w-8 h-8 rounded-full bg-[var(--navy-4)] text-[var(--sand-muted)] flex items-center justify-center text-xs font-semibold shrink-0">
              {(c.name[0] ?? '?').toUpperCase()}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-[var(--sand)] truncate">{c.name}</span>
              <span className="block text-[10px] text-[var(--sand-muted)]">{c.nif ? `NIF ${c.nif}` : c.phone}</span>
            </span>
          </button>
        ))}
        {list.length === 0 && (
          <p className="text-xs text-[var(--sand-muted)] text-center py-3">
            {q ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </p>
        )}
      </div>
      <button type="button" onClick={() => setCreating(true)}
        className="h-11 rounded-xl flex items-center justify-center gap-2 border-2 border-dashed border-[var(--border-2)] text-sm font-semibold text-[var(--sand-muted)] active:scale-[0.98] transition-transform">
        <UserPlus size={16} /> Nouveau client
      </button>
    </div>
  );
}

// ── DETAILS mode: deferred fields, all live ───────────────────
function DetailsMode() {
  const doc = useDocumentStore((s) => s.currentDoc);
  const setType = useDocumentStore((s) => s.setType);
  const setPaymentMode = useDocumentStore((s) => s.setPaymentMode);
  const setAcompte = useDocumentStore((s) => s.setAcompte);
  const setValidUntil = useDocumentStore((s) => s.setValidUntil);
  const setLanguage = useDocumentStore((s) => s.setLanguage);
  const setNotes = useDocumentStore((s) => s.setNotes);

  const [acompte, setAcompteLocal] = useState(doc.acompte ? String(doc.acompte) : '');
  useEffect(() => { setAcompte(parseFloat(acompte.replace(',', '.')) || 0); }, [acompte, setAcompte]);

  const chip = (active: boolean) => cn(
    'px-3 h-9 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap',
    active ? 'bg-[var(--green-2)] border-[var(--green-2)] text-white'
           : 'bg-[var(--navy-3)] border-[var(--border)] text-[var(--sand-muted)]',
  );

  return (
    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pb-1">
      <div>
        <FieldLabel>Type de document</FieldLabel>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {DOC_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={chip(doc.type === t)}>
              {DOCUMENT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Mode de paiement</FieldLabel>
        <div className="flex gap-1.5 flex-wrap">
          {PAYMENT_MODES.map((p) => (
            <button key={p.id} type="button" onClick={() => setPaymentMode(p.id)} className={chip(doc.paymentMode === p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <FieldLabel>Acompte (DA)</FieldLabel>
          <input className={cn(inputCls, 'w-full')} inputMode="decimal" placeholder="0" value={acompte}
            onChange={(e) => setAcompteLocal(e.target.value)} />
        </div>
        <div className="flex-1">
          <FieldLabel>Valable jusqu&apos;au</FieldLabel>
          <input className={cn(inputCls, 'w-full')} type="date" value={doc.validUntil ?? ''}
            onChange={(e) => setValidUntil(e.target.value || undefined)} />
        </div>
      </div>
      <div>
        <FieldLabel>Langue</FieldLabel>
        <div className="flex gap-1.5">
          {LANGS.map((l) => (
            <button key={l} type="button" onClick={() => setLanguage(l)} className={chip(doc.language === l)}>
              {l === 'FR' ? 'Français' : l === 'AR' ? 'العربية' : 'English'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Notes</FieldLabel>
        <textarea
          className={cn(inputCls, 'w-full h-auto py-2 min-h-[60px] resize-none')}
          placeholder="Conditions, remarques…"
          value={doc.notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
