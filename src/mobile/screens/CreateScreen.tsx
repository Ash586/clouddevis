'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, Plus, Trash2, ChevronDown, ChevronUp,
  Eye, FileText, Search, X, PenLine,
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(0,26,77,0.06)] pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0052CC] text-white">
            <FileText size={14} />
          </div>
          <div>
            <div className="font-extrabold text-[#001A4D] text-sm">Rakmana</div>
            <div className="text-[9px] text-[#718096]">DGI Algeria</div>
          </div>
        </div>
        <div className={cn('px-2.5 py-1 rounded-full text-[9px] font-bold text-white', tc.bg)}>
          {docType}
        </div>
      </div>

      {/* Client */}
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

      {/* Items */}
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
        {items.every((it) => !it.label) && (
          <div className="px-2.5 py-3 text-center text-[9px] text-[#718096]">Aucun article</div>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-1 text-right">
        <div className="flex justify-between"><span className="text-[#718096]">Total HT</span><span className="text-[#001A4D] font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalHT.toLocaleString('fr-DZ')} DA</span></div>
        <div className="flex justify-between"><span className="text-[#718096]">TVA</span><span className="text-[#001A4D] font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTVA.toLocaleString('fr-DZ')} DA</span></div>
        <div className="h-px bg-[rgba(0,26,77,0.06)]" />
        <div className="flex justify-between text-sm"><span className="font-extrabold text-[#001A4D]">Total TTC</span><span className={cn('font-extrabold', tc.text)} style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTTC.toLocaleString('fr-DZ')} DA</span></div>
      </div>

      {notes && (
        <div className="border-t border-[rgba(0,26,77,0.06)] pt-2">
          <div className="text-[9px] uppercase tracking-wider text-[#718096] font-bold mb-0.5">Notes</div>
          <div className="text-[#4A5568]">{notes}</div>
        </div>
      )}
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-[rgba(0,26,77,0.06)] bg-white overflow-hidden"
    >
      {/* Collapsed header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0052CC]/8 text-[#0052CC] text-[10px] font-bold shrink-0">
          {idx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-[#001A4D] truncate">{item.label || 'Nouvel article'}</div>
          {!expanded && item.label && (
            <div className="text-[9px] text-[#718096]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {item.quantity || 1} × {(item.unitPrice || 0).toLocaleString('fr-DZ')} = {total.toLocaleString('fr-DZ')} DA
            </div>
          )}
        </div>
        {canDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            aria-label="Supprimer"
            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#DC3545]/60 hover:text-[#DC3545] hover:bg-[#DC3545]/8 transition-all duration-150"
          >
            <Trash2 size={12} />
          </button>
        )}
        <div className="text-[#718096] shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded fields */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-[rgba(0,26,77,0.04)]">
              {/* Designation + catalog */}
              <div className="pt-2 relative">
                <label className={labelCls}>Désignation</label>
                <input
                  value={item.label || ''}
                  onChange={(e) => { onUpdate('label', e.target.value); setShowCatalog(true); }}
                  onFocus={() => setShowCatalog(true)}
                  onBlur={() => setTimeout(() => setShowCatalog(false), 150)}
                  placeholder="Nom du produit/service"
                  className={inputCls}
                />
                {showCatalog && catalogSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-0.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white py-1 shadow-lg">
                    {catalogSuggestions.map((s) => (
                      <button
                        key={s}
                        onMouseDown={(e) => { e.preventDefault(); onCatalogSelect(s); setShowCatalog(false); }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-[#001A4D] hover:bg-[#E6F0FF] transition-colors duration-100"
                      >
                        <Search size={10} className="text-[#718096]" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Qty + Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Qté</label>
                  <input type="number" value={item.quantity || 1} onChange={(e) => onUpdate('quantity', Number(e.target.value))} className={cn(inputCls, 'text-center')} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>Prix unitaire (DA)</label>
                  <input type="number" value={item.unitPrice || 0} onChange={(e) => onUpdate('unitPrice', Number(e.target.value))} className={cn(inputCls, 'text-right')} dir="ltr" style={{ fontVariantNumeric: 'tabular-nums' }} />
                </div>
              </div>

              {/* Line total */}
              <div className="flex items-center justify-between rounded-xl bg-[#F0F4FF] px-3 py-1.5">
                <span className="text-[9px] font-bold text-[#718096]">Total ligne</span>
                <span className="text-[11px] font-extrabold text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {total.toLocaleString('fr-DZ')} DA
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

  // ── Fetch clients on mount ──
  useEffect(() => {
    fetchAllClients().then(setClients).catch(() => {});
  }, []);

  // ── Client autocomplete ──
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim() || selectedClient) return [];
    const q = clientSearch.toLowerCase();
    return clients.filter((c) =>
      c.name.toLowerCase().includes(q) || c.nif?.includes(q) || c.phone?.includes(q)
    ).slice(0, 5);
  }, [clientSearch, clients, selectedClient]);

  const selectClient = useCallback((c: ApiClientRecord) => {
    setSelectedClient(c);
    setClientSearch(c.name);
    setClientNif(c.nif || '');
    setShowClientDropdown(false);
  }, []);

  const clearClient = useCallback(() => {
    setSelectedClient(null);
    setClientSearch('');
    setClientNif('');
  }, []);

  // ── Items CRUD ──
  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { label: '', quantity: 1, unitPrice: 0, unit: 'u', tvaRate: 19, totalHT: 0 }]);
  }, []);

  const updateItem = useCallback((idx: number, field: string, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = Number(field === 'quantity' ? value : next[idx].quantity);
        const p = Number(field === 'unitPrice' ? value : next[idx].unitPrice);
        next[idx].totalHT = q * p;
      }
      if (field === 'label' && typeof value === 'string') {
        saveToCatalog(value);
      }
      return next;
    });
  }, []);

  const removeItem = useCallback((idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, [items.length]);

  const onCatalogSelect = useCallback((idx: number, label: string) => {
    updateItem(idx, 'label', label);
  }, [updateItem]);

  // ── Totals ──
  const totalHT = items.reduce((sum, item) => sum + (item.totalHT || 0), 0);
  const totalTVA = items.reduce((sum, item) => sum + ((item.totalHT || 0) * (item.tvaRate || 0) / 100), 0);
  const totalTTC = totalHT + totalTVA;

  // ── Progress ──
  const progress = useMemo(() => {
    let filled = 0;
    let total = 3; // client + 1 item label + docType always filled
    if (selectedClient?.name) filled++;
    if (items.some((it) => it.label)) filled++;
    if (items.some((it) => (it.totalHT || 0) > 0)) filled++;
    total++;
    if (notes) filled++;
    total++;
    return Math.round((filled / total) * 100);
  }, [selectedClient, items, notes]);

  // ── Save ──
  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => { setSaving(false); onExit(); }, 800);
  }, [onExit]);

  // ── Styles ──
  const tc = TYPE_COLORS[docType] || TYPE_COLORS.FACTURE;
  const inputCls = 'w-full rounded-xl border border-[rgba(0,26,77,0.06)] bg-[#F0F4FF] px-3 py-2 text-[11px] text-[#001A4D] placeholder-[#718096] transition-all duration-150 focus:border-[#0052CC] focus:outline-none focus:ring-1 focus:ring-[#0052CC]/15';
  const labelCls = 'text-[9px] font-bold text-[#718096] mb-0.5 block';

  // ── Render ──
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full bg-[#F5F7FA]"
    >
      {/* ── HEADER ── */}
      <div
        className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[rgba(0,26,77,0.06)]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-[#E6F0FF]">
          <motion.div
            className="h-full bg-[#0052CC]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onExit}
              aria-label="Retour"
              className="flex h-7 w-7 items-center justify-center rounded-xl text-[#4A5568] hover:bg-[#F0F4FF] transition-all duration-150"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-[13px] font-extrabold text-[#001A4D]">
              {editingDocId ? t('editor.edit') : 'Nouveau'}{' '}
              <span className={tc.text}>{docType}</span>
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            aria-label="Enregistrer"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0052CC] text-white shadow-sm shadow-[#0052CC]/20 transition-all duration-200 hover:bg-[#0047B3] active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#0052CC]/40"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Check size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {/* ── FORM or PREVIEW toggle ── */}
      <div className="px-3 pt-2">
        <div className="flex rounded-xl bg-[#E6F0FF] p-0.5">
          <button
            onClick={() => setView('form')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all duration-200',
              view === 'form' ? 'bg-white text-[#001A4D] shadow-sm' : 'text-[#718096]',
            )}
          >
            <PenLine size={12} /> Formulaire
          </button>
          <button
            onClick={() => setView('preview')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all duration-200',
              view === 'preview' ? 'bg-white text-[#001A4D] shadow-sm' : 'text-[#718096]',
            )}
          >
            <Eye size={12} /> Aperçu
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      {view === 'preview' ? (
        <div className="flex-1 overflow-y-auto p-3">
          <DocumentPreview
            docType={docType}
            clientName={selectedClient?.name || clientSearch}
            clientNif={clientNif}
            items={items}
            totalHT={totalHT}
            totalTVA={totalTVA}
            totalTTC={totalTTC}
            notes={notes}
          />
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-2 pb-2 space-y-3">

          {/* ── TYPE SELECTOR ── */}
          <div className={cn('rounded-2xl border-2 p-3 transition-colors duration-200', tc.border, tc.light)}>
            <label className="text-[9px] font-bold uppercase tracking-wider text-[#718096] mb-2 block">Type de document</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['DEVIS', 'FACTURE', 'PROFORMA'] as const).map((type) => {
                const t = TYPE_COLORS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setDocType(type)}
                    className={cn(
                      'rounded-xl py-2 text-[11px] font-bold transition-all duration-150 active:scale-[0.97]',
                      docType === type
                        ? cn(t.bg, 'text-white shadow-sm')
                        : 'border border-[rgba(0,26,77,0.06)] bg-white text-[#4A5568] hover:bg-white',
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── CLIENT SECTION ── */}
          <div className="rounded-2xl border border-[rgba(0,26,77,0.06)] bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#001A4D]">Client</h3>
              {selectedClient && (
                <button onClick={clearClient} className="text-[9px] font-bold text-[#DC3545] hover:text-[#B23030] transition-colors">
                  Changer
                </button>
              )}
            </div>

            {selectedClient ? (
              <div className="flex items-center gap-2 rounded-xl bg-[#0052CC]/5 p-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0052CC]/10 text-[10px] font-bold text-[#0052CC]">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-[#001A4D] truncate">{selectedClient.name}</div>
                  {selectedClient.nif && <div className="text-[9px] text-[#718096]">NIF: {selectedClient.nif}</div>}
                </div>
                <button onClick={clearClient} className="text-[#718096] hover:text-[#DC3545] transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718096]" />
                <input
                  ref={clientInputRef}
                  value={clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true); setSelectedClient(null); }}
                  onFocus={() => setShowClientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                  placeholder={t('editor.searchClient')}
                  className={cn(inputCls, 'pl-8 pr-8')}
                />
                {clientSearch && (
                  <button onClick={() => { setClientSearch(''); setShowClientDropdown(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC]">
                    <X size={11} />
                  </button>
                )}

                {/* Dropdown */}
                {showClientDropdown && clientSearch && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-0.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white py-1 shadow-lg max-h-36 overflow-y-auto">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((c) => (
                        <button
                          key={c.id}
                          onMouseDown={(e) => { e.preventDefault(); selectClient(c); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#E6F0FF] transition-colors duration-100"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#0052CC]/8 text-[8px] font-bold text-[#0052CC]">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-[#001A4D] truncate">{c.name}</div>
                            {c.nif && <div className="text-[8px] text-[#718096]">NIF: {c.nif}</div>}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2">
                        <div className="text-[10px] text-[#718096] mb-1.5">Aucun client trouvé</div>
                        <button
                          onMouseDown={(e) => { e.preventDefault(); setShowNewClientForm(true); setShowClientDropdown(false); }}
                          className="flex w-full items-center gap-1.5 rounded-lg bg-[#0052CC]/8 px-2.5 py-1.5 text-[10px] font-bold text-[#0052CC] hover:bg-[#0052CC]/12 transition-colors"
                        >
                          <Plus size={10} /> Nouveau client
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Inline new client form */}
            {showNewClientForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="rounded-xl bg-[#F0F4FF] p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#0052CC]">Nouveau client</span>
                    <button onClick={() => setShowNewClientForm(false)} className="text-[#718096] hover:text-[#DC3545]"><X size={10} /></button>
                  </div>
                  <input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Nom du client"
                    className={inputCls}
                    autoFocus
                  />
                  <input
                    value={clientNif}
                    onChange={(e) => setClientNif(e.target.value)}
                    placeholder="NIF (optionnel)"
                    dir="ltr"
                    className={inputCls}
                  />
                </div>
              </motion.div>
            )}

            {!showNewClientForm && !selectedClient && (
              <input
                value={clientNif}
                onChange={(e) => setClientNif(e.target.value)}
                placeholder="NIF (optionnel)"
                dir="ltr"
                className={inputCls}
              />
            )}
          </div>

          {/* ── ARTICLES ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-[11px] font-bold text-[#001A4D]">Articles</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1 text-[10px] font-bold text-[#0052CC] transition-colors duration-150 hover:text-[#0047B3]"
              >
                <Plus size={11} /> Ajouter
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => (
                <ArticleRow
                  key={idx}
                  item={item}
                  idx={idx}
                  total={item.totalHT || 0}
                  canDelete={items.length > 1}
                  onUpdate={(field, value) => updateItem(idx, field, value)}
                  onRemove={() => removeItem(idx)}
                  catalogSuggestions={searchCatalog(item.label || '')}
                  onCatalogSelect={(label) => onCatalogSelect(idx, label)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* ── TOTAUX (inline in form, compact) ── */}
          <div className="rounded-2xl border border-[rgba(0,26,77,0.06)] bg-white p-3 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#718096]">Total HT</span>
              <span className="font-bold text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalHT.toLocaleString('fr-DZ')} DA</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#718096]">TVA</span>
              <span className="font-bold text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTVA.toLocaleString('fr-DZ')} DA</span>
            </div>
            <div className="h-px bg-[rgba(0,26,77,0.06)]" />
            <div className="flex justify-between text-[13px]">
              <span className="font-extrabold text-[#001A4D]">Total TTC</span>
              <span className={cn('font-extrabold', tc.text)} style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTTC.toLocaleString('fr-DZ')} DA</span>
            </div>
          </div>

          {/* ── NOTES ACCORDION ── */}
          <div className="rounded-2xl border border-[rgba(0,26,77,0.06)] bg-white overflow-hidden">
            <button
              onClick={() => setNotesOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
            >
              <span className="text-[11px] font-bold text-[#001A4D]">Notes & remarques</span>
              {notesOpen ? <ChevronUp size={14} className="text-[#718096]" /> : <ChevronDown size={14} className="text-[#718096]" />}
            </button>
            <AnimatePresence>
              {notesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3 border-t border-[rgba(0,26,77,0.04)]">
                    {/* Notes */}
                    <div className="pt-2">
                      <label className={labelCls}>Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes optionnelles..."
                        rows={2}
                        className={cn(inputCls, 'resize-none')}
                      />
                    </div>

                    {/* Signature placeholder */}
                    <div>
                      <label className={labelCls}>Signature</label>
                      <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-[rgba(0,26,77,0.1)] bg-[#F5F7FA]">
                        <div className="text-center">
                          <PenLine size={16} className="mx-auto mb-1 text-[#718096]/50" />
                          <span className="text-[9px] text-[#718096]">Signature — À venir</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom spacer */}
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
          <button
            onClick={() => setView((v) => v === 'form' ? 'preview' : 'form')}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-[rgba(0,26,77,0.12)] px-4 py-2.5 text-[11px] font-bold text-[#4A5568] transition-all duration-200 hover:bg-[#F0F4FF] active:scale-[0.97]"
          >
            <Eye size={14} /> Aperçu
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#0052CC] py-2.5 text-[11px] font-bold text-white shadow-md shadow-[#0052CC]/20 transition-all duration-200 hover:bg-[#0047B3] active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Check size={14} strokeWidth={2.5} />
            )}
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
