'use client';
import { useSectionContext } from './SectionProps';

export function MateriauxSection() {
  const { doc, setMateriauxField, hiddenFields, te } = useSectionContext();
  return (
    <div className="grid grid-cols-2 gap-2">
      {!hiddenFields.has('materiauxBrand') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('materiaux.brand')}</label>
        <input type="text" placeholder={te('materiaux.brandPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.materiauxMarque} onChange={(e) => setMateriauxField('materiauxMarque', e.target.value)} /></div>}
      {!hiddenFields.has('materiauxType') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('materiaux.type')}</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.materiauxType} onChange={(e) => setMateriauxField('materiauxType', e.target.value)}>
          <option value={te('materiaux.options.acrylicMat')}>{te('materiaux.options.acrylicMat')}</option><option value={te('materiaux.options.acrylicSatin')}>{te('materiaux.options.acrylicSatin')}</option><option value={te('materiaux.options.glycéro')}>{te('materiaux.options.glycéro')}</option><option value={te('materiaux.options.floor')}>{te('materiaux.options.floor')}</option><option value={te('materiaux.options.decorative')}>{te('materiaux.options.decorative')}</option><option value={te('materiaux.options.other')}>{te('materiaux.options.other')}</option></select></div>}
      {!hiddenFields.has('materiauxColor') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('materiaux.color')}</label>
        <input type="text" placeholder={te('materiaux.colorPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.materiauxCouleur} onChange={(e) => setMateriauxField('materiauxCouleur', e.target.value)} /></div>}
      {!hiddenFields.has('materiauxQty') && <div><label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">{te('materiaux.quantity')}</label>
        <input type="number" min="0" placeholder={te('materiaux.quantityPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.materiauxQte || ''} onFocus={(e) => e.target.select()} onChange={(e) => setMateriauxField('materiauxQte', parseFloat(e.target.value) || 0)} /></div>}
    </div>
  );
}
