'use client';
import { useSectionContext } from './SectionProps';

export function ChantierSection() {
  const { doc, setChantierField, hiddenFields, te } = useSectionContext();
  return (
    <div className="grid grid-cols-2 gap-2">
      {!hiddenFields.has('chantierAddress') && <div className="col-span-2"><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('chantier.address')}</label>
        <input type="text" placeholder={te('chantier.addressPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierAddress} onChange={(e) => setChantierField('chantierAddress', e.target.value)} /></div>}
      {!hiddenFields.has('chantierType') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('chantier.type')}</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierType} onChange={(e) => setChantierField('chantierType', e.target.value)}>
          <option value={te('chantier.options.apartment')}>{te('chantier.options.apartment')}</option><option value={te('chantier.options.house')}>{te('chantier.options.house')}</option><option value={te('chantier.options.commercial')}>{te('chantier.options.commercial')}</option><option value={te('chantier.options.office')}>{te('chantier.options.office')}</option><option value={te('chantier.options.facade')}>{te('chantier.options.facade')}</option><option value={te('chantier.options.other')}>{te('chantier.options.other')}</option></select></div>}
      {!hiddenFields.has('chantierCondition') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('chantier.condition')}</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierEtat} onChange={(e) => setChantierField('chantierEtat', e.target.value)}>
          <option value={te('chantier.conditionNew')}>{te('chantier.conditionNew')}</option><option value={te('chantier.conditionRenovation')}>{te('chantier.conditionRenovation')}</option></select></div>}
      {!hiddenFields.has('chantierSurface') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('chantier.surface')}</label>
        <input type="number" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierSurface || ''} onChange={(e) => setChantierField('chantierSurface', parseFloat(e.target.value) || 0)} /></div>}
      {!hiddenFields.has('chantierProtection') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('chantier.protection')}</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierProtection} onChange={(e) => setChantierField('chantierProtection', e.target.value)}>
          <option value={te('chantier.protectionProvider')}>{te('chantier.protectionProvider')}</option><option value={te('chantier.protectionClient')}>{te('chantier.protectionClient')}</option><option value={te('chantier.protectionNone')}>{te('chantier.protectionNone')}</option></select></div>}
    </div>
  );
}
