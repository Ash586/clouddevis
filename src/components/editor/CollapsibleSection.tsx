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
    <section className={cn(
      'bg-[var(--navy-2)] rounded-2xl border shadow-lg overflow-hidden transition-all',
      open ? 'border-[rgba(37,99,235,0.18)]' : 'border-[rgba(15,39,71,0.08)] hover:border-[rgba(15,39,71,0.15)]',
    )}>
      <div className="flex items-center justify-between px-3.5 py-3 bg-[var(--navy-3)] border-b border-[rgba(15,39,71,0.06)]">
        <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2.5 min-w-0 group text-left flex-1">
          <span className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors',
            open ? 'bg-[var(--green-glow)] text-[var(--green-3)]' : 'bg-[var(--navy-4)] text-[var(--sand-muted)]',
          )}>
            <ChevronRight size={14} className={cn('transition-transform duration-300', open ? 'rotate-90' : 'rotate-0')} />
          </span>
          <span className="text-[13px] font-sora font-bold text-[var(--sand)] tracking-wide truncate group-hover:text-white transition-colors">
            {title}
          </span>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <div className="flex flex-col mr-1">
            <button type="button" onClick={() => moveSection(sectionId, 'up')} disabled={!canUp}
              className={cn('p-0.5 rounded transition', canUp ? 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)]' : 'text-[rgba(15,39,71,0.08)] cursor-default')}>
              <ChevronUp size={13} />
            </button>
            <button type="button" onClick={() => moveSection(sectionId, 'down')} disabled={!canDown}
              className={cn('p-0.5 rounded transition', canDown ? 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)]' : 'text-[rgba(15,39,71,0.08)] cursor-default')}>
              <ChevronDown size={13} />
            </button>
          </div>
          {blockId && (
            <button type="button" onClick={() => onToggle(blockId)}
              className={cn('p-2 rounded-xl transition-all', visible ? 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)]' : 'text-red-400 bg-red-400/10 hover:bg-red-400/20')}
              title={visible ? te('hideBlock') : te('showBlock')}>
              {visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="p-5 animate-in">
          {children}
        </div>
      )}
    </section>
  );
}
