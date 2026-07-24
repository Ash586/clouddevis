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
  DRAFT: { bg: 'bg-[#9AA1B4]/10', text: 'text-[#9AA1B4]', label: 'Brouillon' },
  SENT: { bg: 'bg-[#2A6B52]/10', text: 'text-[#2A6B52]', label: 'Envoyé' },
  PAID: { bg: 'bg-[#2F6B4F]/10', text: 'text-[#2F6B4F]', label: 'Payé' },
  CANCELLED: { bg: 'bg-[#B5402C]/10', text: 'text-[#B5402C]', label: 'Annulé' },
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
        className="flex w-full items-center gap-3 rounded-xl border border-[#E8E1CE] bg-white p-3.5 text-left transition-all hover:border-[#B5402C]/30 hover:bg-[#FBF8F2] active:scale-[0.99]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2A6B52]/5 text-[#2A6B52]">
          <FileText size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#2A6B52] truncate">{doc.number}</span>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', st.bg, st.text)}>
              {st.label}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-[#9AA1B4]">
            {doc.client?.name || '—'} · {doc.totalTTC.toLocaleString('fr-DZ')} DA
          </div>
        </div>
      </button>

      {/* Three-dot menu */}
      <div ref={menuRef} className="absolute right-3 top-3">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9AA1B4] hover:bg-[#F4F6FA] hover:text-[#2A6B52] transition-colors"
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-[#E8E1CE] bg-white py-1.5 shadow-xl">
            <button
              onClick={() => { onTap?.(); setMenuOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#2A6B52] hover:bg-[#FBF8F2] transition-colors"
            >
              <Eye size={14} /> Modifier
            </button>
            <button
              onClick={() => { onDuplicate?.(); setMenuOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#2A6B52] hover:bg-[#FBF8F2] transition-colors"
            >
              <Copy size={14} /> Dupliquer
            </button>
            <button
              onClick={() => { onDelete?.(); setMenuOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#B5402C] hover:bg-[#B5402C]/5 transition-colors"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
