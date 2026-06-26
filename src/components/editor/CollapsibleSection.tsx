'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SectionId, BlockId } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronRight, Eye, EyeOff, GripVertical } from 'lucide-react';

export interface SectionProps {
  title: string;
  sectionId: string;
  blockId?: BlockId;
  visible: boolean;
  onToggle: (b: BlockId) => void;
  /** @deprecated replaced by drag-and-drop */
  sectionOrder?: SectionId[];
  /** @deprecated replaced by drag-and-drop */
  moveSection?: (id: SectionId, dir: 'up' | 'down') => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  forceClose?: boolean;
  // Drag & drop
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragOver?: boolean;
  isDragging?: boolean;
}

export function CollapsibleSection({
  title, sectionId, blockId, visible, onToggle, children,
  defaultOpen = true, forceOpen, forceClose,
  draggable, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver, isDragging,
}: SectionProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const te = useTranslations('editor');

  // Eye OFF → force-close content and disable interaction
  const eyeOff = !visible && !!blockId;
  const open = forceClose || eyeOff ? false : forceOpen ? true : localOpen;
  const setOpen = (v: boolean) => { if (!forceOpen && !forceClose && !eyeOff) setLocalOpen(v); };

  return (
    <section
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        'rounded-2xl border shadow-lg overflow-hidden transition-all select-none',
        eyeOff
          ? 'bg-[var(--navy-3)] border-[rgba(15,39,71,0.04)] opacity-55'
          : open
            ? 'bg-[var(--navy-2)] border-[rgba(37,99,235,0.18)]'
            : 'bg-[var(--navy-2)] border-[rgba(15,39,71,0.08)] hover:border-[rgba(15,39,71,0.15)]',
        isDragging && 'opacity-40 scale-[0.99]',
        isDragOver && 'ring-2 ring-[var(--green-2)]/50 border-[var(--green-2)]/30',
      )}
    >
      <div className="flex items-center gap-1 px-3.5 py-3 bg-[var(--navy-3)] border-b border-[rgba(15,39,71,0.06)]">

        {/* Drag handle */}
        {draggable && (
          <span className="shrink-0 cursor-grab active:cursor-grabbing text-[var(--sand-muted)] hover:text-[var(--sand)] transition-colors p-0.5 -ml-1">
            <GripVertical size={15} />
          </span>
        )}

        {/* Title + collapse toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={eyeOff}
          className={cn('flex items-center gap-2.5 min-w-0 group text-left flex-1', eyeOff && 'cursor-default')}
        >
          <span className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors',
            open && !eyeOff ? 'bg-[var(--green-glow)] text-[var(--green-3)]' : 'bg-[var(--navy-4)] text-[var(--sand-muted)]',
          )}>
            <ChevronRight size={14} className={cn('transition-transform duration-300', open && !eyeOff ? 'rotate-90' : 'rotate-0')} />
          </span>
          <span className={cn(
            'text-[13px] font-sora font-bold tracking-wide truncate transition-colors',
            eyeOff ? 'text-[var(--sand-muted)]' : 'text-[var(--sand)] group-hover:text-white',
          )}>
            {title}
          </span>
          {eyeOff && (
            <span className="text-[10px] text-[var(--sand-muted)]/60 font-normal ml-1 shrink-0">masqué</span>
          )}
        </button>

        {/* Eye toggle */}
        {blockId && (
          <button
            type="button"
            onClick={() => onToggle(blockId)}
            className={cn(
              'shrink-0 p-2 rounded-xl transition-all',
              visible
                ? 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)]'
                : 'text-red-400 bg-red-400/10 hover:bg-red-400/20',
            )}
            title={visible ? te('hideBlock') : te('showBlock')}
          >
            {visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>

      {open && !eyeOff && (
        <div className="p-5 animate-in">
          {children}
        </div>
      )}
    </section>
  );
}
