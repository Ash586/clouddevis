'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import type { LineItem, DocumentType } from '@/mobile/types';

interface CreateScreenProps {
  onExit: () => void;
  editingDocId?: string;
  onConfigureCompany?: () => void;
}

export function CreateScreen({ onExit, editingDocId, onConfigureCompany }: CreateScreenProps) {
  const { t } = useMobileI18n();
  const [docType, setDocType] = useState<DocumentType>('FACTURE');
  const [clientName, setClientName] = useState('');
  const [clientNif, setClientNif] = useState('');
  const [items, setItems] = useState<Partial<LineItem>[]>([{ label: '', quantity: 1, unitPrice: 0, unit: 'u', tvaRate: 19, totalHT: 0 }]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const addItem = () => setItems((prev) => [...prev, { label: '', quantity: 1, unitPrice: 0, unit: 'u', tvaRate: 19, totalHT: 0 }]);

  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = Number(field === 'quantity' ? value : next[idx].quantity);
        const p = Number(field === 'unitPrice' ? value : next[idx].unitPrice);
        next[idx].totalHT = q * p;
      }
      return next;
    });
  };

  const removeItem = (idx: number) => { if (items.length > 1) setItems((prev) => prev.filter((_, i) => i !== idx)); };

  const totalHT = items.reduce((sum, item) => sum + (item.totalHT || 0), 0);
  const totalTVA = items.reduce((sum, item) => sum + ((item.totalHT || 0) * (item.tvaRate || 0) / 100), 0);
  const totalTTC = totalHT + totalTVA;

  const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); onExit(); }, 800); };

  const inputCls = 'w-full rounded-lg border border-[rgba(0,26,77,0.08)] bg-[#F0F4FF] px-3 py-2 text-sm text-[#001A4D] placeholder-[#718096] transition-all duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15';
  const labelCls = 'block text-[11px] font-bold text-[#4A5568] mb-0.5';

  return (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col h-full bg-[#F8FAFD]">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[rgba(0,26,77,0.06)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#001A4D] via-[#0052CC] to-[#001A4D]" />
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <button onClick={onExit} aria-label="Retour" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4A5568] hover:bg-[#F5F7FA] transition-colors duration-150">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-sm font-extrabold text-[#001A4D]">
              {editingDocId ? t('editor.edit') : t('editor.new')}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-8 items-center gap-1 rounded-lg bg-[#0052CC] px-3 text-[11px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? '...' : t('editor.save')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3">
          <label className={labelCls}>{t('editor.docType')}</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['DEVIS', 'FACTURE', 'PROFORMA'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setDocType(type)}
                className={cn(
                  'rounded-lg py-2 text-[11px] font-bold transition-all duration-150 active:scale-[0.97]',
                  docType === type
                    ? 'bg-[#0052CC] text-white shadow-sm'
                    : 'border border-[rgba(0,26,77,0.06)] bg-white text-[#4A5568] hover:bg-[#E6F0FF]',
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 space-y-2">
          <h3 className="text-xs font-bold text-[#001A4D]">{t('editor.client')}</h3>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" className={inputCls} />
          <input value={clientNif} onChange={(e) => setClientNif(e.target.value)} placeholder="NIF (optional)" dir="ltr" className={inputCls} />
        </div>

        <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#001A4D]">Articles</h3>
            <button onClick={addItem} className="flex items-center gap-1 text-[11px] font-bold text-[#0052CC] transition-colors duration-150 hover:text-[#0047B3]">
              <Plus size={12} /> {t('editor.addLine')}
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-[rgba(0,26,77,0.06)] bg-[#F0F4FF] p-2.5 space-y-1.5">
              <div className="flex items-start gap-1.5">
                <input
                  value={item.label || ''}
                  onChange={(e) => updateItem(idx, 'label', e.target.value)}
                  placeholder={t('editor.designation')}
                  className="flex-1 rounded border border-[rgba(0,26,77,0.06)] bg-white px-2.5 py-1.5 text-xs text-[#001A4D] placeholder-[#718096] focus:border-[#0052CC] focus:outline-none transition-colors duration-150"
                />
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} aria-label="Supprimer" className="mt-0.5 text-[#DC3545] hover:text-[#B23030] transition-colors duration-150">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] font-bold text-[#718096]">{t('editor.qty')}</label>
                  <input type="number" value={item.quantity || 1} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} className="w-full rounded border border-[rgba(0,26,77,0.06)] bg-white px-1.5 py-1 text-[11px] text-[#001A4D] focus:border-[#0052CC] focus:outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-[#718096]">{t('editor.unitPrice')}</label>
                  <input type="number" value={item.unitPrice || 0} onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))} className="w-full rounded border border-[rgba(0,26,77,0.06)] bg-white px-1.5 py-1 text-[11px] text-[#001A4D] focus:border-[#0052CC] focus:outline-none" dir="ltr" />
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-[11px] font-bold text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{(item.totalHT || 0).toLocaleString('fr-DZ')} DA</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#718096]">Total HT</span>
            <span className="font-bold text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalHT.toLocaleString('fr-DZ')} DA</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#718096]">TVA</span>
            <span className="font-bold text-[#001A4D]" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTVA.toLocaleString('fr-DZ')} DA</span>
          </div>
          <div className="h-px bg-[rgba(0,26,77,0.06)]" />
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[#001A4D]">Total TTC</span>
            <span className="font-bold text-[#0052CC]" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTTC.toLocaleString('fr-DZ')} DA</span>
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3">
          <label className={labelCls}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes optionnelles..."
            rows={2}
            className="w-full rounded-lg border border-[rgba(0,26,77,0.08)] bg-[#F0F4FF] px-3 py-2 text-xs text-[#001A4D] placeholder-[#718096] transition-all duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15 resize-none"
          />
        </div>
      </div>

      <div className="border-t border-[rgba(0,26,77,0.06)] bg-white px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <button
            onClick={onExit}
            className="flex-1 rounded-lg border border-[rgba(0,26,77,0.08)] py-2.5 text-xs font-bold text-[#4A5568] hover:bg-[#E6F0FF] transition-colors duration-150 active:scale-[0.97]"
          >
            {t('editor.exitCancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-[#0052CC] py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? '...' : t('editor.downloadPdf')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
