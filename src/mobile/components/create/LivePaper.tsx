'use client';

// ============================================================
// Rakmana Mobile — FlashFacture: Live Invoice Paper
// The document IS the form. This read-zone renders the real
// invoice that grows as the user edits via the dock below.
// Tapping any zone asks the parent to morph the dock — it never
// navigates away. Totals count up; the timbre row slides in.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, UserPlus, Pencil, ChevronRight, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSyncStore } from '@/stores/syncStore';
import { DOCUMENT_TYPE_LABELS } from '@/mobile/types';
import type { DocumentType, Client, LineItem } from '@/mobile/types';
import type { DocumentCalculationResult } from '@/lib/dgi';

function formatDA(n: number): string {
  return n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DA';
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '—';
}

/** Smoothly tween a number toward `value` (count-up effect). */
function useCountUp(value: number, duration = 280): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const k = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(from + (value - from) * eased);
      if (k < 1) raf = requestAnimationFrame(step);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

interface LivePaperProps {
  type: DocumentType;
  docNumber: string;
  dateLabel: string;
  editing: boolean;
  client: Partial<Client>;
  items: LineItem[];
  totals: DocumentCalculationResult;
  activeZone: 'type' | 'client' | 'details' | 'line' | null;
  activeLineId: string | null;
  onTapType: () => void;
  onTapClient: () => void;
  onTapDetails: () => void;
  onTapLine: (id: string) => void;
}

export function LivePaper({
  type, docNumber, dateLabel, editing, client, items, totals,
  activeZone, activeLineId, onTapType, onTapClient, onTapDetails, onTapLine,
}: LivePaperProps) {
  const net = useCountUp(totals.netAPayer);
  const pendingSync = useSyncStore((s) => s.queue.length > 0);
  // Client becomes visually "required" once work has started —
  // amber (guidance), not red (the user hasn't made an error).
  const clientRequired = !client?.name && items.length > 0;

  return (
    <div className="flex-1 overflow-hidden px-3 pt-3">
      <div className="h-full flex flex-col overflow-hidden rounded-2xl bg-[var(--navy-2)] border border-[var(--border)]">
        {/* Header: type pill · number · date */}
        <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-3 border-b border-[var(--border)]">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onTapType}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                'bg-[var(--blue-bg)] text-[var(--green-2)] active:scale-95 transition-transform',
                activeZone === 'type' && 'ring-2 ring-[var(--accent-ring)]',
              )}
            >
              {DOCUMENT_TYPE_LABELS[type]}
              <ChevronRight size={13} className="rotate-90 rtl:rotate-90" />
            </button>
            <p className="mono text-[11px] text-[var(--sand-muted)] mt-1.5">{docNumber}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[var(--sand-muted)]">{dateLabel}</span>
            {editing && (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[var(--navy-3)] text-[var(--sand-muted)]">
                ÉDITION
              </span>
            )}
          </div>
        </div>

        {/* Client chip */}
        <button
          type="button"
          onClick={onTapClient}
          className={cn(
            'flex items-center gap-2.5 mx-4 mt-3 px-3 py-2.5 rounded-xl text-left min-h-[52px]',
            'active:scale-[0.99] transition-transform',
            client?.name
              ? 'bg-[var(--blue-bg)] border border-[var(--accent-ring)]'
              : clientRequired
                ? 'bg-amber-400/5 border border-dashed border-amber-400/50'
                : 'bg-[var(--navy-3)] border border-dashed border-[var(--border-2)]',
            activeZone === 'client' && 'ring-2 ring-[var(--accent-ring)]',
          )}
          aria-label={client?.name ? 'Modifier le client' : 'Ajouter un client'}
        >
          {client?.name ? (
            <>
              <span className="w-8 h-8 rounded-full bg-[var(--green-2)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {initials(client.name)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-[var(--sand)] truncate">{client.name}</span>
              
              </span>
              <Pencil size={15} className="text-[var(--sand-muted)] shrink-0" />
            </>
          ) : (
            <>
              <span className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                clientRequired ? 'bg-amber-400/15 text-amber-400' : 'bg-[var(--navy-4)] text-[var(--sand-muted)]',
              )}>
                <UserPlus size={16} />
              </span>
              <span className={cn(
                'flex-1 text-sm font-semibold',
                clientRequired ? 'text-amber-400' : 'text-[var(--sand-muted)]',
              )}>
                {clientRequired ? 'Client requis' : 'Ajouter un client'}
              </span>
            </>
          )}
        </button>

        {/* Items */}
        <p className="px-4 mt-3.5 mb-1.5 text-[10px] uppercase tracking-wide text-[var(--sand-muted)]">
          Articles {items.length > 0 && `(${items.length})`}
        </p>
        <div className="flex-1 overflow-y-auto px-4 pb-2 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                onClick={() => onTapLine(item.id)}
                className={cn(
                  'flex items-center gap-2 text-left rounded-xl px-3 py-2.5',
                  'bg-[var(--navy-3)] active:scale-[0.99] transition-transform',
                  activeZone === 'line' && activeLineId === item.id && 'ring-2 ring-[var(--accent-ring)]',
                )}
              >
                <span className="text-[11px] font-bold text-[var(--green-2)] w-4 shrink-0">{i + 1}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-[var(--sand)] truncate">{item.label}</span>
                  <span className="block text-[10px] text-[var(--sand-muted)]">
                    {item.quantity} × {item.unitPrice.toLocaleString('fr-DZ')} · TVA {item.tvaRate}%
                  </span>
                </span>
                <span className="text-sm font-semibold text-[var(--sand)] whitespace-nowrap">
                  {formatDA(item.totalHT)}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText size={26} className="text-[var(--sand-muted)] mb-2" strokeWidth={1.5} />
              <p className="text-xs text-[var(--sand-muted)] max-w-[180px]">
                Ajoutez vos articles depuis le clavier ci-dessous
              </p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-[var(--border)] bg-[var(--navy-3)] px-4 py-3">
          <div className="flex justify-between text-[11px] text-[var(--sand-muted)]">
            <span>Total HT</span><span>{formatDA(totals.subTotalHT)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-[var(--sand-muted)] mt-1">
            <span>TVA</span><span>{formatDA(totals.totalTVA)}</span>
          </div>
          <AnimatePresence initial={false}>
            {totals.timbreFiscal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-between text-[11px] text-[var(--gold)] mt-1 overflow-hidden"
              >
                <span>Timbre fiscal</span><span>{formatDA(totals.timbreAmount)}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-[var(--border-2)]">
            <button
              type="button"
              onClick={onTapDetails}
              className={cn(
                'text-[11px] font-semibold text-[var(--green-2)] active:opacity-70',
                activeZone === 'details' && 'underline',
              )}
            >
              Détails
            </button>
            <span className="flex items-center gap-2">
              {pendingSync && (
                <CloudOff size={14} className="text-[var(--gold)]" aria-label="En attente de synchronisation" />
              )}
              <span className="text-xl font-bold text-[var(--green-2)] heading">{formatDA(net)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
