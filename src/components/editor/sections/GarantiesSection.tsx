'use client';
import { useSectionContext } from './SectionProps';

export function GarantiesSection() {
  const { doc, setGarantieField, hiddenFields, te } = useSectionContext();
  return (
    <div className="grid grid-cols-2 gap-2">
      {!hiddenFields.has('garantieLabor') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('garanties.labor')}</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.garantieMO} onChange={(e) => setGarantieField('garantieMO', e.target.value)}>
          <option value={te('garanties.year1')}>{te('garanties.year1')}</option><option value={te('garanties.year2')}>{te('garanties.year2')}</option><option value={te('garanties.year5')}>{te('garanties.year5')}</option><option value={te('garanties.year10')}>{te('garanties.year10')}</option><option value={te('garanties.none')}>{te('garanties.none')}</option></select></div>}
      {!hiddenFields.has('garantieMaterials') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('garanties.materials')}</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.garantieMateriaux} onChange={(e) => setGarantieField('garantieMateriaux', e.target.value)}>
          <option value={te('garanties.year1')}>{te('garanties.year1')}</option><option value={te('garanties.year2')}>{te('garanties.year2')}</option><option value={te('garanties.year5')}>{te('garanties.year5')}</option><option value={te('garanties.year10')}>{te('garanties.year10')}</option><option value={te('garanties.none')}>{te('garanties.none')}</option></select></div>}
      {!hiddenFields.has('garantieNotes') && <div className="col-span-2"><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('garanties.notes')}</label>
        <textarea placeholder={te('garanties.notesPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] h-14 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.garantieNotes} onChange={(e) => setGarantieField('garantieNotes', e.target.value)} /></div>}
    </div>
  );
}
