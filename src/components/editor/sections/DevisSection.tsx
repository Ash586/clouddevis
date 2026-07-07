'use client';
import { validateNIF, validateNIS, validateRC, validateAI } from '@/lib/validation';
import { useSectionContext } from './SectionProps';

const inputCls = 'w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]';
const labelCls = 'block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5';

export function DevisSection() {
  const { doc, mode, updateDoc, updateTaxIds, hiddenFields } = useSectionContext();
  if (doc.documentType !== 'devis' && doc.documentType !== 'facture') return null;

  const isEnt = mode === 'entreprise';
  const tax = doc.companyInfo?.taxIds ?? { nif: '', nis: '', rc: '', ai: '' };

  return (
    <div className="space-y-3">
      {/* ── Identifiants fiscaux (entreprise) ── */}
      {isEnt && (
        <div className="space-y-2">
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
      <div className="space-y-2 border-t border-[rgba(245,237,214,0.06)] pt-3">
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

      {/* ── Autres informations (secondaires, configurables) ── */}
      <div className="space-y-2 border-t border-[rgba(245,237,214,0.06)] pt-3">
        <div className="grid grid-cols-2 gap-2">
          {!hiddenFields.has('activityDescription') && <div className="col-span-2">
            <label className={labelCls}>Activité / Description</label>
            <textarea placeholder="Société de Services — Étude, Conseil & Réalisation" className={`${inputCls} h-14 resize-none`} value={doc.activityDescription ?? ''} onChange={(e) => updateDoc('activityDescription', e.target.value)} />
          </div>}
          {!hiddenFields.has('companyTagline') && <div className="col-span-2">
            <label className={labelCls}>Devise / Slogan</label>
            <input type="text" placeholder="Étude, Conseil & Réalisation" className={inputCls} value={doc.companyTagline ?? ''} onChange={(e) => updateDoc('companyTagline', e.target.value)} />
          </div>}
          {isEnt && !hiddenFields.has('companyCapital') && <div className="col-span-2">
            <label className={labelCls}>Capital Social</label>
            <input type="text" placeholder="100 000,00 DA" className={inputCls} value={doc.companyCapital ?? ''} onChange={(e) => updateDoc('companyCapital', e.target.value)} />
          </div>}
          {!hiddenFields.has('reference') && <div>
            <label className={labelCls}>Référence</label>
            <input type="text" placeholder="76/2025" className={inputCls} value={doc.reference ?? ''} onChange={(e) => updateDoc('reference', e.target.value)} />
          </div>}
          {!hiddenFields.has('validityDays') && <div>
            <label className={labelCls}>Validité (jours)</label>
            <input type="number" min="1" className={inputCls} value={doc.validityDays ?? 30} onFocus={(e) => e.target.select()} onChange={(e) => updateDoc('validityDays', parseInt(e.target.value) || 30)} />
          </div>}
        </div>
      </div>
    </div>
  );
}
