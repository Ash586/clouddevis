'use client';

import { FileText, MoreVertical, Copy, Trash2, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Document, DocumentStatus } from '@/mobile/types';

interface DocumentRowProps {
  document: Document;
  onTap?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const STATUS_STYLES: Record<DocumentStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-[#718096]/10', text: 'text-[#718096]', label: 'Brouillon' },
  SENT: { bg: 'bg-[#0052CC]/10', text: 'text-[#0052CC]', label: 'Envoy\u00e9' },
  PAID: { bg: 'bg-[#001A4D]/10', text: 'text-[#001A4D]', label: 'Pay\u00e9' },
  CANCELLED: { bg: 'bg-[#DC3545]/10', text: 'text-[#DC3545]', label: 'Annul\u00e9' },
};

export function DocumentRow({ document: doc, onTap, onDuplicate, onDelete }: DocumentRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const st = STATUS_STYLES[doc.status] || STATUS_STYLES.DRAFT;

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.document.addEventListener('mousedown', handler);
    return () => window.document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="relative">
      <button
        onClick={onTap}
        aria-label={`${doc.number} - ${doc.client?.name || 'Client'} - ${doc.totalTTC.toLocaleString('fr-DZ')} DA`}
        className="flex w-full items-center gap-2.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 text-left transition-all duration-200 hover:border-[#0052CC]/20 hover:shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0052CC]/30"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0052CC]/5 text-[#0052CC]">
          <FileText size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0052CC] truncate">{doc.number}</span>
            <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold', st.bg, st.text)}>
              {st.label}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-[#718096]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {doc.client?.name || '\u2014'} \u00b7 {doc.totalTTC.toLocaleString('fr-DZ')}\u00a0DA
          </div>
        </div>
      </button>

      <div ref={menuRef} className="absolute right-2.5 top-2.5">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          aria-label="Options"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-[#718096] transition-colors duration-200 hover:bg-[#F5F7FA] hover:text-[#0052CC] focus-visible:ring-2 focus-visible:ring-[#0052CC]/30"
        >
          <MoreVertical size={13} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 z-50 w-36 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white py-1 shadow-xl" role="menu">
            <button
              onClick={() => { onTap?.(); setMenuOpen(false); }}
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#001A4D] transition-colors duration-150 hover:bg-[#E6F0FF]"
            >
              <Eye size={13} /> Modifier
            </button>
            <button
              onClick={() => { onDuplicate?.(); setMenuOpen(false); }}
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#001A4D] transition-colors duration-150 hover:bg-[#E6F0FF]"
            >
              <Copy size={13} /> Dupliquer
            </button>
            <button
              onClick={() => { onDelete?.(); setMenuOpen(false); }}
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#DC3545] transition-colors duration-150 hover:bg-[#DC3545]/5"
            >
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
