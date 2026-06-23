'use client';

// ============================================================
// CloudDevis Mobile — Stat Cards
// 2-card row: "Ce mois" count + "Payés" count
// ============================================================

import { IconFileText, IconCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardsProps {
  monthlyCount: number;
  paidCount: number;
}

export function StatCards({ monthlyCount, paidCount }: StatCardsProps) {
  return (
    <div className="flex gap-3 px-5">
      {/* Ce mois */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className={cn(
          'flex-1 rounded-2xl p-4',
          'bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)]',
        )}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(37,99,235,0.12)]">
            <IconFileText size={16} stroke={2} className="text-[var(--green-3)]" />
          </div>
          <span className="text-xs font-medium text-[var(--sand-muted)]">Ce mois</span>
        </div>
        <p className="text-2xl font-bold text-[var(--sand)]" style={{ fontFamily: 'Sora, sans-serif' }}>
          {monthlyCount}
        </p>
        <p className="text-[10px] text-[var(--sand-muted)] mt-0.5">documents</p>
      </motion.div>

      {/* Payés */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className={cn(
          'flex-1 rounded-2xl p-4',
          'bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)]',
        )}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(16,185,129,0.12)]">
            <IconCheck size={16} stroke={2.2} className="text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-[var(--sand-muted)]">Payés</span>
        </div>
        <p className="text-2xl font-bold text-[var(--sand)]" style={{ fontFamily: 'Sora, sans-serif' }}>
          {paidCount}
        </p>
        <p className="text-[10px] text-[var(--sand-muted)] mt-0.5">ce mois</p>
      </motion.div>
    </div>
  );
}
