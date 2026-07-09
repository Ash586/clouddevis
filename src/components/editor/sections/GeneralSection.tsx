'use client';
import { useSectionContext } from './SectionProps';
import { DevisSection } from './DevisSection';
import { validateNIF, validateNIS, validateRC, validateAI } from '@/lib/validation';

const inputCls = 'w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]';
const labelCls = 'block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5';

export function GeneralSection() {
  const { doc, mode, updateDoc, updateStampDuty, updateCustomField, updateTaxIds, updateCompanyInfo, hiddenFields, te } = useSectionContext();
  const tax = doc.companyInfo?.taxIds ?? { nif: '', nis: '', rc: '', ai: '' };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {!hiddenFields.has('docNumber') && <input type="text" placeholder={te('general.docNumber')} className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.documentNumber} onChange={(e) => updateDoc('documentNumber', e.target.value)} />}
        {!hiddenFields.has('orderRef') && <input type="text" placeholder={te('general.orderRef')} className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.bcRef ?? ''} onChange={(e) => updateDoc('bcRef', e.target.value)} />}
        {!hiddenFields.has('issueDate') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('general.issueDate')}</label>
          <input type="date" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.date} onChange={(e) => updateDoc('date', e.target.value)} /></div>}
        {!hiddenFields.has('validUntil') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('general.validUntil')}</label>
          <input type="date" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.validUntil ?? ''} onChange={(e) => updateDoc('validUntil', e.target.value)} /></div>}
        {!hiddenFields.has('objet') && <div className="col-span-2">
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('fields.objet')}</label>
          <input type="text" placeholder={te('fields.objet')} className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.objet ?? ''} onChange={(e) => updateDoc('objet', e.target.value)} />
        </div>}
        {!hiddenFields.has('docCity') && <div>
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('fields.docCity')}</label>
          <input type="text" placeholder={te('fields.docCity')} className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.docCity ?? ''} onChange={(e) => updateDoc('docCity', e.target.value)} />
        </div>}
        {doc.documentType === 'bc' && <>
          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Source de financement</label>
            <input type="text" placeholder="02 — 03 — 07" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.bc ?? {}).financementSource ?? '')} onChange={(e) => updateCustomField('bc', 'financementSource', e.target.value)} />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Code gestionnaire</label>
            <input type="text" placeholder="0699" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.bc ?? {}).codeGestionnaire ?? '')} onChange={(e) => updateCustomField('bc', 'codeGestionnaire', e.target.value)} />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Nature de prestation</label>
            <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.bc ?? {}).naturePrestation ?? '')} onChange={(e) => updateCustomField('bc', 'naturePrestation', e.target.value)}>
              <option value="">—</option><option value="travaux">Travaux</option><option value="fournitures">Fournitures</option><option value="services">Services</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Type de dépense</label>
            <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.bc ?? {}).typeDepense ?? '')} onChange={(e) => updateCustomField('bc', 'typeDepense', e.target.value)}>
              <option value="">—</option><option value="fonctionnement">Dépenses de fonctionnement</option><option value="equipement">Dépenses d&apos;équipement</option><option value="autre">Autre</option>
            </select>
          </div>
        </>}
      </div>
      {!hiddenFields.has('stampRate') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('general.stampDuty')}</label>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampRate')}</label>
            <input type="number" step="0.1" min="0" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.rate} onFocus={(e) => e.target.select()} onChange={(e) => updateStampDuty({ rate: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampMin')}</label>
            <input type="number" min="0" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.minAmount} onFocus={(e) => e.target.select()} onChange={(e) => updateStampDuty({ minAmount: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampMax')}</label>
            <input type="number" min="0" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.maxAmount} onFocus={(e) => e.target.select()} onChange={(e) => updateStampDuty({ maxAmount: parseFloat(e.target.value) || 0 })} /></div>
        </div></div>}

      {/* ── Votre Société ── */}
      {mode === 'entreprise' && doc.companyInfo && <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.yourCompany')}</h4>
        <input type="text" placeholder={te('client.companyName')} className={inputCls} value={doc.companyInfo.name} onChange={(e) => updateCompanyInfo({ name: e.target.value })} />
        <input type="text" placeholder={te('client.companyAddress')} className={inputCls} value={doc.companyInfo.address} onChange={(e) => updateCompanyInfo({ address: e.target.value })} />
      </div>}

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

      {/* Informations complémentaires (Activité, Devise, Capital, Référence, Validité) */}
      <DevisSection />
    </div>
  );
}
