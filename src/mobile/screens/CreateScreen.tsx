'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, Plus, Trash2, ChevronDown, ChevronUp,
  Eye, FileText, Search, X, PenLine,
  FileCheck, Building, Palette, CreditCard, Shield, Truck,
  MapPin, Package, Stamp, ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { fetchAllClients, type ApiClientRecord } from '@/mobile/lib/api';
import type { LineItem, DocumentType, Client, Company } from '@/mobile/types';

// ── localStorage product catalog ───────────────────────────────

const CATALOG_KEY = 'rakmana_product_catalog';
const MAX_CATALOG = 80;

function getCatalog(): string[] {
  try { return JSON.parse(localStorage.getItem(CATALOG_KEY) || '[]'); } catch { return []; }
}

function saveToCatalog(label: string) {
  if (!label.trim()) return;
  const catalog = getCatalog().filter((p) => p.toLowerCase() !== label.toLowerCase());
  catalog.unshift(label.trim());
  if (catalog.length > MAX_CATALOG) catalog.length = MAX_CATALOG;
  try { localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog)); } catch {}
}

function searchCatalog(query: string): string[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getCatalog().filter((p) => p.toLowerCase().includes(q)).slice(0, 6);
}

// ── Types ──────────────────────────────────────────────────────

interface CreateScreenProps {
  onExit: () => void;
  editingDocId?: string;
  onConfigureCompany?: () => void;
}

type DocColor = { bg: string; text: string; border: string; light: string };
const TYPE_COLORS: Record<string, DocColor> = {
  DEVIS: { bg: 'bg-[#16A34A]', text: 'text-[#16A34A]', border: 'border-[#16A34A]', light: 'bg-[#16A34A]/8' },
  FACTURE: { bg: 'bg-[#0052CC]', text: 'text-[#0052CC]', border: 'border-[#0052CC]', light: 'bg-[#0052CC]/8' },
  PROFORMA: { bg: 'bg-[#EA580C]', text: 'text-[#EA580C]', border: 'border-[#EA580C]', light: 'bg-[#EA580C]/8' },
};

// ── Section → Document Type mapping ────────────────────────────

type SectionId = 'general' | 'complement' | 'design' | 'paiement' | 'garanties' | 'signature' | 'remise' | 'livraison' | 'chantier' | 'materiaux';

const DOC_TYPE_SECTIONS: Record<string, SectionId[]> = {
  DEVIS:    ['general', 'complement', 'paiement', 'garanties', 'signature'],
  FACTURE:  ['general', 'complement', 'paiement', 'garanties', 'signature'],
  PROFORMA: ['general', 'complement', 'paiement', 'remise'],
  BC:       ['general', 'complement'],
  BR:       ['general', 'complement', 'materiaux'],
  BL:       ['general', 'complement', 'livraison'],
};

const SECTION_META: Record<SectionId, { icon: React.ElementType; color: string; colorBg: string }> = {
  general:   { icon: ClipboardList, color: 'text-[#0052CC]', colorBg: 'bg-[#0052CC]/8' },
  complement:{ icon: Building,      color: 'text-[#7C3AED]', colorBg: 'bg-[#7C3AED]/8' },
  design:    { icon: Palette,       color: 'text-[#D4A843]', colorBg: 'bg-[#D4A843]/8' },
  paiement:  { icon: CreditCard,    color: 'text-[#16A34A]', colorBg: 'bg-[#16A34A]/8' },
  garanties: { icon: Shield,        color: 'text-[#0891B2]', colorBg: 'bg-[#0891B2]/8' },
  signature: { icon: PenLine,       color: 'text-[#001A4D]', colorBg: 'bg-[#001A4D]/8' },
  remise:    { icon: Stamp,         color: 'text-[#EA580C]', colorBg: 'bg-[#EA580C]/8' },
  livraison: { icon: Truck,         color: 'text-[#16A34A]', colorBg: 'bg-[#16A34A]/8' },
  chantier:  { icon: MapPin,        color: 'text-[#DC3545]', colorBg: 'bg-[#DC3545]/8' },
  materiaux: { icon: Package,       color: 'text-[#7C3AED]', colorBg: 'bg-[#7C3AED]/8' },
};

// ── Document Preview (HTML) ────────────────────────────────────

function DocumentPreview({
  docType, clientName, clientNif, items, totalHT, totalTVA, totalTTC, notes,
}: {
  docType: DocumentType; clientName: string; clientNif: string;
  items: Partial<LineItem>[]; totalHT: number; totalTVA: number; totalTTC: number; notes: string;
}) {
  const tc = TYPE_COLORS[docType] || TYPE_COLORS.FACTURE;
  return (
    <div className="bg-white rounded-2xl border border-[rgba(0,26,77,0.06)] p-4 space-y-3 text-[11px]">
      <div className="flex items-center justify-between border-b border-[rgba(0,26,77,0.06)] pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0052CC] text-white"><FileText size={14} /></div>
          <div>
            <div className="font-extrabold text-[#001A4D] text-sm">Rakmana</div>
            <div className="text-[9px] text-[#718096]">DGI Algeria</div>
          </div>
        </div>
        <div className={cn('px-2.5 py-1 rounded-full text-[9px] font-bold text-white', tc.bg)}>{docType}</div>
      </div>
      <div className="flex justify-between">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-[#718096] font-bold mb-0.5">Client</div>
          <div className="font-bold text-[#001A4D]">{clientName || '—'}</div>
          {clientNif && <div className="text-[9px] text-[#718096]">NIF: {clientNif}</div>}
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-[#718096] font-bold mb-0.5">Date</div>
          <div className="text-[#001A4D]">{new Date().toLocaleDateString('fr-FR')}</div>
        </div>
      </div>
      <div className="border border-[rgba(0,26,77,0.06)] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_40px_55px_60px] gap-0 bg-[#F0F4FF] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider text-[#718096]">
          <span>Désignation</span><span className="text-center">Qté</span><span className="text-right">Prix U.</span><span className="text-right">Total</span>
        </div>
        {items.filter((it) => it.label).map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_40px_55px_60px] gap-0 px-2.5 py-1.5 border-t border-[rgba(0,26,77,0.04)]">
            <span className="text-[#001A4D] font-medium truncate">{item.label}</span>
            <span className="text-center text-[#4A5568]">{item.quantity}</span>
            <span className="text-right text-[#4A5568]" style={{ fontVariantNumeric: 'tabular-nums' }}>{(item.unitPrice || 0).toLocaleString('fr-DZ')}</span>
            <span className="text-right font-bold text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{(item.totalHT || 0).toLocaleString('fr-DZ')}</span>
          </div>
        ))}
        {items.every((it) => !it.label) && <div className="px-2.5 py-3 text-center text-[9px] text-[#718096]">Aucun article</div>}
      </div>
      <div className="space-y-1 text-right">
        <div className="flex justify-between"><span className="text-[#718096]">Total HT</span><span className="text-[#001A4D] font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalHT.toLocaleString('fr-DZ')} DA</span></div>
        <div className="flex justify-between"><span className="text-[#718096]">TVA</span><span className="text-[#001A4D] font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTVA.toLocaleString('fr-DZ')} DA</span></div>
        <div className="h-px bg-[rgba(0,26,77,0.06)]" />
        <div className="flex justify-between text-sm"><span className="font-extrabold text-[#001A4D]">Total TTC</span><span className={cn('font-extrabold', tc.text)} style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTTC.toLocaleString('fr-DZ')} DA</span></div>
      </div>
      {notes && <div className="border-t border-[rgba(0,26,77,0.06)] pt-2"><div className="text-[9px] uppercase tracking-wider text-[#718096] font-bold mb-0.5">Notes</div><div className="text-[#4A5568]">{notes}</div></div>}
    </div>
  );
}

// ── Article Row (Collapsible) ──────────────────────────────────

function ArticleRow({
  item, idx, total, canDelete, onUpdate, onRemove,
  catalogSuggestions, onCatalogSelect,
}: {
  item: Partial<LineItem>; idx: number; total: number; canDelete: boolean;
  onUpdate: (field: string, value: string | number) => void;
  onRemove: () => void;
  catalogSuggestions: string[];
  onCatalogSelect: (label: string) => void;
}) {
  const [expanded, setExpanded] = useState(!item.label);
  const [showCatalog, setShowCatalog] = useState(false);
  const inputCls = 'w-full rounded-xl border border-[rgba(0,26,77,0.06)] bg-[#F0F4FF] px-2.5 py-1.5 text-[11px] text-[#001A4D] placeholder-[#718096] focus:border-[#0052CC] focus:outline-none focus:ring-1 focus:ring-[#0052CC]/15 transition-all duration-150';
  const labelCls = 'text-[9px] font-bold text-[#718096] mb-0.5 block';

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-[rgba(0,26,77,0.06)] bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none" onClick={() => setExpanded((v) => !v)}>
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0052CC]/8 text-[#0052CC] text-[10px] font-bold shrink-0">{idx + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-[#001A4D] truncate">{item.label || 'Nouvel article'}</div>
          {!expanded && item.label && <div className="text-[9px] text-[#718096]" style={{ fontVariantNumeric: 'tabular-nums' }}>{item.quantity || 1} × {(item.unitPrice || 0).toLocaleString('fr-DZ')} = {total.toLocaleString('fr-DZ')} DA</div>}
        </div>
        {canDelete && <button onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label="Supprimer" className="flex h-6 w-6 items-center justify-center rounded-lg text-[#DC3545]/60 hover:text-[#DC3545] hover:bg-[#DC3545]/8 transition-all duration-150"><Trash2 size={12} /></button>}
        <div className="text-[#718096] shrink-0">{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2 border-t border-[rgba(0,26,77,0.04)]">
              <div className="pt-2 relative">
                <label className={labelCls}>Désignation</label>
                <input value={item.label || ''} onChange={(e) => { onUpdate('label', e.target.value); setShowCatalog(true); }} onFocus={() => setShowCatalog(true)} onBlur={() => setTimeout(() => setShowCatalog(false), 150)} placeholder="Nom du produit/service" className={inputCls} />
                {showCatalog && catalogSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-0.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white py-1 shadow-lg">
                    {catalogSuggestions.map((s) => (<button key={s} onMouseDown={(e) => { e.preventDefault(); onCatalogSelect(s); setShowCatalog(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-[#001A4D] hover:bg-[#E6F0FF] transition-colors duration-100"><Search size={10} className="text-[#718096]" />{s}</button>))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>Qté</label><input type="number" value={item.quantity || 1} onChange={(e) => onUpdate('quantity', Number(e.target.value))} className={cn(inputCls, 'text-center')} dir="ltr" /></div>
                <div><label className={labelCls}>Prix unitaire (DA)</label><input type="number" value={item.unitPrice || 0} onChange={(e) => onUpdate('unitPrice', Number(e.target.value))} className={cn(inputCls, 'text-right')} dir="ltr" style={{ fontVariantNumeric: 'tabular-nums' }} /></div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#F0F4FF] px-3 py-1.5">
                <span className="text-[9px] font-bold text-[#718096]">Total ligne</span>
                <span className="text-[11px] font-extrabold text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{total.toLocaleString('fr-DZ')} DA</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Collapsible Section Component ──────────────────────────────

function EditorSection({
  id, titleKey, icon: Icon, color, colorBg, children,
}: {
  id: string; titleKey: string; icon: React.ElementType; color: string; colorBg: string; children: React.ReactNode;
}) {
  const { t } = useMobileI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[rgba(0,26,77,0.06)] bg-white overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2.5 px-3 py-3 text-left">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg shrink-0', colorBg, color)}>
          <Icon size={14} />
        </div>
        <span className="flex-1 text-[11px] font-bold text-[#001A4D]">{t(titleKey as any)}</span>
        <div className="text-[#718096] shrink-0">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2.5 border-t border-[rgba(0,26,77,0.04)] pt-2.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main CreateScreen ──────────────────────────────────────────

export function CreateScreen({ onExit, editingDocId, onConfigureCompany }: CreateScreenProps) {
  const { t } = useMobileI18n();

  // ── State ──
  const [docType, setDocType] = useState<DocumentType>('FACTURE');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ApiClientRecord | null>(null);
  const [clientNif, setClientNif] = useState('');
  const [items, setItems] = useState<Partial<LineItem>[]>([
    { label: '', quantity: 1, unitPrice: 0, unit: 'u', tvaRate: 19, totalHT: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [notesOpen, setNotesOpen] = useState(false);
  const [clients, setClients] = useState<ApiClientRecord[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);

  // ── New section state ──
  const [general, setGeneral] = useState({ docNumber: '', issueDate: new Date().toISOString().split('T')[0], validUntil: '', tvaRate: '19', city: '' });
  const [complement, setComplement] = useState({ rc: '', nis: '', ai: '', rib: '', bankName: '', bankAgency: '', ccp: '', validityDays: '' });
  const [paiement, setPaiement] = useState({ paymentMethod: '', paymentDeposit: '', paymentConditions: '', paymentIban: '' });
  const [garanties, setGaranties] = useState({ garantieLabor: '', garantieMaterials: '', garantieDuration: '', garantieNotes: '' });
  const [signature, setSignature] = useState({ signatoryName: '', signatoryTitle: '', sigClientName: '', sigClientRole: '' });
  const [remise, setRemise] = useState({ remiseType: 'percent', remiseValue: '', remiseReason: '' });
  const [livraison, setLivraison] = useState({ delivererName: '', delivererIdCard: '', transporterName: '', deliveryAddress: '' });
  const [chantier, setChantier] = useState({ chantierAddress: '', chantierType: '', chantierSurface: '' });
  const [materiaux, setMateriaux] = useState({ materiauxBrand: '', materiauxType: '', materiauxColor: '', materiauxQty: '' });

  // ── Active sections per doc type ──
  const activeSections = useMemo(() => DOC_TYPE_SECTIONS[docType] || DOC_TYPE_SECTIONS.DEVIS, [docType]);

  // ── Fetch clients on mount ──
  useEffect(() => { fetchAllClients().then(setClients).catch(() => {}); }, []);

  // ── Client autocomplete ──
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim() || selectedClient) return [];
    const q = clientSearch.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.nif?.includes(q) || c.phone?.includes(q)).slice(0, 5);
  }, [clientSearch, clients, selectedClient]);

  const selectClient = useCallback((c: ApiClientRecord) => { setSelectedClient(c); setClientSearch(c.name); setClientNif(c.nif || ''); setShowClientDropdown(false); }, []);
  const clearClient = useCallback(() => { setSelectedClient(null); setClientSearch(''); setClientNif(''); }, []);

  // ── Items CRUD ──
  const addItem = useCallback(() => { setItems((prev) => [...prev, { label: '', quantity: 1, unitPrice: 0, unit: 'u', tvaRate: 19, totalHT: 0 }]); }, []);

  const updateItem = useCallback((idx: number, field: string, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = Number(field === 'quantity' ? value : next[idx].quantity);
        const p = Number(field === 'unitPrice' ? value : next[idx].unitPrice);
        next[idx].totalHT = q * p;
      }
      if (field === 'label' && typeof value === 'string') saveToCatalog(value);
      return next;
    });
  }, []);

  const removeItem = useCallback((idx: number) => { if (items.length <= 1) return; setItems((prev) => prev.filter((_, i) => i !== idx)); }, [items.length]);
  const onCatalogSelect = useCallback((idx: number, label: string) => { updateItem(idx, 'label', label); }, [updateItem]);

  // ── Totals ──
  const totalHT = items.reduce((sum, item) => sum + (item.totalHT || 0), 0);
  const totalTVA = items.reduce((sum, item) => sum + ((item.totalHT || 0) * (item.tvaRate || 0) / 100), 0);
  const totalTTC = totalHT + totalTVA;

  // ── Progress ──
  const progress = useMemo(() => {
    let filled = 0;
    let total = 3;
    if (selectedClient?.name) filled++;
    if (items.some((it) => it.label)) filled++;
    if (items.some((it) => (it.totalHT || 0) > 0)) filled++;
    total++;
    if (notes) filled++;
    total++;
    return Math.round((filled / total) * 100);
  }, [selectedClient, items, notes]);

  // ── Save ──
  const handleSave = useCallback(() => { setSaving(true); setTimeout(() => { setSaving(false); onExit(); }, 800); }, [onExit]);

  // ── Styles ──
  const tc = TYPE_COLORS[docType] || TYPE_COLORS.FACTURE;
  const inputCls = 'w-full rounded-xl border border-[rgba(0,26,77,0.06)] bg-[#F0F4FF] px-3 py-2 text-[11px] text-[#001A4D] placeholder-[#718096] transition-all duration-150 focus:border-[#0052CC] focus:outline-none focus:ring-1 focus:ring-[#0052CC]/15';
  const labelCls = 'text-[9px] font-bold text-[#718096] mb-0.5 block';

  const updateField = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>, field: keyof T, value: string) => {
    setter((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Render ──
  return (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col h-full bg-[#F5F7FA]">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[rgba(0,26,77,0.06)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="h-0.5 bg-[#E6F0FF]"><motion.div className="h-full bg-[#0052CC]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} /></div>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <button onClick={onExit} aria-label="Retour" className="flex h-7 w-7 items-center justify-center rounded-xl text-[#4A5568] hover:bg-[#F0F4FF] transition-all duration-150"><ArrowLeft size={16} /></button>
            <h1 className="text-[13px] font-extrabold text-[#001A4D]">{editingDocId ? t('editor.edit') : 'Nouveau'} <span className={tc.text}>{docType}</span></h1>
          </div>
          <button onClick={handleSave} disabled={saving} aria-label="Enregistrer" className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0052CC] text-white shadow-sm shadow-[#0052CC]/20 transition-all duration-200 hover:bg-[#0047B3] active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#0052CC]/40">
            {saving ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Check size={16} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* ── FORM/PREVIEW toggle ── */}
      <div className="px-3 pt-2">
        <div className="flex rounded-xl bg-[#E6F0FF] p-0.5">
          <button onClick={() => setView('form')} className={cn('flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all duration-200', view === 'form' ? 'bg-white text-[#001A4D] shadow-sm' : 'text-[#718096]')}><PenLine size={12} /> Formulaire</button>
          <button onClick={() => setView('preview')} className={cn('flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all duration-200', view === 'preview' ? 'bg-white text-[#001A4D] shadow-sm' : 'text-[#718096]')}><Eye size={12} /> Aperçu</button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      {view === 'preview' ? (
        <div className="flex-1 overflow-y-auto p-3">
          <DocumentPreview docType={docType} clientName={selectedClient?.name || clientSearch} clientNif={clientNif} items={items} totalHT={totalHT} totalTVA={totalTVA} totalTTC={totalTTC} notes={notes} />
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-2 pb-2 space-y-3">

          {/* ── TYPE SELECTOR ── */}
          <div className={cn('rounded-2xl border-2 p-3 transition-colors duration-200', tc.border, tc.light)}>
            <label className="text-[9px] font-bold uppercase tracking-wider text-[#718096] mb-2 block">Type de document</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['DEVIS', 'FACTURE', 'PROFORMA'] as const).map((type) => {
                const t = TYPE_COLORS[type];
                return (<button key={type} onClick={() => setDocType(type)} className={cn('rounded-xl py-2 text-[11px] font-bold transition-all duration-150 active:scale-[0.97]', docType === type ? cn(t.bg, 'text-white shadow-sm') : 'border border-[rgba(0,26,77,0.06)] bg-white text-[#4A5568] hover:bg-white')}>{type}</button>);
              })}
            </div>
          </div>

          {/* ── CLIENT ── */}
          <div className="rounded-2xl border border-[rgba(0,26,77,0.06)] bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#001A4D]">Client</h3>
              {selectedClient && <button onClick={clearClient} className="text-[9px] font-bold text-[#DC3545] hover:text-[#B23030] transition-colors">Changer</button>}
            </div>
            {selectedClient ? (
              <div className="flex items-center gap-2 rounded-xl bg-[#0052CC]/5 p-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0052CC]/10 text-[10px] font-bold text-[#0052CC]">{selectedClient.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0"><div className="text-[11px] font-bold text-[#001A4D] truncate">{selectedClient.name}</div>{selectedClient.nif && <div className="text-[9px] text-[#718096]">NIF: {selectedClient.nif}</div>}</div>
                <button onClick={clearClient} className="text-[#718096] hover:text-[#DC3545] transition-colors"><X size={12} /></button>
              </div>
            ) : (
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718096]" />
                <input ref={clientInputRef} value={clientSearch} onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true); setSelectedClient(null); }} onFocus={() => setShowClientDropdown(true)} onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)} placeholder={t('editor.searchClient')} className={cn(inputCls, 'pl-8 pr-8')} />
                {clientSearch && <button onClick={() => { setClientSearch(''); setShowClientDropdown(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC]"><X size={11} /></button>}
                {showClientDropdown && clientSearch && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-0.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white py-1 shadow-lg max-h-36 overflow-y-auto">
                    {filteredClients.length > 0 ? filteredClients.map((c) => (
                      <button key={c.id} onMouseDown={(e) => { e.preventDefault(); selectClient(c); }} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#E6F0FF] transition-colors duration-100">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-[#0052CC]/8 text-[8px] font-bold text-[#0052CC]">{c.name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0"><div className="text-[11px] font-bold text-[#001A4D] truncate">{c.name}</div>{c.nif && <div className="text-[8px] text-[#718096]">NIF: {c.nif}</div>}</div>
                      </button>
                    )) : (
                      <div className="px-3 py-2">
                        <div className="text-[10px] text-[#718096] mb-1.5">Aucun client trouvé</div>
                        <button onMouseDown={(e) => { e.preventDefault(); setShowNewClientForm(true); setShowClientDropdown(false); }} className="flex w-full items-center gap-1.5 rounded-lg bg-[#0052CC]/8 px-2.5 py-1.5 text-[10px] font-bold text-[#0052CC] hover:bg-[#0052CC]/12 transition-colors"><Plus size={10} /> Nouveau client</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {showNewClientForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-2 overflow-hidden">
                <div className="rounded-xl bg-[#F0F4FF] p-2.5 space-y-2">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#0052CC]">Nouveau client</span><button onClick={() => setShowNewClientForm(false)} className="text-[#718096] hover:text-[#DC3545]"><X size={10} /></button></div>
                  <input value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Nom du client" className={inputCls} autoFocus />
                  <input value={clientNif} onChange={(e) => setClientNif(e.target.value)} placeholder="NIF (optionnel)" dir="ltr" className={inputCls} />
                </div>
              </motion.div>
            )}
            {!showNewClientForm && !selectedClient && <input value={clientNif} onChange={(e) => setClientNif(e.target.value)} placeholder="NIF (optionnel)" dir="ltr" className={inputCls} />}
          </div>

          {/* ── ARTICLES ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-[11px] font-bold text-[#001A4D]">Articles</h3>
              <button onClick={addItem} className="flex items-center gap-1 text-[10px] font-bold text-[#0052CC] transition-colors duration-150 hover:text-[#0047B3]"><Plus size={11} /> Ajouter</button>
            </div>
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => (
                <ArticleRow key={idx} item={item} idx={idx} total={item.totalHT || 0} canDelete={items.length > 1} onUpdate={(field, value) => updateItem(idx, field, value)} onRemove={() => removeItem(idx)} catalogSuggestions={searchCatalog(item.label || '')} onCatalogSelect={(label) => onCatalogSelect(idx, label)} />
              ))}
            </AnimatePresence>
          </div>

          {/* ── DYNAMIC SECTIONS (per doc type) ── */}
          {activeSections.includes('general') && (
            <EditorSection id="general" titleKey="section.general" icon={FileCheck} color="text-[#0052CC]" colorBg="bg-[#0052CC]/8">
              <div><label className={labelCls}>{t('field.docNumber')}</label><input value={general.docNumber} onChange={(e) => updateField(setGeneral, 'docNumber', e.target.value)} placeholder="DEV-2026-XXXX" className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.issueDate')}</label><input type="date" value={general.issueDate} onChange={(e) => updateField(setGeneral, 'issueDate', e.target.value)} className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>{t('field.validUntil')}</label><input type="date" value={general.validUntil} onChange={(e) => updateField(setGeneral, 'validUntil', e.target.value)} className={inputCls} dir="ltr" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.tvaRate')}</label><input type="number" value={general.tvaRate} onChange={(e) => updateField(setGeneral, 'tvaRate', e.target.value)} className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>{t('field.city')}</label><input value={general.city} onChange={(e) => updateField(setGeneral, 'city', e.target.value)} placeholder="Alger" className={inputCls} /></div>
              </div>
            </EditorSection>
          )}

          {activeSections.includes('complement') && (
            <EditorSection id="complement" titleKey="section.complement" icon={Building} color="text-[#7C3AED]" colorBg="bg-[#7C3AED]/8">
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.rc')}</label><input value={complement.rc} onChange={(e) => updateField(setComplement, 'rc', e.target.value)} placeholder="16/00-XXXXX" className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>{t('field.nis')}</label><input value={complement.nis} onChange={(e) => updateField(setComplement, 'nis', e.target.value)} placeholder="XXXXXXXXXX" className={inputCls} dir="ltr" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.ai')}</label><input value={complement.ai} onChange={(e) => updateField(setComplement, 'ai', e.target.value)} placeholder="XXXXXXXXXX" className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>{t('field.validityDays')}</label><input type="number" value={complement.validityDays} onChange={(e) => updateField(setComplement, 'validityDays', e.target.value)} placeholder="30" className={inputCls} dir="ltr" /></div>
              </div>
              <div><label className={labelCls}>{t('field.rib')}</label><input value={complement.rib} onChange={(e) => updateField(setComplement, 'rib', e.target.value)} placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXX" className={inputCls} dir="ltr" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.bankName')}</label><input value={complement.bankName} onChange={(e) => updateField(setComplement, 'bankName', e.target.value)} placeholder="BNA" className={inputCls} /></div>
                <div><label className={labelCls}>{t('field.bankAgency')}</label><input value={complement.bankAgency} onChange={(e) => updateField(setComplement, 'bankAgency', e.target.value)} placeholder="Agence" className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>{t('field.ccp')}</label><input value={complement.ccp} onChange={(e) => updateField(setComplement, 'ccp', e.target.value)} placeholder="XXXXXXXXX" className={inputCls} dir="ltr" /></div>
            </EditorSection>
          )}

          {activeSections.includes('paiement') && (
            <EditorSection id="paiement" titleKey="section.paiement" icon={CreditCard} color="text-[#16A34A]" colorBg="bg-[#16A34A]/8">
              <div><label className={labelCls}>{t('field.paymentMethod')}</label>
                <select value={paiement.paymentMethod} onChange={(e) => updateField(setPaiement, 'paymentMethod', e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  <option value="especes">Espèces</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="traite">Traite</option>
                  <option value="ccp">CCP</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.paymentDeposit')}</label><input type="number" value={paiement.paymentDeposit} onChange={(e) => updateField(setPaiement, 'paymentDeposit', e.target.value)} placeholder="0" className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>{t('field.paymentIban')}</label><input value={paiement.paymentIban} onChange={(e) => updateField(setPaiement, 'paymentIban', e.target.value)} placeholder="DZXX..." className={inputCls} dir="ltr" /></div>
              </div>
              <div><label className={labelCls}>{t('field.paymentConditions')}</label><textarea value={paiement.paymentConditions} onChange={(e) => updateField(setPaiement, 'paymentConditions', e.target.value)} placeholder="Conditions de paiement..." rows={2} className={cn(inputCls, 'resize-none')} /></div>
            </EditorSection>
          )}

          {activeSections.includes('garanties') && (
            <EditorSection id="garanties" titleKey="section.garanties" icon={Shield} color="text-[#0891B2]" colorBg="bg-[#0891B2]/8">
              <div><label className={labelCls}>{t('field.garantieDuration')}</label><input value={garanties.garantieDuration} onChange={(e) => updateField(setGaranties, 'garantieDuration', e.target.value)} placeholder="12 mois" className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.garantieLabor')}</label><input value={garanties.garantieLabor} onChange={(e) => updateField(setGaranties, 'garantieLabor', e.target.value)} placeholder="Oui/Non" className={inputCls} /></div>
                <div><label className={labelCls}>{t('field.garantieMaterials')}</label><input value={garanties.garantieMaterials} onChange={(e) => updateField(setGaranties, 'garantieMaterials', e.target.value)} placeholder="Oui/Non" className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>{t('field.garantieNotes')}</label><textarea value={garanties.garantieNotes} onChange={(e) => updateField(setGaranties, 'garantieNotes', e.target.value)} placeholder="Détails de la garantie..." rows={2} className={cn(inputCls, 'resize-none')} /></div>
            </EditorSection>
          )}

          {activeSections.includes('remise') && (
            <EditorSection id="remise" titleKey="section.remise" icon={Stamp} color="text-[#EA580C]" colorBg="bg-[#EA580C]/8">
              <div><label className={labelCls}>{t('field.remiseType')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => updateField(setRemise, 'remiseType', 'percent')} className={cn('rounded-xl py-2 text-[11px] font-bold transition-all duration-150', remise.remiseType === 'percent' ? 'bg-[#EA580C] text-white shadow-sm' : 'border border-[rgba(0,26,77,0.06)] bg-white text-[#4A5568]')}>Pourcentage (%)</button>
                  <button type="button" onClick={() => updateField(setRemise, 'remiseType', 'fixed')} className={cn('rounded-xl py-2 text-[11px] font-bold transition-all duration-150', remise.remiseType === 'fixed' ? 'bg-[#EA580C] text-white shadow-sm' : 'border border-[rgba(0,26,77,0.06)] bg-white text-[#4A5568]')}>Montant (DA)</button>
                </div>
              </div>
              <div><label className={labelCls}>{t('field.remiseValue')}</label><input type="number" value={remise.remiseValue} onChange={(e) => updateField(setRemise, 'remiseValue', e.target.value)} placeholder="0" className={inputCls} dir="ltr" /></div>
              <div><label className={labelCls}>{t('field.remiseReason')}</label><input value={remise.remiseReason} onChange={(e) => updateField(setRemise, 'remiseReason', e.target.value)} placeholder="Motif de la remise..." className={inputCls} /></div>
            </EditorSection>
          )}

          {activeSections.includes('livraison') && (
            <EditorSection id="livraison" titleKey="section.livraison" icon={Truck} color="text-[#16A34A]" colorBg="bg-[#16A34A]/8">
              <div><label className={labelCls}>{t('field.delivererName')}</label><input value={livraison.delivererName} onChange={(e) => updateField(setLivraison, 'delivererName', e.target.value)} placeholder="Nom" className={inputCls} /></div>
              <div><label className={labelCls}>{t('field.delivererIdCard')}</label><input value={livraison.delivererIdCard} onChange={(e) => updateField(setLivraison, 'delivererIdCard', e.target.value)} placeholder="N° CIN" className={inputCls} dir="ltr" /></div>
              <div><label className={labelCls}>{t('field.transporterName')}</label><input value={livraison.transporterName} onChange={(e) => updateField(setLivraison, 'transporterName', e.target.value)} placeholder="Transporteur" className={inputCls} /></div>
              <div><label className={labelCls}>{t('field.deliveryAddress')}</label><input value={livraison.deliveryAddress} onChange={(e) => updateField(setLivraison, 'deliveryAddress', e.target.value)} placeholder="Adresse de livraison" className={inputCls} /></div>
            </EditorSection>
          )}

          {activeSections.includes('chantier') && (
            <EditorSection id="chantier" titleKey="section.chantier" icon={MapPin} color="text-[#DC3545]" colorBg="bg-[#DC3545]/8">
              <div><label className={labelCls}>{t('field.chantierAddress')}</label><input value={chantier.chantierAddress} onChange={(e) => updateField(setChantier, 'chantierAddress', e.target.value)} placeholder="Adresse du chantier" className={inputCls} /></div>
              <div><label className={labelCls}>{t('field.chantierType')}</label><input value={chantier.chantierType} onChange={(e) => updateField(setChantier, 'chantierType', e.target.value)} placeholder="Type de travaux" className={inputCls} /></div>
              <div><label className={labelCls}>{t('field.chantierSurface')}</label><input type="number" value={chantier.chantierSurface} onChange={(e) => updateField(setChantier, 'chantierSurface', e.target.value)} placeholder="m²" className={inputCls} dir="ltr" /></div>
            </EditorSection>
          )}

          {activeSections.includes('materiaux') && (
            <EditorSection id="materiaux" titleKey="section.materiaux" icon={Package} color="text-[#7C3AED]" colorBg="bg-[#7C3AED]/8">
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.materiauxBrand')}</label><input value={materiaux.materiauxBrand} onChange={(e) => updateField(setMateriaux, 'materiauxBrand', e.target.value)} placeholder="Marque" className={inputCls} /></div>
                <div><label className={labelCls}>{t('field.materiauxType')}</label><input value={materiaux.materiauxType} onChange={(e) => updateField(setMateriaux, 'materiauxType', e.target.value)} placeholder="Type" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.materiauxColor')}</label><input value={materiaux.materiauxColor} onChange={(e) => updateField(setMateriaux, 'materiauxColor', e.target.value)} placeholder="Couleur" className={inputCls} /></div>
                <div><label className={labelCls}>{t('field.materiauxQty')}</label><input type="number" value={materiaux.materiauxQty} onChange={(e) => updateField(setMateriaux, 'materiauxQty', e.target.value)} placeholder="Qté" className={inputCls} dir="ltr" /></div>
              </div>
            </EditorSection>
          )}

          {activeSections.includes('signature') && (
            <EditorSection id="signature" titleKey="section.signature" icon={PenLine} color="text-[#001A4D]" colorBg="bg-[#001A4D]/8">
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.signatoryName')}</label><input value={signature.signatoryName} onChange={(e) => updateField(setSignature, 'signatoryName', e.target.value)} placeholder="Nom" className={inputCls} /></div>
                <div><label className={labelCls}>{t('field.signatoryTitle')}</label><input value={signature.signatoryTitle} onChange={(e) => updateField(setSignature, 'signatoryTitle', e.target.value)} placeholder="Fonction" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>{t('field.sigClientName')}</label><input value={signature.sigClientName} onChange={(e) => updateField(setSignature, 'sigClientName', e.target.value)} placeholder="Nom du client" className={inputCls} /></div>
                <div><label className={labelCls}>{t('field.sigClientRole')}</label><input value={signature.sigClientRole} onChange={(e) => updateField(setSignature, 'sigClientRole', e.target.value)} placeholder="Fonction" className={inputCls} /></div>
              </div>
              <div>
                <label className={labelCls}>Signature</label>
                <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-[rgba(0,26,77,0.1)] bg-[#F5F7FA]">
                  <div className="text-center"><PenLine size={16} className="mx-auto mb-1 text-[#718096]/50" /><span className="text-[9px] text-[#718096]">Signature — À venir</span></div>
                </div>
              </div>
            </EditorSection>
          )}

          {/* ── NOTES ── */}
          <div className="rounded-2xl border border-[rgba(0,26,77,0.06)] bg-white overflow-hidden">
            <button onClick={() => setNotesOpen((v) => !v)} className="flex w-full items-center justify-between px-3 py-2.5 text-left">
              <span className="text-[11px] font-bold text-[#001A4D]">Notes & remarques</span>
              {notesOpen ? <ChevronUp size={14} className="text-[#718096]" /> : <ChevronDown size={14} className="text-[#718096]" />}
            </button>
            <AnimatePresence>
              {notesOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-3 pb-3 space-y-3 border-t border-[rgba(0,26,77,0.04)]">
                    <div className="pt-2"><label className={labelCls}>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes optionnelles..." rows={2} className={cn(inputCls, 'resize-none')} /></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-2" />
        </div>
      )}

      {/* ── STICKY TOTALS BAR ── */}
      <div className="border-t border-[rgba(0,26,77,0.06)] bg-white/95 backdrop-blur px-3 py-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <span className="text-[#718096]">HT: <b className="text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalHT.toLocaleString('fr-DZ')}</b></span>
            <span className="text-[#718096]">TVA: <b className="text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTVA.toLocaleString('fr-DZ')}</b></span>
          </div>
          <span className="font-extrabold text-[13px]">TTC: <span className={tc.text} style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTTC.toLocaleString('fr-DZ')} DA</span></span>
        </div>
      </div>

      {/* ── BOTTOM BUTTONS ── */}
      <div className="border-t border-[rgba(0,26,77,0.06)] bg-white px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <button onClick={() => setView((v) => v === 'form' ? 'preview' : 'form')} className="flex items-center justify-center gap-1.5 rounded-2xl border border-[rgba(0,26,77,0.12)] px-4 py-2.5 text-[11px] font-bold text-[#4A5568] transition-all duration-200 hover:bg-[#F0F4FF] active:scale-[0.97]"><Eye size={14} /> Aperçu</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#0052CC] py-2.5 text-[11px] font-bold text-white shadow-md shadow-[#0052CC]/20 transition-all duration-200 hover:bg-[#0047B3] active:scale-[0.97] disabled:opacity-50">
            {saving ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Check size={14} strokeWidth={2.5} />}
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
