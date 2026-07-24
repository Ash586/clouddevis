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
  DRAFT: { bg: 'bg-[#5A6B85]/10', text: 'text-[#5A6B85]', label: 'Brouillon' },
  SENT: { bg: 'bg-[#2563EB]/10', text: 'text-[#2563EB]', label: 'Envoy\u00e9' },
  PAID: { bg: 'bg-[#1E40AF]/10', text: 'text-[#1E40AF]', label: 'Pay\u00e9' },
  CANCELLED: { bg: 'bg-[#E8542E]/10', text: 'text-[#E8542E]', label: 'Annul\u00e9' },
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
        className="flex w-full items-center gap-3 rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-3.5 text-left transition-all hover:border-[#E8542E]/30 hover:bg-[#EDF2FB] active:scale-[0.99]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/5 text-[#2563EB]">
          <FileText size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#2563EB] truncate">{doc.number}</span>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', st.bg, st.text)}>
              {st.label}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-[#5A6B85]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {doc.client?.name || '\u2014'} \u00b7 {doc.totalTTC.toLocaleString('fr-DZ')}\u00a0DA
          </div>
        </div>
      </button>

      {/* Three-dot menu */}
      <div ref={menuRef} className="absolute right-3 top-3">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5A6B85] hover:bg-[#F3F6FC] hover:text-[#2563EB] transition-colors"
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-[rgba(15,39,71,0.09)] bg-white py-1.5 shadow-xl">
            <button
              onClick={() => { onTap?.(); setMenuOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#2563EB] hover:bg-[#EDF2FB] transition-colors"
            >
              <Eye size={14} /> Modifier
            </button>
            <button
              onClick={() => { onDuplicate?.(); setMenuOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#2563EB] hover:bg-[#EDF2FB] transition-colors"
            >
              <Copy size={14} /> Dupliquer
            </button>
            <button
              onClick={() => { onDelete?.(); setMenuOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#E8542E] hover:bg-[#E8542E]/5 transition-colors"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
