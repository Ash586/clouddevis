'use client';

import { useMemo } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import type { Document } from '@/mobile/types';

interface RecentDocumentsProps {
  documents: Document[];
  onDocumentTap?: (doc: Document) => void;
  onSeeAll?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  DEVIS: 'bg-[#0052CC]/10 text-[#0052CC]',
  FACTURE: 'bg-[#D4A843]/15 text-[#B8860B]',
  PROFORMA: 'bg-[#001A4D]/10 text-[#001A4D]',
};

export function RecentDocuments({ documents, onDocumentTap, onSeeAll }: RecentDocumentsProps) {
  const { t } = useMobileI18n();
  const recent = useMemo(() => documents.slice(0, 5), [documents]);

  if (recent.length === 0) {
    return (
      <div className="mx-4 rounded-xl border border-dashed border-[rgba(0,26,77,0.12)] bg-white p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0052CC]/5">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="6" width="24" height="32" rx="3" stroke="#0052CC" strokeWidth="2" opacity="0.25" />
            <rect x="16" y="14" width="24" height="32" rx="3" fill="white" stroke="#0052CC" strokeWidth="2" />
            <line x1="22" y1="22" x2="34" y2="22" stroke="#0052CC" strokeWidth="1.5" opacity="0.4" />
            <line x1="22" y1="28" x2="30" y2="28" stroke="#0052CC" strokeWidth="1.5" opacity="0.3" />
            <line x1="22" y1="34" x2="32" y2="34" stroke="#0052CC" strokeWidth="1.5" opacity="0.2" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-[#0052CC]">{t('docs.empty')}</h3>
        <p className="mt-1 text-xs text-[#718096]">{t('docs.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="mx-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096]">
          {t('docs.recent')}
        </h3>
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-xs font-bold text-[#0052CC] transition-colors duration-200 hover:text-[#DC3545] focus-visible:ring-2 focus-visible:ring-[#0052CC]/30 rounded"
        >
          {t('docs.seeAll')}
          <ArrowRight size={11} />
        </button>
      </div>
      <div className="space-y-1.5">
        {recent.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onDocumentTap?.(doc)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 text-left transition-all duration-200 hover:border-[#0052CC]/20 hover:shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0052CC]/30"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0052CC]/5 text-[#0052CC]">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#001A4D] truncate">{doc.number}</div>
              <div className="text-[11px] text-[#718096]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {doc.client?.name || t('common.unknownClient')} · {doc.totalTTC.toLocaleString('fr-DZ')}\u00a0DA
              </div>
            </div>
            <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_COLORS[doc.type] || TYPE_COLORS.DEVIS}`}>
              {doc.type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
