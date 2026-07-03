'use client';
import { useSectionContext } from './SectionProps';

export function SignatureSection() {
  const { doc, updateDoc, hiddenFields } = useSectionContext();
  return (
    <div className="space-y-2">
      {!hiddenFields.has('signatoryName') && <div>
        <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Nom du signataire</label>
        <input type="text" placeholder="Nom et prénom" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.signatoryName ?? ''} onChange={(e) => updateDoc('signatoryName', e.target.value)} />
      </div>}
      {!hiddenFields.has('signatoryTitle') && <div>
        <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Qualité / Fonction</label>
        <input type="text" placeholder="Gérant" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.signatoryTitle ?? ''} onChange={(e) => updateDoc('signatoryTitle', e.target.value)} />
      </div>}
    </div>
  );
}
