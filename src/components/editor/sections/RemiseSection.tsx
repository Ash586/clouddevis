'use client';
import type { SectionProps } from './SectionProps';
import { formatCurrency } from '@/lib/calculations';

export function RemiseSection({ doc, updateDiscount, hiddenFields, results, te, tc }: SectionProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 items-end">
        {!hiddenFields.has('remiseType') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('remise.type')}</label>
          <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.discount.type} onChange={(e) => updateDiscount({ type: e.target.value as 'percentage' | 'fixed' })}>
            <option value="percentage">{te('remise.pct')}</option><option value="fixed">{te('remise.amount')}</option></select></div>}
        {!hiddenFields.has('remiseValue') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{doc.discount.type === 'percentage' ? te('remise.valuePct') : te('remise.valueDA')}</label>
          <input type="number" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.discount.value} onChange={(e) => updateDiscount({ value: parseFloat(e.target.value) || 0 })} /></div>}
        {!hiddenFields.has('remiseReason') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('remise.reason')}</label>
          <input type="text" placeholder={te('remise.reasonPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.discount.reason} onChange={(e) => updateDiscount({ reason: e.target.value })} /></div>}
      </div>
      {doc.discount.value > 0 && <div className="text-[10px] text-green-700 bg-green-50 p-2 rounded-lg font-medium">
        {te('remise.display')} {doc.discount.type === 'percentage' ? `${doc.discount.value}%` : `${formatCurrency(doc.discount.value, tc('currency'))}`}{doc.discount.reason ? ` (${doc.discount.reason})` : ''} : -{formatCurrency(results.discountAmount, tc('currency'))}</div>}
    </div>
  );
}
