'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, FileText, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useDocumentStore } from '@/stores/documentStore';
import { generatePDFBase64 } from '@/mobile/lib/pdf';
import type { Document, LineItem, DocumentType } from '@/mobile/types';

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

  const addItem = () => {
    setItems((prev) => [...prev, { label: '', quantity: 1, unitPrice: 0, unit: 'u', tvaRate: 19, totalHT: 0 }]);
  };

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

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalHT = items.reduce((sum, item) => sum + (item.totalHT || 0), 0);
  const totalTVA = items.reduce((sum, item) => sum + ((item.totalHT || 0) * (item.tvaRate || 0) / 100), 0);
  const totalTTC = totalHT + totalTVA;

  const handleSave = async () => {
    setSaving(true);
    // Save logic will be handled by the parent
    setTimeout(() => {
      setSaving(false);
      onExit();
    }, 1000);
  };

  const inputCls = 'w-full rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] px-3 py-2.5 text-sm text-[#2563EB] placeholder-[#5A6B85] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15';
  const labelCls = 'block text-xs font-bold text-[#33425C] mb-1';

  return (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full bg-[#F3F6FC]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[rgba(15,39,71,0.09)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-[#2563EB] via-[#1E40AF] to-[#2563EB]" />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#33425C] hover:bg-[#F3F6FC]">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-extrabold text-[#2563EB]">
              {editingDocId ? t('editor.edit') : t('editor.new')}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? '...' : t('editor.save')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Doc type */}
        <div className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4">
          <label className={labelCls}>{t('editor.docType')}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['DEVIS', 'FACTURE', 'PROFORMA'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setDocType(type)}
                className={cn(
                  'rounded-lg py-2.5 text-xs font-bold transition-all active:scale-[0.97]',
                  docType === type
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'border border-[rgba(15,39,71,0.09)] bg-white text-[#33425C] hover:bg-[#EDF2FB]',
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Client */}
        <div className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#2563EB]">{t('editor.client')}</h3>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" className={inputCls} />
          <input value={clientNif} onChange={(e) => setClientNif(e.target.value)} placeholder="NIF (optional)" dir="ltr" className={inputCls} />
        </div>

        {/* Items */}
        <div className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2563EB]">Articles</h3>
            <button onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-[#2563EB]">
              <Plus size={14} /> {t('editor.addLine')}
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] p-3 space-y-2">
              <div className="flex items-start gap-2">
                <input
                  value={item.label || ''}
                  onChange={(e) => updateItem(idx, 'label', e.target.value)}
                  placeholder={t('editor.designation')}
                  className="flex-1 rounded border border-[rgba(15,39,71,0.09)] bg-white px-3 py-2 text-sm text-[#2563EB] placeholder-[#5A6B85] focus:border-[#2563EB] focus:outline-none"
                />
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="mt-1 text-[#E8542E] hover:text-[#C43D1C]">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#5A6B85]">{t('editor.qty')}</label>
                  <input type="number" value={item.quantity || 1} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} className="w-full rounded border border-[rgba(15,39,71,0.09)] bg-white px-2 py-1.5 text-xs text-[#2563EB] focus:border-[#2563EB] focus:outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#5A6B85]">{t('editor.unitPrice')}</label>
                  <input type="number" value={item.unitPrice || 0} onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))} className="w-full rounded border border-[rgba(15,39,71,0.09)] bg-white px-2 py-1.5 text-xs text-[#2563EB] focus:border-[#2563EB] focus:outline-none" dir="ltr" />
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-xs font-bold text-[#2563EB]">{(item.totalHT || 0).toLocaleString('fr-DZ')} DA</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#33425C]">Total HT</span>
            <span className="font-bold text-[#2563EB]">{totalHT.toLocaleString('fr-DZ')} DA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#33425C]">TVA</span>
            <span className="font-bold text-[#2563EB]">{totalTVA.toLocaleString('fr-DZ')} DA</span>
          </div>
          <div className="h-px bg-[rgba(15,39,71,0.09)]" />
          <div className="flex justify-between text-sm">
            <span className="font-bold text-[#2563EB]">Total TTC</span>
            <span className="font-bold text-[#2563EB]">{totalTTC.toLocaleString('fr-DZ')} DA</span>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4">
          <label className={labelCls}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={3}
            className="w-full rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] px-3 py-2.5 text-sm text-[#2563EB] placeholder-[#5A6B85] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 resize-none"
          />
        </div>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-[rgba(15,39,71,0.09)] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          <button
            onClick={onExit}
            className="flex-1 rounded-lg border border-[rgba(15,39,71,0.09)] py-3 text-sm font-bold text-[#33425C] hover:bg-[#EDF2FB] transition-colors active:scale-[0.97]"
          >
            {t('editor.exitCancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-[#2563EB] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? '...' : t('editor.downloadPdf')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
