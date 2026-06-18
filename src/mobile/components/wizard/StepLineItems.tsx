'use client';

// ============================================================
// CloudDevis Mobile — Step 3: Line Items
// Item cards + bottom sheet editing + sticky totals
// ============================================================

import { useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconPlus,
  IconTrash,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { MobileBottomSheet } from '@/components/mobile/MobileBottomSheet';
import type { LineItem } from '@/mobile/types';

// ── Item form schema ──────────────────────────────────────────

const ItemFormSchema = z.object({
  label: z.string().min(1, 'Désignation requise'),
  quantity: z.number().positive('Quantité > 0'),
  unitPrice: z.number().positive('Prix > 0').max(1_000_000, 'Max 1 000 000 DA'),
  tvaRate: z.union([z.literal(0), z.literal(9), z.literal(19)]),
  unit: z.enum(['u', 'h', 'j', 'm2', 'm3', 'ml', 'kg', 'forfait']),
});

type ItemFormData = z.infer<typeof ItemFormSchema>;

const UNIT_OPTIONS = [
  { value: 'u', label: 'Unité' },
  { value: 'h', label: 'Heure' },
  { value: 'j', label: 'Jour' },
  { value: 'm2', label: 'm²' },
  { value: 'm3', label: 'm³' },
  { value: 'ml', label: 'ml' },
  { value: 'kg', label: 'kg' },
  { value: 'forfait', label: 'Forfait' },
];

const TVA_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 9, label: '9%' },
  { value: 19, label: '19%' },
];

// ── Format currency ───────────────────────────────────────────

function formatDA(n: number): string {
  return n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DA';
}

// ── Component ─────────────────────────────────────────────────

interface StepLineItemsProps {
  documentType: string;
}

export function StepLineItems({ documentType }: StepLineItemsProps) {
  const items = useDocumentStore((s) => s.currentDoc.items);
  const totals = useDocumentStore((s) => s.totals);
  const addItem = useDocumentStore((s) => s.addItem);
  const updateItem = useDocumentStore((s) => s.updateItem);
  const removeItem = useDocumentStore((s) => s.removeItem);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues: {
      label: '',
      quantity: 1,
      unitPrice: 0,
      tvaRate: 19,
      unit: 'u',
    },
  });

  const [watchedQty, watchedPrice, watchedTva] = useWatch({
    control,
    name: ['quantity', 'unitPrice', 'tvaRate'],
  });
  const liveTotal = (watchedQty || 0) * (watchedPrice || 0);

  // ── Open sheet for new item ──
  const openNewSheet = useCallback(() => {
    setEditingItem(null);
    reset({ label: '', quantity: 1, unitPrice: 0, tvaRate: 19, unit: 'u' });
    setSheetOpen(true);
  }, [reset]);

  // ── Open sheet for editing ──
  const openEditSheet = useCallback(
    (item: LineItem) => {
      setEditingItem(item);
      reset({
        label: item.label,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tvaRate: item.tvaRate,
        unit: item.unit,
      });
      setSheetOpen(true);
    },
    [reset],
  );

  // ── Submit item ──
  const onSubmitItem = useCallback(
    (data: ItemFormData) => {
      if (editingItem) {
        updateItem(editingItem.id, data);
      } else {
        addItem(data);
      }
      setSheetOpen(false);
      reset();
    },
    [editingItem, addItem, updateItem, reset],
  );

  // ── Delete item ──
  const handleDelete = useCallback(
    (id: string) => {
      removeItem(id);
      setSheetOpen(false);
    },
    [removeItem],
  );

  return (
    <div className="flex flex-col gap-4 px-5">
      {/* Header */}
      <div>
        <h2
          className="text-lg font-bold text-[var(--sand)]"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Articles
        </h2>
        <p className="text-sm text-[var(--sand-muted)] mt-1">
          Ajoutez les prestations ou produits
        </p>
      </div>

      {/* Item cards */}
      <div className="flex flex-col gap-2.5">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              onClick={() => openEditSheet(item)}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-2xl text-left w-full',
                'bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)]',
                'active:scale-[0.98] active:bg-[var(--navy-3)] transition-all',
              )}
            >
              {/* Index */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'rgba(11, 61, 46, 0.15)', color: '#0B3D2E' }}
              >
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--sand)] truncate">
                  {item.label}
                </p>
                <p className="text-[11px] text-[var(--sand-muted)] mt-0.5">
                  {item.quantity} × {formatDA(item.unitPrice)} · TVA {item.tvaRate}%
                </p>
              </div>

              {/* Total */}
              <p className="text-sm font-bold text-[var(--sand)] whitespace-nowrap">
                {formatDA(item.totalHT)}
              </p>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Add item button */}
      <button
        onClick={openNewSheet}
        className={cn(
          'flex items-center justify-center gap-2 h-12 rounded-xl',
          'border-2 border-dashed border-[rgba(245,237,214,0.12)]',
          'text-sm font-semibold text-[var(--sand-muted)]',
          'active:scale-[0.97] transition-all',
        )}
      >
        <IconPlus size={18} />
        Ajouter un article
      </button>

      {/* Timbre fiscal alert */}
      {totals.timbreFiscal && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20"
        >
          <IconAlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-400">
            <span className="font-semibold">Timbre fiscal</span> — Art. 220 CII : +1 000 DA
          </p>
        </motion.div>
      )}

      {/* Sticky totals footer */}
      <div
        className={cn(
          'sticky bottom-0 -mx-5 px-5 pt-3 pb-4',
          'bg-[var(--navy)] border-t border-[rgba(245,237,214,0.08)]',
        )}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-[var(--sand-muted)]">
            <span>Sous-total HT</span>
            <span>{formatDA(totals.subTotalHT)}</span>
          </div>
          <div className="flex justify-between text-xs text-[var(--sand-muted)]">
            <span>TVA</span>
            <span>{formatDA(totals.totalTVA)}</span>
          </div>
          {totals.timbreFiscal && (
            <div className="flex justify-between text-xs text-amber-400">
              <span>Timbre fiscal</span>
              <span>{formatDA(totals.timbreAmount)}</span>
            </div>
          )}
          <div className="h-px bg-[rgba(245,237,214,0.08)] my-1" />
          <div className="flex justify-between text-sm font-bold text-[var(--sand)]">
            <span>Total TTC</span>
            <span>{formatDA(totals.totalTTC)}</span>
          </div>
        </div>
      </div>

      {/* Bottom sheet for item editing */}
      <MobileBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingItem ? 'Modifier l\'article' : 'Nouvel article'}
      >
        <form
          onSubmit={handleSubmit(onSubmitItem)}
          className="flex flex-col gap-3 pb-4"
        >
          {/* Label */}
          <div>
            <input
              {...register('label')}
              placeholder="Désignation *"
              className={cn(
                'w-full h-11 px-3.5 rounded-xl text-sm',
                'bg-[var(--navy-3)] border text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
                errors.label ? 'border-red-400/50' : 'border-[rgba(245,237,214,0.08)]',
              )}
            />
            {errors.label && (
              <p className="text-[11px] text-red-400 mt-1">{errors.label.message}</p>
            )}
          </div>

          {/* Quantity + Unit row */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="Quantité"
                className={cn(
                  'w-full h-11 px-3.5 rounded-xl text-sm',
                  'bg-[var(--navy-3)] border text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
                  errors.quantity ? 'border-red-400/50' : 'border-[rgba(245,237,214,0.08)]',
                )}
              />
            </div>
            <select
              {...register('unit')}
              className={cn(
                'h-11 px-3 rounded-xl text-sm',
                'bg-[var(--navy-3)] border border-[rgba(245,237,214,0.08)]',
                'text-[var(--sand)] focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
              )}
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Unit price */}
          <div>
            <input
              type="number"
              step="0.01"
              {...register('unitPrice', { valueAsNumber: true })}
              placeholder="Prix unitaire (DA)"
              className={cn(
                'w-full h-11 px-3.5 rounded-xl text-sm',
                'bg-[var(--navy-3)] border text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]',
                errors.unitPrice ? 'border-red-400/50' : 'border-[rgba(245,237,214,0.08)]',
              )}
            />
            {errors.unitPrice && (
              <p className="text-[11px] text-red-400 mt-1">{errors.unitPrice.message}</p>
            )}
          </div>

          {/* TVA rate */}
          <div>
            <label className="text-xs text-[var(--sand-muted)] mb-1.5 block">TVA</label>
            <div className="flex gap-2">
              {TVA_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex-1 h-10 rounded-xl flex items-center justify-center text-sm font-semibold',
                    'border transition-all duration-200 cursor-pointer',
                    watchedTva === opt.value
                      ? 'bg-[#0B3D2E] border-[#0B3D2E] text-white'
                      : 'bg-[var(--navy-3)] border-[rgba(245,237,214,0.08)] text-[var(--sand-muted)]',
                  )}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('tvaRate', { valueAsNumber: true })}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Live total preview */}
          <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--navy)]">
            <span className="text-xs text-[var(--sand-muted)]">Total ligne</span>
            <span className="text-sm font-bold text-[var(--sand)]">
              {formatDA(liveTotal)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            {editingItem && (
              <button
                type="button"
                onClick={() => handleDelete(editingItem.id)}
                className={cn(
                  'h-11 px-4 rounded-xl flex items-center justify-center gap-1.5',
                  'bg-red-400/10 text-red-400 text-sm font-semibold',
                  'active:scale-[0.97] transition-transform',
                )}
              >
                <IconTrash size={16} />
                Supprimer
              </button>
            )}
            <button
              type="submit"
              className={cn(
                'flex-1 h-11 rounded-xl text-sm font-semibold text-white',
                'active:scale-[0.97] transition-transform',
              )}
              style={{
                background: '#0B3D2E',
                boxShadow: '0 2px 12px rgba(11, 61, 46, 0.3)',
              }}
            >
              {editingItem ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </MobileBottomSheet>
    </div>
  );
}
