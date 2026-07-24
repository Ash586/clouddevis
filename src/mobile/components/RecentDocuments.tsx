'use client';

import { useMemo } from 'react';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import type { Document } from '@/mobile/types';

interface RecentDocumentsProps {
  documents: Document[];
  onDocumentTap?: (doc: Document) => void;
  onSeeAll?: () => void;
}

export function RecentDocuments({ documents, onDocumentTap, onSeeAll }: RecentDocumentsProps) {
  const { t } = useMobileI18n();

  const recent = useMemo(() => documents.slice(0, 5), [documents]);

  if (recent.length === 0) {
    return (
      <div className="mx-5 rounded-xl border-2 border-dashed border-[rgba(15,39,71,0.09)] bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB]/5">
          <FileText size={28} className="text-[#2563EB]/30" />
        </div>
        <h3 className="text-sm font-bold text-[#2563EB]">{t('docs.empty')}</h3>
        <p className="mt-1 text-xs text-[#5A6B85]">{t('docs.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="mx-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#33425C]">
          {t('docs.recent')}
        </h3>
        <button onClick={onSeeAll} className="flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#E8542E] transition-colors">
          {t('docs.seeAll')}
          <ArrowRight size={12} />
        </button>
      </div>
      <div className="space-y-2">
        {recent.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onDocumentTap?.(doc)}
            className="flex w-full items-center gap-3 rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-3 text-left transition-all hover:border-[#E8542E]/30 hover:bg-[#EDF2FB] active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/5 text-[#2563EB]">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#2563EB] truncate">{doc.number}</div>
              <div className="text-xs text-[#5A6B85]">
                {doc.client?.name || t('common.unknownClient')} Â· {doc.totalTTC.toLocaleString('fr-DZ')} DA
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB]">
              {doc.type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
