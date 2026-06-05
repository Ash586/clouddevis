'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SectionId, BlockId } from '@/types';
import { cn } from '@/lib/utils';

export interface SectionProps {
  title: string;
  sectionId: SectionId;
  blockId?: BlockId;
  visible: boolean;
  onToggle: (b: BlockId) => void;
  sectionOrder: SectionId[];
  moveSection: (id: SectionId, dir: 'up' | 'down') => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ title, sectionId, blockId, visible, onToggle, sectionOrder, moveSection, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const te = useTranslations('editor');
  const idx = sectionOrder.indexOf(sectionId);
  const canUp = idx > 0;
  const canDown = idx >= 0 && idx < sectionOrder.length - 1;
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-0.5">
          <button onClick={() => moveSection(sectionId, 'up')} disabled={!canUp}
            className={cn('text-[9px] leading-none p-0.5 rounded', canUp ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-200 cursor-default')}>▲</button>
          <button onClick={() => moveSection(sectionId, 'down')} disabled={!canDown}
            className={cn('text-[9px] leading-none p-0.5 rounded', canDown ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-200 cursor-default')}>▼</button>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider hover:text-slate-900 ml-1">
            <span className="text-[10px] text-slate-400 transition-transform" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            {title}
          </button>
        </div>
        {blockId && (
          <button onClick={() => onToggle(blockId)}
            className={cn('px-1.5 py-0.5 rounded-md transition', visible ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200' : 'text-red-400 bg-red-50 hover:bg-red-100')}
            title={visible ? te('hideBlock') : te('showBlock')}>
            {visible ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            )}
          </button>
        )}
      </div>
      {open && <div className="p-3 space-y-2">{children}</div>}
    </section>
  );
}
