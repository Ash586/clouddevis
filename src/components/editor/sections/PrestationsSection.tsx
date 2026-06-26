'use client';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { Plus, Trash2, ChevronRight, Package } from 'lucide-react';
import { UNIT_OPTIONS } from '@/types';
import { CatalogModal } from '@/components/editor/CatalogModal';
import { validateLineItem } from '@/lib/validation';
import { categoryLabelKey, getCategoryOptions } from '@/types';
import { useSectionContext } from './SectionProps';

export function PrestationsSection() {
  const {
    doc, setDoc, hiddenFields, te, tp, tu, tc,
    addingItem, setAddingItem, newItem, setNewItem, handleAddItem, handleRemoveItem, moveItem, startNewItem,
    itemErrors, setItemErrors, dragIdx, setDragIdx, dragOverIdx, setDragOverIdx,
    catalogItems, catalogLoading, setCatalogItems, setCatalogLoading,
  } = useSectionContext();
  const locale = useLocale();
  const [showCatalog, setShowCatalog] = useState(false);

  if (hiddenFields.has('itemsTable')) return null;

  return (
    <>
      {addingItem && (
        <div className="bg-[var(--navy-3)] p-2 rounded-xl border space-y-1.5">
          <input type="text" placeholder={te('prestations.description')}
            className="w-full bg-[var(--navy-2)] border p-1.5 sm:p-2 rounded-lg text-[11px] font-medium outline-none focus:ring-2 focus:ring-[var(--green-2)]"
            value={newItem.designation} onChange={(e) => setNewItem(p => ({ ...p, designation: e.target.value }))} />
          <input type="text" placeholder={te('prestations.subDescription') || 'Description (optionnel)'}
            className="w-full bg-[var(--navy-2)] border p-1.5 sm:p-2 rounded-lg text-[10px] italic text-gray-500 outline-none focus:ring-2 focus:ring-[var(--green-2)]"
            value={newItem.description ?? ''} onChange={(e) => setNewItem(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] leading-relaxed">{te('prestations.qty')}</label>
              <input type="number" className="w-full border p-1.5 sm:p-2 rounded-lg text-[11px] bg-[var(--navy-2)] text-center outline-none focus:ring-2 focus:ring-[var(--green-2)]"
                value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] leading-relaxed">{te('prestations.unit')}</label>
              <select className="w-full border p-1.5 sm:p-2 rounded-lg text-[10px] bg-[var(--navy-2)] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
                value={newItem.unit} onChange={(e) => setNewItem(p => ({ ...p, unit: e.target.value as typeof newItem.unit }))}>
                {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{tu(u.labelKey)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] leading-relaxed">{te('prestations.unitPrice')}</label>
              <input type="number" className="w-full border p-1.5 sm:p-2 rounded-lg text-[11px] bg-[var(--navy-2)] text-right outline-none focus:ring-2 focus:ring-[var(--green-2)]"
                value={newItem.unitPrice} onChange={(e) => setNewItem(p => ({ ...p, unitPrice: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] leading-relaxed">{te('prestations.category')}</label>
              <select className="w-full border p-1.5 sm:p-2 rounded-lg text-[10px] bg-[var(--navy-2)] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
                value={newItem.category ?? ''} onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))}>
                {getCategoryOptions(doc.documentType).map(c => <option key={c.value} value={c.value}>{tp(c.labelKey.replace(/^preview\./, ''))}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            {!newItem.designation && (
              <div className="text-[10px] text-red-400 bg-[rgba(232,84,46,0.1)] px-3 py-1.5 rounded-lg border border-red-400/20">{te('error.designationRequired') || '✕ Description requise'}</div>
            )}
            {newItem.designation && newItem.unitPrice <= 0 && (
              <div className="text-[10px] text-red-400 bg-[rgba(232,84,46,0.1)] px-3 py-1.5 rounded-lg border border-red-400/20">{te('error.priceRequired') || '✕ Le prix doit être > 0'}</div>
            )}
            <div className="flex gap-1.5">
              <button type="button" onClick={() => { const v = validateLineItem(newItem); if (!v.valid) { setItemErrors(Object.values(v.errors)[0] ?? null); return; } setItemErrors(null); handleAddItem(); }}
                disabled={!newItem.designation || newItem.unitPrice <= 0}
                className="flex-1 sm:flex-none bg-[var(--green-3)] text-[var(--navy-2)] text-[11px] font-bold px-4 py-2 min-h-[44px] rounded-lg hover:bg-[var(--green-2)] disabled:opacity-50 disabled:bg-[var(--navy-3)] disabled:text-[var(--sand-muted)] disabled:cursor-not-allowed flex items-center justify-center gap-1 transition">
                <Plus size={14} /><span>Ajouter</span>
              </button>
              <button type="button" onClick={() => { setAddingItem(false); setItemErrors(null); }}
                className="text-red-400 text-[11px] font-bold px-4 py-2 min-h-[44px] rounded-lg hover:bg-[rgba(232,84,46,0.08)] flex items-center justify-center transition" title="Cancel">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {newItem.designation && newItem.unitPrice > 0 && (
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-[var(--green-glow)] rounded-lg ring-1 ring-[rgba(37,99,235,0.2)]">
              <span className="text-[10px] text-[var(--green-3)] font-medium">{te('prestations.lineTotal') || 'Total ligne'}</span>
              <span className="text-[13px] font-bold text-[var(--green-3)]">{(newItem.quantity * newItem.unitPrice).toLocaleString(locale)} {tc('currency')}</span>
            </div>
          )}
          {itemErrors && <div className="text-[10px] text-red-400 bg-[rgba(232,84,46,0.1)] px-3 py-1.5 rounded-lg border border-red-400/20">{itemErrors}</div>}
        </div>
      )}

      {doc.items.map((item, idx) => (
        <div key={item.id} draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
          onDragEnter={(e) => e.preventDefault()}
          onDragLeave={() => setDragOverIdx(null)}
          onDrop={() => { if (dragIdx !== null && dragIdx !== idx) { moveItem(dragIdx, idx); } setDragIdx(null); setDragOverIdx(null); }}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          className={`bg-[var(--navy-3)] p-2 sm:p-3 rounded-xl border space-y-1.5 transition-all ${dragOverIdx === idx ? 'border-[var(--green-2)] shadow-md scale-[1.02]' : 'border-[rgba(15,39,71,0.1)]'} ${dragIdx === idx ? 'opacity-40' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[var(--sand-muted)] cursor-grab active:cursor-grabbing text-[14px] select-none px-0.5" title={te('dragToReorder') || 'Drag to reorder'} role="img" aria-label="Drag handle">⠿</span>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-[var(--sand-2)] truncate block">{item.designation}</span>
                {item.category && <span className="text-[8px] text-[var(--sand-muted)] uppercase">{tp((categoryLabelKey(item.category) ?? 'preview.categories.none').replace(/^preview\./, ''))}</span>}
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              <button type="button" onClick={() => idx > 0 && moveItem(idx, idx - 1)} disabled={idx === 0}
                className="text-[var(--sand-muted)] hover:text-[var(--sand)] disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[rgba(15,39,71,0.08)] transition" title="Move up" aria-label="Move item up">
                <ChevronRight size={14} className="rotate-[270deg]" />
              </button>
              <button type="button" onClick={() => idx < doc.items.length - 1 && moveItem(idx, idx + 1)} disabled={idx === doc.items.length - 1}
                className="text-[var(--sand-muted)] hover:text-[var(--sand)] disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[rgba(15,39,71,0.08)] transition" title="Move down" aria-label="Move item down">
                <ChevronRight size={14} className="rotate-90" />
              </button>
              <button type="button" onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[rgba(232,84,46,0.08)] transition" title="Delete" aria-label="Delete item">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-[10px] text-[var(--sand-muted)]">
            <span>{te('prestations.qtyLabel')} <strong>{item.quantity}</strong></span>
            <span>{te('prestations.puLabel')} <strong>{item.unitPrice.toLocaleString(locale)}</strong></span>
            <span>{te('prestations.vatLabel')} <strong>{doc.tvaRate}%</strong></span>
            <span>{te('prestations.unitLabel')} <strong>{tu(item.unit)}</strong></span>
            <span className="text-right font-bold text-[var(--sand)]">{(item.quantity * item.unitPrice).toLocaleString(locale)} {tc('currency')}</span>
          </div>
        </div>
      ))}

      {!addingItem && (
        <div className="flex gap-2">
          <button type="button" onClick={startNewItem}
            className="flex-1 py-3 sm:py-2.5 border-2 border-dashed border-[rgba(15,39,71,0.12)] rounded-xl text-[var(--sand-muted)] font-bold hover:bg-[var(--navy-4)] transition text-[11px] min-h-[44px]">
            {te('prestations.addLine')}
          </button>
          <button type="button" onClick={async () => {
            setCatalogLoading(true); setShowCatalog(true);
            try {
              const res = await fetch('/api/documents?limit=30');
              const data = await res.json();
              const seen = new Set<string>();
              const all: typeof doc.items = [];
              for (const d of data.documents ?? []) {
                const items: typeof doc.items = typeof d.items === 'string' ? (JSON.parse(d.items) || []) : (d.items || []);
                for (const item of items) {
                  if (item.designation && !seen.has(item.designation)) {
                    seen.add(item.designation);
                    all.push(item);
                  }
                }
              }
              setCatalogItems(all);
            } catch { setCatalogItems([]); }
            setCatalogLoading(false);
          }}
            className="py-3 sm:py-2.5 px-3 border-2 border-dashed border-[rgba(37,99,235,0.25)] rounded-xl text-[var(--green-3)] font-bold hover:bg-[var(--green-glow)] transition text-[11px] min-h-[44px] flex items-center justify-center"
            title={te('catalog') || 'Catalogue'}>
            <Package size={16} />
          </button>
        </div>
      )}

      <CatalogModal
        open={showCatalog}
        onClose={() => setShowCatalog(false)}
        loading={catalogLoading}
        items={catalogItems}
        onSelect={(item) => {
          setNewItem({ id: '', designation: item.designation, quantity: 1, unit: item.unit, unitPrice: item.unitPrice, category: item.category ?? '' });
          setAddingItem(true);
          setShowCatalog(false);
        }}
        tp={tp} tc={tc} te={te}
      />
    </>
  );
}
