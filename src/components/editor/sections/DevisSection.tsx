'use client';
import { useSectionContext } from './SectionProps';

const inputCls = 'w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]';
const labelCls = 'block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5';

export function DevisSection() {
  const { doc, mode, updateDoc, hiddenFields } = useSectionContext();
  if (doc.documentType !== 'devis' && doc.documentType !== 'facture') return null;

  const isEnt = mode === 'entreprise';

  return (
    <div className="space-y-3">
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
