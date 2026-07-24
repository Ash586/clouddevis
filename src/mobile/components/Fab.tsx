'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, FileText, Receipt } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { openEditor } from '@/mobile/lib/editorLauncher';

export function Fab() {
  const { t } = useMobileI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-[72px] right-4 z-50 flex flex-col items-end gap-3">
      {/* Expanded menu */}
      {open && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            type="button"
            onClick={() => { setOpen(false); openEditor({ type: 'facture' }); }}
            className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-2xl bg-white border border-[rgba(15,39,71,0.08)] shadow-lg shadow-[rgba(15,39,71,0.12)] text-sm font-semibold text-[#0F2747] hover:bg-[#EDF2FB] transition-all"
          >
            <span className="text-xs text-[#5A6B85]">{t('dashboard.docFacture')}</span>
            <div className="w-8 h-8 rounded-xl bg-[rgba(37,99,235,0.1)] flex items-center justify-center">
              <Receipt size={14} className="text-[#2563EB]" />
            </div>
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); openEditor({ type: 'devis' }); }}
            className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-2xl bg-white border border-[rgba(15,39,71,0.08)] shadow-lg shadow-[rgba(15,39,71,0.12)] text-sm font-semibold text-[#0F2747] hover:bg-[#EDF2FB] transition-all"
          >
            <span className="text-xs text-[#5A6B85]">{t('dashboard.docDevis')}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileText size={14} className="text-blue-500" />
            </div>
          </button>
        </div>
      )}

      {/* Main FAB */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
          open
            ? 'bg-[#0F2747] shadow-[rgba(15,39,71,0.3)] rotate-45'
            : 'bg-[#2563EB] shadow-[rgba(37,99,235,0.35)]'
        }`}
      >
        {open ? <X size={22} className="text-white" /> : <Plus size={22} className="text-white" />}
      </button>
    </div>
  );
}
