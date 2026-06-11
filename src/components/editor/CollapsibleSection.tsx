'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SectionId, BlockId } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronRight, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

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
  forceOpen?: boolean;
  forceClose?: boolean;
}

export function CollapsibleSection({ title, sectionId, blockId, visible, onToggle, sectionOrder, moveSection, children, defaultOpen = true, forceOpen, forceClose }: SectionProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = forceClose ? false : forceOpen ? true : localOpen;
  const setOpen = (v: boolean) => { if (!forceOpen && !forceClose) setLocalOpen(v); };
  const te = useTranslations('editor');
  const idx = sectionOrder.indexOf(sectionId);
  const canUp = idx > 0;
  const canDown = idx >= 0 && idx < sectionOrder.length - 1;

  return (
    <section className="bg-[var(--navy-2)] rounded-2xl border border-[rgba(245,237,214,0.08)] shadow-lg overflow-hidden transition-all hover:border-[rgba(245,237,214,0.15)]">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--navy-3)] border-b border-[rgba(245,237,214,0.06)]">
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col gap-0.5 mr-2">
            <button onClick={() => moveSection(sectionId, 'up')} disabled={!canUp}
              className={cn('p-0.5 rounded transition', canUp ? 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)]' : 'text-[rgba(245,237,214,0.05)] cursor-default')}>
              <ChevronUp size={12} />
            </button>
            <button onClick={() => moveSection(sectionId, 'down')} disabled={!canDown}
              className={cn('p-0.5 rounded transition', canDown ? 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)]' : 'text-[rgba(245,237,214,0.05)] cursor-default')}>
              <ChevronDown size={12} />
            </button>
          </div>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-3 group">
            <ChevronRight size={14} className={cn('text-[var(--green-3)] transition-transform duration-300', open ? 'rotate-90' : 'rotate-0')} />
            <span className="text-xs font-sora font-bold text-[var(--sand)] uppercase tracking-wider group-hover:text-white transition-colors">
              {title}
            </span>
          </button>
        </div>
        
        {blockId && (
          <button onClick={() => onToggle(blockId)}
            className={cn('p-2 rounded-xl transition-all', visible ? 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)]' : 'text-red-400 bg-red-400/10 hover:bg-red-400/20')}
            title={visible ? te('hideBlock') : te('showBlock')}>
            {visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
      
      {open && (
        <div className="p-5 animate-in">
          {children}
        </div>
      )}
    </section>
  );
}
