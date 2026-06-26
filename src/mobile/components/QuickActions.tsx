'use client';

// ============================================================
// CloudDevis Mobile — Quick Action Buttons
// 3 buttons: Nouveau devis (primary), Facture, Dupliquer
// ============================================================

import { Plus, Receipt, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onNewDevis: () => void;
  onNewFacture: () => void;
  onDuplicate: () => void;
}

export function QuickActions({ onNewDevis, onNewFacture, onDuplicate }: QuickActionsProps) {
  return (
    <div className="flex gap-3 px-5">
      {/* Nouveau devis — primary green */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.18 }}
        onClick={onNewDevis}
        className={cn(
          'flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl',
          'min-h-[44px] active:scale-[0.97] transition-transform',
          'text-white font-semibold text-sm',
          'bg-gradient-to-br from-[var(--green-2)] to-[var(--green)]',
          'shadow-lg shadow-[rgba(37,99,235,0.3)]',
        )}
      >
        <Plus size={24} strokeWidth={2.2} />
        <span>Nouveau devis</span>
      </motion.button>

      {/* Facture — secondary */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.24 }}
        onClick={onNewFacture}
        className={cn(
          'flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl',
          'min-h-[44px] active:scale-[0.97] transition-transform',
          'bg-[var(--navy-3)] text-[var(--sand)] font-semibold text-sm',
          'border border-[rgba(15,39,71,0.08)]',
        )}
      >
        <Receipt size={22} strokeWidth={1.8} />
        <span>Facture</span>
      </motion.button>

      {/* Dupliquer — secondary */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.30 }}
        onClick={onDuplicate}
        className={cn(
          'flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl',
          'min-h-[44px] active:scale-[0.97] transition-transform',
          'bg-[var(--navy-3)] text-[var(--sand)] font-semibold text-sm',
          'border border-[rgba(15,39,71,0.08)]',
        )}
      >
        <Copy size={22} strokeWidth={1.8} />
        <span>Dupliquer</span>
      </motion.button>
    </div>
  );
}
