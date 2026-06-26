'use client';
import { formatCurrency } from '@/lib/calculations';
import { useSectionContext } from './SectionProps';
import type { PaymentMode } from '@/types';

export function PaiementSection() {
  const { doc, updateDoc, updatePaymentDetails, hiddenFields, results, te, tc } = useSectionContext();
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {!hiddenFields.has('paymentMethod') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('paiement.method')}</label>
          <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
            value={doc.paymentMode} onChange={(e) => updateDoc('paymentMode', e.target.value as PaymentMode)}>
            <option value="cheque">{te('paiement.check')}</option><option value="virement">{te('paiement.transfer')}</option>
            <option value="especes">{te('paiement.cash')}</option><option value="cb">{te('paiement.card')}</option>
          </select></div>}
        {!hiddenFields.has('paymentDeposit') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('paiement.deposit')}</label>
          <input type="number" min="0" step="100" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
            value={doc.acompte ?? 0} onChange={(e) => updateDoc('acompte', parseFloat(e.target.value) || 0)} /></div>}
        {!hiddenFields.has('paymentConditions') && <div className="col-span-2"><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('paiement.conditions')}</label>
          <input type="text" placeholder={te('paiement.conditionsPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
            value={doc.paymentDetails.terms} onChange={(e) => updatePaymentDetails({ terms: e.target.value })} /></div>}
        {!hiddenFields.has('paymentIban') && <div className="col-span-2"><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('paiement.iban')}</label>
          <input type="text" placeholder={te('paiement.ibanPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] font-mono outline-none focus:ring-2 focus:ring-[var(--green-2)]"
            value={doc.paymentDetails.iban} onChange={(e) => updatePaymentDetails({ iban: e.target.value })} /></div>}
      </div>
      <div className="border-t border-[rgba(15,39,71,0.08)] pt-2 space-y-1">
        <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.totalHT')}</span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.subTotalHT, tc('currency'))}</span></div>
        {results.discountAmount > 0 && <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.remise')}</span><span className="font-semibold text-red-500">-{formatCurrency(results.discountAmount, tc('currency'))}</span></div>}
        {results.tvaRate > 0 && <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.vatLine', { rate: results.tvaRate })}</span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.tvaAmount, tc('currency'))}</span></div>}
        {results.timbreFiscal > 0 && <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.stampDuty')}</span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.timbreFiscal, tc('currency'))}</span></div>}
        {results.acompte > 0 && <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.depositPaid')}</span><span className="font-semibold text-red-500">-{formatCurrency(results.acompte, tc('currency'))}</span></div>}
        <div className="flex justify-between text-[11px] font-bold text-[var(--sand)] border-t border-[rgba(15,39,71,0.1)] pt-1"><span>{te('paiement.netToPay')}</span><span className="text-[var(--green-3)]">{formatCurrency(results.netAPayer, tc('currency'))}</span></div>
      </div>
    </>
  );
}
