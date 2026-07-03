'use client';
import { useSectionContext } from './SectionProps';

// Bon de Livraison — delivery-specific block (décret 05-468):
// deliverer + transporter identity (name + CIN) and delivery location.
export function LivraisonSection() {
  const { doc, updateDoc, hiddenFields } = useSectionContext();
  if (doc.documentType !== 'bl') return null;

  const show = (f: string) => !hiddenFields.has(f);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {show('delivererName') && (
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Livreur — Nom</label>
            <input type="text" placeholder="Nom du livreur" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.delivererName ?? ''} onChange={(e) => updateDoc('delivererName', e.target.value)} />
          </div>
        )}
        {show('delivererIdCard') && (
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Livreur — N° CIN</label>
            <input type="text" placeholder="N° carte d'identité" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.delivererIdCard ?? ''} onChange={(e) => updateDoc('delivererIdCard', e.target.value)} />
          </div>
        )}
        {show('transporterName') && (
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Transporteur — Nom</label>
            <input type="text" placeholder="Nom du transporteur" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.transporterName ?? ''} onChange={(e) => updateDoc('transporterName', e.target.value)} />
          </div>
        )}
        {show('transporterIdCard') && (
          <div>
            <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Transporteur — N° CIN</label>
            <input type="text" placeholder="N° carte d'identité" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.transporterIdCard ?? ''} onChange={(e) => updateDoc('transporterIdCard', e.target.value)} />
          </div>
        )}
      </div>
      {show('deliveryAddress') && (
        <div>
          <label className="block text-[9px] font-bold text-[var(--sand-muted)] mb-0.5">Lieu de livraison (si différent du client)</label>
          <input type="text" placeholder="Adresse de livraison" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.deliveryAddress ?? ''} onChange={(e) => updateDoc('deliveryAddress', e.target.value)} />
        </div>
      )}
    </div>
  );
}
