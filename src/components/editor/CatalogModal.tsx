'use client';

import type { LineItem } from '@/types';
import { categoryLabelKey } from '@/types';

interface CatalogModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  items: LineItem[];
  onSelect: (item: LineItem) => void;
  tp: (key: string) => string;
  tc: (key: string) => string;
  te: (key: string) => string;
}

export function CatalogModal({ open, onClose, loading, items, onSelect, tp, tc, te }: CatalogModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--navy-2)] w-full sm:max-w-md sm:mx-3 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-2 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-[var(--navy-4)]" /></div>
        <div className="px-4 py-3 border-b border-[rgba(245,237,214,0.06)] flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--sand)]">{te('catalog') || 'Catalogue articles'}</h3>
          <button type="button" onClick={onClose} className="text-[var(--sand-muted)] hover:text-[var(--sand)] p-1">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="text-center py-8 text-[var(--sand-muted)] text-[11px]">{tc('loading')}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-[var(--sand-muted)] text-[11px]">{te('catalogEmpty') || 'Aucun article trouvé'}</div>
          ) : items.map((item, i) => (
            <button type="button" key={`${item.designation}-${i}`} onClick={() => onSelect(item)}
              className="w-full text-left p-2.5 rounded-xl hover:bg-[var(--navy-4)] border border-transparent hover:border-[rgba(245,237,214,0.15)] transition flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-[var(--sand-2)] truncate">{item.designation}</div>
                {item.category && <div className="text-[8px] text-[var(--sand-muted)] uppercase mt-0.5">{tp((categoryLabelKey(item.category) ?? 'preview.categories.none').replace(/^preview\./, ''))}</div>}
              </div>
              <div className="text-[11px] font-bold text-[var(--green-3)] whitespace-nowrap">{item.unitPrice.toLocaleString('fr-DZ')} {tc('currency')}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
