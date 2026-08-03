'use client';

import { FileText, MoreVertical, Copy, Trash2, Eye, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatAmount, formatDate } from '@/mobile/lib/format';
import type { Document, DocumentStatus } from '@/mobile/types';

interface DocumentRowProps {
  document: Document;
  onTap?: () => void;
  onDownload?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const STATUS_STYLES: Record<DocumentStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-[#718096]/10', text: 'text-[#718096]', label: 'Brouillon' },
  SENT: { bg: 'bg-[#0052CC]/10', text: 'text-[#0052CC]', label: 'Envoyé' },
  PAID: { bg: 'bg-[#001A4D]/10', text: 'text-[#001A4D]', label: 'Payé' },
  CANCELLED: { bg: 'bg-[#DC3545]/10', text: 'text-[#DC3545]', label: 'Annulé' },
};

export function DocumentRow({ document: doc, onTap, onDownload, onDuplicate, onDelete }: DocumentRowProps) {
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
        aria-label={`${doc.number} - ${doc.client?.name || 'Client'} - ${formatAmount(doc.totalTTC)}`}
        className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 text-left transition-all duration-200 hover:border-[#0052CC]/20 hover:shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0052CC]/30"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0052CC]/5 text-[#0052CC]">
          <FileText size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#001A4D] truncate">{doc.number}</span>
            <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold', st.bg, st.text)}>
              {st.label}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
            <span className="truncate text-[11px] text-[#4A5568]">{doc.client?.name || '—'}</span>
            <span className="shrink-0 text-[#A0AEC0]">·</span>
            <span className="shrink-0 text-[10px] text-[#A0AEC0]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatDate(doc.date)}
            </span>
          </div>
        </div>
        <div className="shrink-0 pl-2 pr-1 text-right">
          <span
            className="whitespace-nowrap text-[13px] font-bold text-[#001A4D]"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatAmount(doc.totalTTC)}
          </span>
        </div>
      </button>

      <div ref={menuRef} className="absolute right-2.5 top-2.5 flex items-center gap-1">
        {onDownload && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
            aria-label="Télécharger PDF"
            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#0052CC] transition-colors duration-200 hover:bg-[#E6F0FF] focus-visible:ring-2 focus-visible:ring-[#0052CC]/30"
          >
            <Download size={13} />
          </button>
        )}
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
            {onDownload && (
              <button
                onClick={() => { onDownload?.(); setMenuOpen(false); }}
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#001A4D] transition-colors duration-150 hover:bg-[#E6F0FF]"
              >
                <Download size={13} /> Télécharger PDF
              </button>
            )}
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
