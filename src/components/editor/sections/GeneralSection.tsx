'use client';
import { useSectionContext } from './SectionProps';
import { DevisSection } from './DevisSection';

export function GeneralSection() {
  const { doc, updateDoc, updateStampDuty, updateCustomField, hiddenFields, te } = useSectionContext();
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
      {!hiddenFields.has('vatRate') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('general.vatRate')}</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.tvaRate} onChange={(e) => updateDoc('tvaRate', Number(e.target.value))}>
          <option value="19">{te('general.vat19')}</option><option value="9">{te('general.vat9')}</option><option value="0">{te('general.vat0')}</option></select></div>}
      {!hiddenFields.has('stampRate') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('general.stampDuty')}</label>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampRate')}</label>
            <input type="number" step="0.1" min="0" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.rate} onFocus={(e) => e.target.select()} onChange={(e) => updateStampDuty({ rate: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampMin')}</label>
            <input type="number" min="0" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.minAmount} onFocus={(e) => e.target.select()} onChange={(e) => updateStampDuty({ minAmount: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampMax')}</label>
            <input type="number" min="0" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.maxAmount} onFocus={(e) => e.target.select()} onChange={(e) => updateStampDuty({ maxAmount: parseFloat(e.target.value) || 0 })} /></div>
        </div></div>}

      {/* Merged: "Informations complémentaires" (fiscal + banking) now lives inside Données Générales */}
      <DevisSection />
    </div>
  );
}
