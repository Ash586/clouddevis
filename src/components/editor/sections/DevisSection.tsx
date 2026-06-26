'use client';
import { useSectionContext } from './SectionProps';

export function DevisSection() {
  const { doc, updateDoc, hiddenFields, te } = useSectionContext();
  if (doc.documentType !== 'devis') return null;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Devise / Slogan</label>
          <input type="text" placeholder="Société de Services — Étude, Conseil & Réalisation" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyTagline ?? ''} onChange={(e) => updateDoc('companyTagline', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Capital Social</label>
          <input type="text" placeholder="100 000,00 DA" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyCapital ?? ''} onChange={(e) => updateDoc('companyCapital', e.target.value)} />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">R.C.</label>
          <input type="text" placeholder="12/B/0807586-00/09-BLIDA" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.rcNumber ?? ''} onChange={(e) => updateDoc('rcNumber', e.target.value)} />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">NIS</label>
          <input type="text" placeholder="001209250009852" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.nisNumber ?? ''} onChange={(e) => updateDoc('nisNumber', e.target.value)} />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">N° AI</label>
          <input type="text" placeholder="0925314021031" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.aiNumber ?? ''} onChange={(e) => updateDoc('aiNumber', e.target.value)} />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Référence</label>
          <input type="text" placeholder="76/2025" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.reference ?? ''} onChange={(e) => updateDoc('reference', e.target.value)} />
        </div>
      </div>
      <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">Coordonnées Bancaires</h4>
        <div>
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">RIB</label>
          <input type="text" placeholder="021 00201 1130029324 83" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] font-mono outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.rib ?? ''} onChange={(e) => updateDoc('rib', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Banque</label>
            <input type="text" placeholder="SOCIÉTÉ GÉNÉRALE" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.bankName ?? ''} onChange={(e) => updateDoc('bankName', e.target.value)} />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Agence</label>
            <input type="text" placeholder="ALGÉRIE — AGENCE BLIDA" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.bankAgency ?? ''} onChange={(e) => updateDoc('bankAgency', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">CCP</label>
          <input type="text" placeholder="007 99999 0000391699 70" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] font-mono outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.ccpNumber ?? ''} onChange={(e) => updateDoc('ccpNumber', e.target.value)} />
        </div>
      </div>
      <div className="border-t border-[rgba(245,237,214,0.06)] pt-2">
        <div className="grid grid-cols-2 gap-2 items-end">
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Validité (jours)</label>
            <input type="number" min="1" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.validityDays ?? 30} onChange={(e) => updateDoc('validityDays', parseInt(e.target.value) || 30)} />
          </div>
          <label className="flex items-center gap-2 p-2 bg-[var(--navy-3)] rounded-xl border border-[rgba(245,237,214,0.06)] cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 rounded text-[var(--green-3)]" checked={doc.showWatermark ?? false} onChange={(e) => updateDoc('showWatermark', e.target.checked)} />
            <span className="text-[10px] font-bold text-[var(--sand-muted)]">Filigrane DEVIS</span>
          </label>
        </div>
      </div>
    </div>
  );
}
