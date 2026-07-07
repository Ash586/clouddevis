'use client';
import { useSectionContext } from './SectionProps';

export function EquipementSection() {
  const { doc, updateCustomField, hiddenFields, te } = useSectionContext();
  if (hiddenFields.has('equipement')) return null;
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Désignation</label>
        <input type="text" placeholder="Ex: Climatiseur Split..." className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
          value={String((doc.customFields.intervention ?? {}).equipementDesignation ?? '')}
          onChange={(e) => updateCustomField('intervention', 'equipementDesignation', e.target.value)} />
      </div>
      <div>
        <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Type</label>
        <input type="text" placeholder="Ex: Marque — Modèle" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
          value={String((doc.customFields.intervention ?? {}).equipementType ?? '')}
          onChange={(e) => updateCustomField('intervention', 'equipementType', e.target.value)} />
      </div>
      <div>
        <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">N° Série</label>
        <input type="text" placeholder="Numéro de série" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
          value={String((doc.customFields.intervention ?? {}).equipementSerie ?? '')}
          onChange={(e) => updateCustomField('intervention', 'equipementSerie', e.target.value)} />
      </div>
    </div>
  );
}

export function VisiteSection() {
  const { doc, updateCustomField, hiddenFields } = useSectionContext();
  if (hiddenFields.has('visite')) return null;
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Type de visite</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
          value={String((doc.customFields.intervention ?? {}).typeVisite ?? '')}
          onChange={(e) => updateCustomField('intervention', 'typeVisite', e.target.value)}>
          <option value="">—</option><option value="routine">Maintenance routière</option>
          <option value="depannage">Dépannage</option><option value="installation">Installation</option>
          <option value="revision">Révision annuelle</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Durée (heures)</label>
        <input type="number" step="0.5" min="0" placeholder="1.5" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
          value={Number((doc.customFields.intervention ?? {}).duree ?? 0) || ''}
          onFocus={(e) => e.target.select()}
          onChange={(e) => updateCustomField('intervention', 'duree', parseFloat(e.target.value) || 0)} />
      </div>
      <div>
        <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Intervenants (séparé par ,)</label>
        <input type="text" placeholder="Ex: Ahmed, Mohamed" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
          value={String((doc.customFields.intervention ?? {}).intervenants ?? '')}
          onChange={(e) => updateCustomField('intervention', 'intervenants', e.target.value)} />
      </div>
    </div>
  );
}

export function VerificationsSection() {
  const { doc, updateCustomField, hiddenFields } = useSectionContext();
  if (hiddenFields.has('verifications')) return null;
  return (
    <>
      <div className="text-[10px] text-[var(--sand-muted)] mb-2">Entrez une vérification par ligne</div>
      <textarea placeholder="Ex: Pression gaz&#10;Fonctionnement compresseur&#10;Vitesse ventilation"
        className="w-full border p-2 rounded-lg text-[11px] h-20 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]"
        value={Array.isArray((doc.customFields.intervention ?? {}).verifications) ? ((doc.customFields.intervention ?? {}).verifications as string[]).join('\n') : ''}
        onChange={(e) => updateCustomField('intervention', 'verifications', e.target.value.split('\n').filter(l => l.trim()))} />
    </>
  );
}

export function TravauxSection() {
  const { doc, updateCustomField, hiddenFields } = useSectionContext();
  if (hiddenFields.has('travaux')) return null;
  return (
    <>
      <div className="text-[10px] text-[var(--sand-muted)] mb-2">Entrez un travail par ligne</div>
      <textarea placeholder="Remplacement du filtre&#10;Nettoyage conduits&#10;Test de performance"
        className="w-full border p-2 rounded-lg text-[11px] h-20 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]"
        value={Array.isArray((doc.customFields.intervention ?? {}).travaux) ? ((doc.customFields.intervention ?? {}).travaux as string[]).join('\n') : ''}
        onChange={(e) => updateCustomField('intervention', 'travaux', e.target.value.split('\n').filter(l => l.trim()))} />
    </>
  );
}

export function PiecesSection() {
  const { doc, updateCustomField, hiddenFields } = useSectionContext();
  if (hiddenFields.has('pieces')) return null;
  return (
    <>
      <div className="text-[10px] text-[var(--sand-muted)] mb-2">Entrez une pièce par ligne</div>
      <textarea placeholder="Filtre F7 - 1 unité (utilisée)&#10;Joint d'étanchéité (à commander)"
        className="w-full border p-2 rounded-lg text-[11px] h-20 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]"
        value={Array.isArray((doc.customFields.intervention ?? {}).pieces) ? ((doc.customFields.intervention ?? {}).pieces as string[]).join('\n') : ''}
        onChange={(e) => updateCustomField('intervention', 'pieces', e.target.value.split('\n').filter(l => l.trim()))} />
    </>
  );
}

export function EtatSection() {
  const { doc, updateCustomField, hiddenFields } = useSectionContext();
  if (hiddenFields.has('etat')) return null;
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">État général</label>
        <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
          value={String((doc.customFields.intervention ?? {}).etatAppareil ?? '')}
          onChange={(e) => updateCustomField('intervention', 'etatAppareil', e.target.value)}>
          <option value="">—</option><option value="bon">Bon état — Fonctionnement normal</option>
          <option value="acceptable">État acceptable — Fonctionnement dégradé</option>
          <option value="mauvais">Mauvais état — Dépannage nécessaire</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Défauts constatés</label>
        <textarea placeholder="Décrivez les défauts et dysfonctionnements..." className="w-full border p-2 rounded-lg text-[11px] h-16 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]"
          value={String((doc.customFields.intervention ?? {}).defauts ?? '')}
          onChange={(e) => updateCustomField('intervention', 'defauts', e.target.value)} />
      </div>
    </div>
  );
}
