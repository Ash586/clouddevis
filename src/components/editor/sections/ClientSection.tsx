'use client';

import { ClientCombobox } from '@/components/editor/ClientCombobox';
import { validateNIF, validateNIS, validateRC, validateAI } from '@/lib/validation';
import { useSectionContext } from './SectionProps';
import type { PaymentMode } from '@/types';

const inputCls = 'w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]';
const labelCls = 'block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5';

export function ClientSection() {
  const { doc, mode, updateDoc, updateClientInfo, updateCompanyInfo, updateArtisanInfo, updateTaxIds, hiddenFields, te } = useSectionContext();
  const tax = doc.companyInfo?.taxIds ?? { nif: '', nis: '', rc: '', ai: '' };

  return (
    <div className="space-y-2">
      {!hiddenFields.has('clientName') && <ClientCombobox value={doc.clientInfo.name} onSelect={(c) => updateClientInfo({ name: c.name, address: c.address ?? doc.clientInfo.address, phone: c.phone ?? doc.clientInfo.phone, email: c.email ?? doc.clientInfo.email, nif: c.nif ?? doc.clientInfo.nif, nis: c.nis ?? doc.clientInfo.nis, rc: c.rc ?? doc.clientInfo.rc, ai: c.ai ?? doc.clientInfo.ai })} placeholder={te('client.clientName')} />}
      {!hiddenFields.has('clientAddress') && <textarea placeholder={te('client.clientAddress')} className="w-full border p-2 rounded-lg text-[11px] h-12 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.address ?? ''} onChange={(e) => updateClientInfo({ address: e.target.value })} />}
      {!hiddenFields.has('clientPhone') && <input type="text" placeholder={te('client.clientPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.phone ?? ''} onChange={(e) => updateClientInfo({ phone: e.target.value })} />}

      {!hiddenFields.has('clientEmail') && <div className="flex items-center gap-2 pt-1">
        <input type="text" placeholder={te('client.companyEmail')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.email ?? ''} onChange={(e) => updateClientInfo({ email: e.target.value })} /></div>}

      {/* ── TAUX TVA ── */}
      <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('general.vatRate')}</h4>
        {!hiddenFields.has('vatRate') && <select className={inputCls} value={doc.tvaRate} onChange={(e) => updateDoc('tvaRate', Number(e.target.value))}>
          <option value="19">{te('general.vat19')}</option><option value="9">{te('general.vat9')}</option><option value="0">{te('general.vat0')}</option></select>}
      </div>

      {/* ── Identifiants fiscaux (entreprise) ── */}
      {mode === 'entreprise' && (
        <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
          <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">Identifiants fiscaux</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>NIF (Id Fiscal)</label>
              <input type="text" placeholder="00000000000" maxLength={11}
                className={tax.nif && !validateNIF(tax.nif) ? `${inputCls} border-red-300 focus:ring-red-500` : inputCls}
                value={tax.nif} onChange={(e) => updateTaxIds({ nif: e.target.value })} />
              {tax.nif && !validateNIF(tax.nif) && <span className="text-[8px] text-red-500">11 chiffres requis</span>}
            </div>
            <div>
              <label className={labelCls}>NIS</label>
              <input type="text" placeholder="0000000000" maxLength={10}
                className={tax.nis && !validateNIS(tax.nis) ? `${inputCls} border-red-300 focus:ring-red-500` : inputCls}
                value={tax.nis} onChange={(e) => updateTaxIds({ nis: e.target.value })} />
              {tax.nis && !validateNIS(tax.nis) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
            </div>
            <div>
              <label className={labelCls}>AI</label>
              <input type="text" placeholder="0000000000" maxLength={10}
                className={tax.ai && !validateAI(tax.ai) ? `${inputCls} border-red-300 focus:ring-red-500` : inputCls}
                value={tax.ai} onChange={(e) => updateTaxIds({ ai: e.target.value })} />
              {tax.ai && !validateAI(tax.ai) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
            </div>
            <div>
              <label className={labelCls}>RC</label>
              <input type="text" placeholder="16/00-0000000"
                className={tax.rc && !validateRC(tax.rc) ? `${inputCls} border-red-300 focus:ring-red-500` : inputCls}
                value={tax.rc} onChange={(e) => updateTaxIds({ rc: e.target.value })} />
              {tax.rc && !validateRC(tax.rc) && <span className="text-[8px] text-red-500">Format RC invalide</span>}
            </div>
          </div>
        </div>
      )}

      {/* ── Coordonnées Bancaires ── */}
      <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">Coordonnées Bancaires</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Compte</label>
            <input type="text" placeholder="SOCIÉTÉ GÉNÉRALE" className={inputCls} value={doc.bankName ?? ''} onChange={(e) => updateDoc('bankName', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Agence</label>
            <input type="text" placeholder="Sidi Yahia-Hydra" className={inputCls} value={doc.bankAgency ?? ''} onChange={(e) => updateDoc('bankAgency', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Code d&apos;agence</label>
            <input type="text" placeholder="CLE 09" className={inputCls} value={doc.bankAgencyCode ?? ''} onChange={(e) => updateDoc('bankAgencyCode', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Adresse</label>
            <input type="text" placeholder="45 Lot petit Provence" className={inputCls} value={doc.bankAddress ?? ''} onChange={(e) => updateDoc('bankAddress', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>RIB</label>
            <input type="text" placeholder="021 00001 1130036271 09" className={`${inputCls} font-mono`} value={doc.rib ?? ''} onChange={(e) => updateDoc('rib', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>CCP Banquaire</label>
            <input type="text" placeholder="007 99999 0000391575 54" className={`${inputCls} font-mono`} value={doc.ccpNumber ?? ''} onChange={(e) => updateDoc('ccpNumber', e.target.value)} />
          </div>
        </div>
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
      {mode === 'entreprise' && doc.companyInfo && <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.yourCompany')}</h4>
        <input type="text" placeholder={te('client.companyName')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyInfo.name} onChange={(e) => updateCompanyInfo({ name: e.target.value })} />
        <input type="text" placeholder={te('client.companyAddress')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyInfo.address} onChange={(e) => updateCompanyInfo({ address: e.target.value })} />
      </div>}
    </div>
  );
}
