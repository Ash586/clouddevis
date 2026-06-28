'use client';

// ============================================================
// CloudDevis Mobile — Step 1: Type Selection
// 2×2 grid of document type cards with large touch targets
// ============================================================

import { FileText, Receipt, ReceiptText, ClipboardList, PackageCheck, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DocumentType } from '@/mobile/types';

interface StepTypeSelectionProps {
  selectedType: DocumentType | null;
  onSelect: (type: DocumentType) => void;
}

interface TypeCard {
  type: DocumentType;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  /** Span both grid columns (used for the odd 5th card) */
  wide?: boolean;
}

const TYPE_CARDS: TypeCard[] = [
  {
    type: 'DEVIS',
    label: 'Devis',
    subtitle: 'Estimation / devis',
    icon: FileText,
  },
  {
    type: 'FACTURE',
    label: 'Facture',
    subtitle: 'Facturation',
    icon: Receipt,
  },
  {
    type: 'PROFORMA',
    label: 'Proforma',
    subtitle: 'Facture proforma',
    icon: ReceiptText,
  },
  {
    type: 'BC',
    label: 'Bon de Commande',
    subtitle: 'Commande',
    icon: ClipboardList,
  },
  {
    type: 'BR',
    label: 'Bon de Réception',
    subtitle: 'Réception de marchandises',
    icon: PackageCheck,
    wide: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

export function StepTypeSelection({ selectedType, onSelect }: StepTypeSelectionProps) {
  return (
    <div className="flex flex-col gap-5 px-5">
      {/* Header */}
      <div>
        <h2
          className="heading text-lg text-[var(--sand)]"
         
        >
          Type de document
        </h2>
        <p className="text-sm text-[var(--sand-muted)] mt-1">
          Choisissez le type de document à créer
        </p>
      </div>

      {/* 2×2 Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {TYPE_CARDS.map((card) => {
          const isSelected = selectedType === card.type;
          const Icon = card.icon;

          return (
            <motion.button
              key={card.type}
              variants={cardVariants}
              onClick={() => onSelect(card.type)}
              className={cn(
                'flex flex-col items-center justify-center gap-3 p-5 rounded-2xl',
                'min-h-[120px] active:scale-[0.97] transition-all duration-200',
                'border-2',
                card.wide && 'col-span-2',
                isSelected
                  ? 'border-[var(--green-2)] bg-[var(--blue-bg)]'
                  : 'border-[var(--border)] bg-[var(--navy-2)]',
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200',
                  isSelected
                    ? 'bg-[var(--green-2)] text-white'
                    : 'bg-[var(--navy-3)] text-[var(--sand-muted)]',
                )}
              >
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    'text-sm font-semibold transition-colors duration-200',
                    isSelected ? 'text-[var(--green-3)]' : 'text-[var(--sand)]',
                  )}
                >
                  {card.label}
                </p>
                <p className="text-[10px] text-[var(--sand-muted)] mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
