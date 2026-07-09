'use client';

import { ClientCombobox } from '@/components/editor/ClientCombobox';
import { validateNIF, validateNIS, validateRC, validateAI } from '@/lib/validation';
import { useSectionContext } from './SectionProps';
import type { PaymentMode } from '@/types';

const inputCls = 'w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]';
const labelCls = 'block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5';

export function ClientSection() {
  const { doc, mode, updateDoc, updateClientInfo, updateArtisanInfo, hiddenFields, te } = useSectionContext();

  return (
    <div className="space-y-2">
      {!hiddenFields.has('clientName') && <ClientCombobox value={doc.clientInfo.name} onSelect={(c) => updateClientInfo({ name: c.name, address: c.address ?? doc.clientInfo.address, phone: c.phone ?? doc.clientInfo.phone, email: c.email ?? doc.clientInfo.email, nif: c.nif ?? doc.clientInfo.nif, nis: c.nis ?? doc.clientInfo.nis, rc: c.rc ?? doc.clientInfo.rc, ai: c.ai ?? doc.clientInfo.ai })} placeholder={te('client.clientName')} />}
      {!hiddenFields.has('clientAddress') && <textarea placeholder={te('client.clientAddress')} className="w-full border p-2 rounded-lg text-[11px] h-12 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.address ?? ''} onChange={(e) => updateClientInfo({ address: e.target.value })} />}
      {!hiddenFields.has('clientPhone') && <input type="text" placeholder={te('client.clientPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.phone ?? ''} onChange={(e) => updateClientInfo({ phone: e.target.value })} />}

      {!hiddenFields.has('clientEmail') && <div className="flex items-center gap-2 pt-1">
        <input type="text" placeholder={te('client.companyEmail')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.email ?? ''} onChange={(e) => updateClientInfo({ email: e.target.value })} /></div>}

      {/* ── Identifiants fiscaux client ── */}
      <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.taxIds') || 'Identifiants fiscaux client'}</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>NIF</label>
            <input type="text" placeholder="00000000000" maxLength={11}
              className={doc.clientInfo.nif && !validateNIF(doc.clientInfo.nif) ? `${inputCls} border-red-300 focus:ring-red-500` : inputCls}
              value={doc.clientInfo.nif ?? ''} onChange={(e) => updateClientInfo({ nif: e.target.value })} />
            {doc.clientInfo.nif && !validateNIF(doc.clientInfo.nif) && <span className="text-[8px] text-red-500">11 chiffres requis</span>}
          </div>
          <div>
            <label className={labelCls}>NIS</label>
            <input type="text" placeholder="0000000000" maxLength={10}
              className={doc.clientInfo.nis && !validateNIS(doc.clientInfo.nis) ? `${inputCls} border-red-300 focus:ring-red-500` : inputCls}
              value={doc.clientInfo.nis ?? ''} onChange={(e) => updateClientInfo({ nis: e.target.value })} />
            {doc.clientInfo.nis && !validateNIS(doc.clientInfo.nis) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
          </div>
          <div>
            <label className={labelCls}>AI</label>
            <input type="text" placeholder="0000000000" maxLength={10}
              className={doc.clientInfo.ai && !validateAI(doc.clientInfo.ai) ? `${inputCls} border-red-300 focus:ring-red-500` : inputCls}
              value={doc.clientInfo.ai ?? ''} onChange={(e) => updateClientInfo({ ai: e.target.value })} />
            {doc.clientInfo.ai && !validateAI(doc.clientInfo.ai) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
          </div>
          <div>
            <label className={labelCls}>RC</label>
            <input type="text" placeholder="16/00-0000000"
              className={doc.clientInfo.rc && !validateRC(doc.clientInfo.rc) ? `${inputCls} border-red-300 focus:ring-red-500` : inputCls}
              value={doc.clientInfo.rc ?? ''} onChange={(e) => updateClientInfo({ rc: e.target.value })} />
            {doc.clientInfo.rc && !validateRC(doc.clientInfo.rc) && <span className="text-[8px] text-red-500">Format RC invalide</span>}
          </div>
        </div>
      </div>

      {/* ── TAUX TVA ── */}
      <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('general.vatRate')}</h4>
        {!hiddenFields.has('vatRate') && <select className={inputCls} value={doc.tvaRate} onChange={(e) => updateDoc('tvaRate', Number(e.target.value))}>
          <option value="19">{te('general.vat19')}</option><option value="9">{te('general.vat9')}</option><option value="0">{te('general.vat0')}</option></select>}
      </div>

      {/* ── Mode de Paiement ── */}
      <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('paiement.method')}</h4>
        {!hiddenFields.has('paymentMethod') && <select className={inputCls} value={doc.paymentMode} onChange={(e) => updateDoc('paymentMode', e.target.value as PaymentMode)}>
          <option value="cheque">{te('paiement.check')}</option><option value="virement">{te('paiement.transfer')}</option>
          <option value="especes">{te('paiement.cash')}</option><option value="cb">{te('paiement.card')}</option>
        </select>}
      </div>

      {mode === 'artisan' && doc.artisanInfo && <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.yourInfo')}</h4>
        <input type="text" placeholder={te('client.yourName')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.name} onChange={(e) => updateArtisanInfo({ name: e.target.value })} />
        <input type="text" placeholder={te('client.yourAddress')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.address} onChange={(e) => updateArtisanInfo({ address: e.target.value })} />
        <input type="text" placeholder={te('client.yourPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.phone ?? ''} onChange={(e) => updateArtisanInfo({ phone: e.target.value })} />
      </div>}
    </div>
  );
}
