'use client';

// ============================================================
// Rakmana Mobile — FlashFacture: the persistent dock
// Four modes: add · line · client · details.
// "details" mode uses an accordion (Section) to avoid a giant
// flat scroll — each category collapses/expands with haptics.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Check, Trash2, ChevronLeft, ChevronDown, Search, UserPlus, CornerDownLeft,
  FileText, AlignLeft, CreditCard, Truck, MessageSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateNIF } from '@/lib/dgi';
import { hapticLight, hapticSuccess, hapticWarning } from '@/mobile/lib/haptics';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useDocumentStore } from '@/stores/documentStore';
import { useClientStore } from '@/stores/clientStore';
import { useUserStore } from '@/stores/userStore';
import { DOCUMENT_TYPE_LABELS, UNIT_LABELS } from '@/mobile/types';
import { getCategoryOptions } from '@/types/index';
import type { DocumentType as WebDocType } from '@/types/index';
import type { DocumentType, Client, UnitMeasure, PaymentMode, Language } from '@/mobile/types';

const toWebType = (t: DocumentType): WebDocType =>
  t.toLowerCase() as WebDocType;

const CATEGORY_LABEL: Record<string, string> = {
  '': '— Sans catégorie —',
  preparation: 'Préparation', peinture: 'Peinture', finition: 'Finition',
  revetement: 'Revêtement sol', facade: 'Façade', enduit: 'Enduit',
  main_oeuvre: "Main-d'œuvre", materiaux: 'Matériaux', transport: 'Transport',
  divers: 'Divers', services: 'Services', prestation: 'Prestation',
  equipement: 'Équipement', outillage: 'Outillage',
  diagnostic: 'Diagnostic', reparation: 'Réparation', pieces: 'Pièces',
};

export type DockMode = 'add' | 'line' | 'client' | 'details';

export interface CatalogItem {
  label: string;
  unitPrice: number;
  unit: UnitMeasure;
  tvaRate: 0 | 9 | 19;
}

const UNIT_OPTIONS = Object.keys(UNIT_LABELS) as UnitMeasure[];
const TVA_OPTIONS: Array<0 | 9 | 19> = [0, 9, 19];
const DOC_TYPES: DocumentType[] = ['DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR', 'BL'];
const PAYMENT_MODES: Array<{ id: PaymentMode; label: string }> = [
  { id: 'especes', label: 'Espèces' },
  { id: 'cheque', label: 'Chèque' },
  { id: 'virement', label: 'Virement' },
  { id: 'cb', label: 'Carte' },
];
const LANGS: Language[] = ['FR', 'AR', 'EN'];
const TEMPLATES: Array<[string, string]> = [
  ['classic', 'Classique'], ['haussmann', 'Haussmann'], ['nordic', 'Nordic'],
  ['velours', 'Velours'], ['industrielle', 'Industrielle'],
];

const inputCls =
  'h-11 px-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] ' +
  'placeholder:text-[var(--sand-muted)] border border-[var(--border)] ' +
  'focus:outline-none focus:border-[var(--green-2)]';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-wide text-[var(--sand-muted)] mb-1.5">{children}</p>;
}

// ── Accordion section ─────────────────────────────────────────
function Section({
  title, icon: Icon, isOpen, onToggle, children,
}: {
  title: string; icon: LucideIcon; isOpen: boolean;
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        type="button"
        onClick={() => { hapticLight(); onToggle(); }}
        className="w-full flex items-center gap-2.5 py-3 active:opacity-70 transition-opacity"
      >
        <span className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
          isOpen ? 'bg-[var(--blue-bg)]' : 'bg-[var(--navy-3)]',
        )}>
          <Icon size={14} className={isOpen ? 'text-[var(--green-2)]' : 'text-[var(--sand-muted)]'} />
        </span>
        <span className={cn(
          'flex-1 text-left text-sm font-semibold transition-colors',
          isOpen ? 'text-[var(--sand)]' : 'text-[var(--sand-muted)]',
        )}>
          {title}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'text-[var(--sand-muted)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-3 flex flex-col gap-2.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CreateDockProps {
  mode: DockMode;
  editingLineId: string | null;
  catalog: CatalogItem[];
  onModeChange: (m: DockMode) => void;
}

export function CreateDock({ mode, editingLineId, catalog, onModeChange }: CreateDockProps) {
  const { t } = useMobileI18n();
  return (
    <div className="bg-[var(--navy-2)] border-t border-[var(--border)] px-3 pt-2.5 pb-2">
      {/* Mode header */}
      {mode !== 'add' && (
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => onModeChange('add')}
            className="w-9 h-9 -ml-1 rounded-lg flex items-center justify-center text-[var(--sand-muted)] active:scale-95 transition-transform"
            aria-label={t('editor.close')}
          >
            <ChevronLeft size={20} className="rtl:rotate-180" />
          </button>
          <span className="text-sm font-semibold text-[var(--sand)]">
            {mode === 'line' ? t('editor.editLine') : mode === 'client' ? t('editor.client') : t('editor.docDetails')}
          </span>
        </div>
      )}

      <motion.div
        key={mode + (editingLineId ?? '')}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {mode === 'add' && <AddMode catalog={catalog} />}
        {mode === 'line' && (
          <LineForm editingLineId={editingLineId} onDone={() => onModeChange('add')} />
        )}
        {mode === 'client' && <ClientMode onDone={() => onModeChange('add')} />}
        {mode === 'details' && <DetailsMode />}
      </motion.div>
    </div>
  );
}

// ── ADD mode ──────────────────────────────────────────────────
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
              onClick={() => {
                hapticLight();
                addItem({ label: c.label, quantity: 1, unit: c.unit, unitPrice: c.unitPrice, tvaRate: c.tvaRate });
              }}
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

// ── Line form (new + edit) ────────────────────────────────────
function LineForm({ editingLineId, onDone }: { editingLineId: string | null; onDone: () => void }) {
  const { t } = useMobileI18n();
  const items = useDocumentStore((s) => s.currentDoc.items);
  const docType = useDocumentStore((s) => s.currentDoc.type);
  const addItem = useDocumentStore((s) => s.addItem);
  const updateItem = useDocumentStore((s) => s.updateItem);
  const removeItem = useDocumentStore((s) => s.removeItem);
  const editing = editingLineId ? items.find((i) => i.id === editingLineId) ?? null : null;

  const [code, setCode] = useState(editing?.code ?? '');
  const [label, setLabel] = useState(editing?.label ?? '');
  const [qty, setQty] = useState(String(editing?.quantity ?? 1));
  const [unit, setUnit] = useState<UnitMeasure>(editing?.unit ?? 'u');
  const [price, setPrice] = useState(editing ? String(editing.unitPrice) : '');
  const [tva, setTva] = useState<0 | 9 | 19>(editing?.tvaRate ?? 19);
  const [remise, setRemise] = useState(editing?.remise ? String(editing.remise) : '');
  const [category, setCategory] = useState(editing?.category ?? '');
  const [moreOpen, setMoreOpen] = useState(!!editing?.category || !!editing?.code);

  const categoryOptions = useMemo(() => getCategoryOptions(toWebType(docType)), [docType]);

  const priceNum = parseFloat(price.replace(',', '.')) || 0;
  const qtyNum = parseFloat(qty.replace(',', '.')) || 0;
  const remiseNum = Math.min(100, Math.max(0, parseFloat(remise.replace(',', '.')) || 0));
  const lineTotal = qtyNum * priceNum * (1 - remiseNum / 100);
  const canSubmit = label.trim().length > 0 && priceNum > 0 && qtyNum > 0;

  function submit() {
    if (!canSubmit) return;
    const data = {
      code: code.trim() || undefined,
      label: label.trim(),
      quantity: qtyNum,
      unit,
      unitPrice: priceNum,
      tvaRate: tva,
      remise: remiseNum || undefined,
      category: category || undefined,
    };
    if (editing) {
      hapticSuccess();
      updateItem(editing.id, data);
      onDone();
    } else {
      hapticSuccess();
      addItem(data);
      setCode(''); setLabel(''); setQty('1'); setUnit('u'); setPrice(''); setTva(19); setRemise(''); setCategory('');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Designation — always visible */}
      <input
        type="text" value={label} onChange={(e) => setLabel(e.target.value)}
        placeholder={t('editor.designation')} className={cn(inputCls, 'w-full')}
      />
      <div className="flex gap-2">
        <input
          type="text" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)}
          placeholder={t('editor.qty')} className={cn(inputCls, 'w-16 text-center')} aria-label={t('editor.qty')}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value as UnitMeasure)}
          className={cn(inputCls, 'w-[88px] px-2')} aria-label="Unité">
          {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
        </select>
        <input
          type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)}
          placeholder={t('editor.unitPrice')} className={cn(inputCls, 'flex-1')} aria-label={t('editor.unitPrice')}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 flex-1">
          {TVA_OPTIONS.map((r) => (
            <button key={r} type="button" onClick={() => setTva(r)}
              className={cn(
                'flex-1 h-9 rounded-lg text-xs font-semibold border transition-colors',
                tva === r
                  ? 'bg-[var(--green-2)] border-[var(--green-2)] text-white'
                  : 'bg-[var(--navy-3)] border-[var(--border)] text-[var(--sand-muted)]',
              )}>
              {r}%
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text" inputMode="decimal" value={remise} onChange={(e) => setRemise(e.target.value)}
            placeholder={t('editor.discount')} className={cn(inputCls, 'w-[88px] h-9 pr-6 text-center')}
            aria-label={t('editor.discount')}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--sand-muted)]">%</span>
        </div>
      </div>

      {/* Collapsible: Category + Code */}
      <button type="button" onClick={() => setMoreOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--green-2)] active:opacity-70 transition-opacity self-start">
        <ChevronDown size={14} className={cn('transition-transform duration-150', moreOpen && 'rotate-180')} />
        {moreOpen ? t('editor.lessFields') : t('editor.categoryCode')}
      </button>
      <AnimatePresence initial={false}>
        {moreOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
            className="overflow-hidden flex flex-col gap-2"
          >
            <div>
              <FieldLabel>{t('editor.category')}</FieldLabel>
              <div className="flex gap-1.5 flex-wrap">
                {categoryOptions.map((c) => (
                  <button key={c.value} type="button" onClick={() => { hapticLight(); setCategory(c.value); }}
                    className={cn(
                      'px-2.5 h-8 rounded-lg text-[11px] font-semibold border transition-colors',
                      category === c.value
                        ? 'bg-[var(--green-2)] border-[var(--green-2)] text-white'
                        : 'bg-[var(--navy-3)] border-[var(--border)] text-[var(--sand-muted)]',
                    )}>
                    {CATEGORY_LABEL[c.value] ?? c.value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{t('editor.articleCode')}</FieldLabel>
              <input
                type="text" value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="Ex : DEM-COM" className={cn(inputCls, 'w-full')} aria-label={t('editor.articleCode')}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {lineTotal > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-[var(--sand-muted)]">{t('editor.lineTotal')}{remiseNum > 0 ? ` (−${remiseNum}%)` : ''}</span>
          <span className="font-semibold text-[var(--sand)]">{lineTotal.toLocaleString('fr-DZ')} DA</span>
        </div>
      )}
      <div className="flex gap-2">
        {editing && (
          <button type="button"
            onClick={() => { hapticWarning(); removeItem(editing.id); onDone(); }}
            className="h-11 px-4 rounded-xl flex items-center justify-center gap-1.5 bg-red-400/10 text-red-400 text-sm font-semibold active:scale-[0.97] transition-transform">
            <Trash2 size={16} /> {t('editor.deleteLine')}
          </button>
        )}
        <button type="button" onClick={submit} disabled={!canSubmit}
          className={cn(
            'flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white',
            'active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed',
          )}
          style={{ background: 'var(--green-2)' }}>
          {editing ? <Check size={16} /> : <CornerDownLeft size={16} />}
          {editing ? t('editor.saveLine') : t('editor.addLine')}
        </button>
      </div>
    </div>
  );
}

// ── CLIENT mode ───────────────────────────────────────────────
function ClientMode({ onDone }: { onDone: () => void }) {
  const { t } = useMobileI18n();
  const clients = useClientStore((s) => s.clients);
  const searchClients = useClientStore((s) => s.searchClients);
  const addClient = useClientStore((s) => s.addClient);
  const setClient = useDocumentStore((s) => s.setClient);

  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [moreFields, setMoreFields] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', nif: '', rc: '', nis: '', ai: '', address: '',
  });

  const list = useMemo(() => (q.trim() ? searchClients(q) : clients.slice(0, 12)), [q, clients, searchClients]);
  const nifState = form.nif.trim() ? validateNIF(form.nif) : null;
  const canCreate = form.name.trim().length >= 2 && form.phone.trim().length >= 8;

  function pick(c: Client) { hapticLight(); setClient(c); onDone(); }
  function create() {
    if (!canCreate) return;
    const c = addClient({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      nif: form.nif.trim() || undefined,
      rc: form.rc.trim() || undefined,
      nis: form.nis.trim() || undefined,
      ai: form.ai.trim() || undefined,
      address: form.address.trim() || undefined,
    });
    hapticSuccess();
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
        {moreFields ? (
          <>
            <input className={cn(inputCls, 'w-full')} inputMode="email" placeholder="Email (optionnel)"
              value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <div className="relative">
              <input className={cn(inputCls, 'w-full pr-9')} inputMode="numeric"
                placeholder="NIF (11 chiffres)" value={form.nif}
                onChange={(e) => setForm((f) => ({ ...f, nif: e.target.value }))} />
              {nifState === true && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input className={cn(inputCls, 'w-full')} placeholder="RC"
                value={form.rc} onChange={(e) => setForm((f) => ({ ...f, rc: e.target.value }))} />
              <input className={cn(inputCls, 'w-full')} inputMode="numeric" placeholder="NIS"
                value={form.nis} onChange={(e) => setForm((f) => ({ ...f, nis: e.target.value }))} />
              <input className={cn(inputCls, 'w-full')} inputMode="numeric" placeholder="AI"
                value={form.ai} onChange={(e) => setForm((f) => ({ ...f, ai: e.target.value }))} />
            </div>
            <input className={cn(inputCls, 'w-full')} placeholder="Adresse (optionnel)"
              value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </>
        ) : (
          <button type="button" onClick={() => setMoreFields(true)}
            className="h-9 rounded-lg text-xs font-semibold text-[var(--green-2)] bg-[var(--blue-bg)] active:scale-[0.98] transition-transform">
            + Détails (email, NIF, RC, adresse…)
          </button>
        )}
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
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--sand-muted)]">{t('editor.forWho')} 👤</p>
        <button type="button" onClick={onDone}
          className="text-[11px] font-semibold text-[var(--sand-muted)] px-2 py-1 active:opacity-70">
          {t('editor.skip')}
        </button>
      </div>
      <div className="relative">
        <Search size={16} className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]" />
        <input className={cn(inputCls, 'w-full ltr:pl-9 rtl:pr-9')} placeholder={t('editor.searchClient')}
          value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
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
            {q ? t('editor.noClient') : t('editor.noClientRegistered')}
          </p>
        )}
      </div>
      <button type="button" onClick={() => setCreating(true)}
        className="h-11 rounded-xl flex items-center justify-center gap-2 border-2 border-dashed border-[var(--border-2)] text-sm font-semibold text-[var(--sand-muted)] active:scale-[0.98] transition-transform">
        <UserPlus size={16} /> {t('editor.newClient')}
      </button>
    </div>
  );
}

// ── DETAILS mode: accordion categories ───────────────────────
function DetailsMode() {
  const { t } = useMobileI18n();
  const doc = useDocumentStore((s) => s.currentDoc);
  const setType = useDocumentStore((s) => s.setType);
  const setPaymentMode = useDocumentStore((s) => s.setPaymentMode);
  const setAcompte = useDocumentStore((s) => s.setAcompte);
  const setValidUntil = useDocumentStore((s) => s.setValidUntil);
  const setLanguage = useDocumentStore((s) => s.setLanguage);
  const setNotes = useDocumentStore((s) => s.setNotes);
  const setObjet = useDocumentStore((s) => s.setObjet);
  const setReference = useDocumentStore((s) => s.setReference);
  const setTemplate = useDocumentStore((s) => s.setTemplate);
  const updateDelivery = useDocumentStore((s) => s.updateDelivery);
  const userMode = useUserStore((s) => s.mode);

  // Start with "document" open; user opens others on demand
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(['document']));
  const toggle = useCallback((id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const [acompte, setAcompteLocal] = useState(doc.acompte ? String(doc.acompte) : '');
  useEffect(() => { setAcompte(parseFloat(acompte.replace(',', '.')) || 0); }, [acompte, setAcompte]);

  const isBL = doc.type === 'BL';

  const [showAllTypes, setShowAllTypes] = useState(false);
  const typesCollapsed = userMode === 'artisan' && !showAllTypes && !['BC', 'BR', 'BL'].includes(doc.type);
  const visibleTypes: DocumentType[] = typesCollapsed ? ['DEVIS', 'FACTURE', 'PROFORMA'] : DOC_TYPES;

  const chip = (active: boolean) => cn(
    'px-3 h-9 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap',
    active
      ? 'bg-[var(--green-2)] border-[var(--green-2)] text-white'
      : 'bg-[var(--navy-3)] border-[var(--border)] text-[var(--sand-muted)]',
  );

  return (
    <div className="max-h-[420px] overflow-y-auto -mx-3 px-3 pb-1">

      {/* ① Type de document */}
      <Section title={t('editor.docType')} icon={FileText}
        isOpen={openSections.has('document')} onToggle={() => toggle('document')}>
        <div>
          <FieldLabel>{t('editor.format')}</FieldLabel>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {visibleTypes.map((t) => (
              <button key={t} type="button" onClick={() => setType(t)} className={chip(doc.type === t)}>
                {DOCUMENT_TYPE_LABELS[t]}
              </button>
            ))}
            {typesCollapsed && (
              <button type="button" onClick={() => setShowAllTypes(true)} className={cn(chip(false), 'border-dashed')}>
                + Plus
              </button>
            )}
          </div>
        </div>
        <div>
          <FieldLabel>{t('editor.language')}</FieldLabel>
          <div className="flex gap-1.5">
            {LANGS.map((l) => (
              <button key={l} type="button" onClick={() => setLanguage(l)} className={chip(doc.language === l)}>
                {l === 'FR' ? 'Français' : l === 'AR' ? 'العربية' : 'English'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>{t('editor.pdfTemplate')}</FieldLabel>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {TEMPLATES.map(([id, label]) => (
              <button key={id} type="button"
                onClick={() => { hapticLight(); setTemplate(id); }}
                className={chip((doc.template ?? 'classic') === id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ② Contenu */}
      <Section title={t('editor.content')} icon={AlignLeft}
        isOpen={openSections.has('contenu')} onToggle={() => toggle('contenu')}>
        <div>
          <FieldLabel>{t('editor.objet')}</FieldLabel>
          <textarea
            className={cn(inputCls, 'w-full h-auto py-2 min-h-[48px] resize-none')}
            placeholder="Ex : Réparation et remise en état d'un appareil…"
            value={doc.objet}
            onChange={(e) => setObjet(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>{t('editor.reference')}</FieldLabel>
          <input className={cn(inputCls, 'w-full')} placeholder="Ex : BC N° 15/2024 du 07/03/2024"
            value={doc.reference} onChange={(e) => setReference(e.target.value)} />
        </div>
        <div>
          <FieldLabel>{t('editor.validUntil')}</FieldLabel>
          <input className={cn(inputCls, 'w-full')} type="date" value={doc.validUntil ?? ''}
            onChange={(e) => setValidUntil(e.target.value || undefined)} />
        </div>
      </Section>

      {/* ③ Paiement (non-BL) */}
      {!isBL && (
        <Section title={t('editor.payment')} icon={CreditCard}
          isOpen={openSections.has('paiement')} onToggle={() => toggle('paiement')}>
          <div>
            <FieldLabel>{t('editor.paymentMode')}</FieldLabel>
            <div className="flex gap-1.5 flex-wrap">
              {PAYMENT_MODES.map((p) => (
                <button key={p.id} type="button" onClick={() => setPaymentMode(p.id)} className={chip(doc.paymentMode === p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>{t('editor.acompte')}</FieldLabel>
            <input className={cn(inputCls, 'w-full')} inputMode="decimal" placeholder="0"
              value={acompte} onChange={(e) => setAcompteLocal(e.target.value)} />
          </div>
        </Section>
      )}

      {/* ④ Livraison (BL only) */}
      {isBL && (
        <Section title={t('editor.delivery')} icon={Truck}
          isOpen={openSections.has('livraison')} onToggle={() => toggle('livraison')}>
          <div className="flex gap-2">
            <input className={cn(inputCls, 'flex-1')} placeholder={t('editor.deliverer')}
              value={doc.delivererName ?? ''} onChange={(e) => updateDelivery({ delivererName: e.target.value })} />
            <input className={cn(inputCls, 'flex-1')} placeholder={t('editor.idCard')}
              value={doc.delivererIdCard ?? ''} onChange={(e) => updateDelivery({ delivererIdCard: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <input className={cn(inputCls, 'flex-1')} placeholder={t('editor.transporter')}
              value={doc.transporterName ?? ''} onChange={(e) => updateDelivery({ transporterName: e.target.value })} />
            <input className={cn(inputCls, 'flex-1')} placeholder={t('editor.idCard')}
              value={doc.transporterIdCard ?? ''} onChange={(e) => updateDelivery({ transporterIdCard: e.target.value })} />
          </div>
          <div>
            <FieldLabel>{t('editor.deliveryAddress')}</FieldLabel>
            <input className={cn(inputCls, 'w-full')} placeholder={t('editor.deliveryAddress')}
              value={doc.deliveryAddress ?? ''} onChange={(e) => updateDelivery({ deliveryAddress: e.target.value })} />
          </div>
        </Section>
      )}

      {/* ⑤ Notes */}
      <Section title={t('editor.notes')} icon={MessageSquare}
        isOpen={openSections.has('notes')} onToggle={() => toggle('notes')}>
        <textarea
          className={cn(inputCls, 'w-full h-auto py-2 min-h-[60px] resize-none')}
          placeholder="Conditions de paiement, remarques…"
          value={doc.notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Section>
    </div>
  );
}
