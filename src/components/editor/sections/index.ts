/**
 * Sections barrel file — imports all built-in sections and registers them
 * in the SECTION_REGISTRY. Import this once in page.tsx.
 */
import { registerSection } from './SectionProps';

// Core sections
import { DesignSection } from './DesignSection';
import { GeneralSection } from './GeneralSection';
import { DevisSection } from './DevisSection';
import { ClientSection } from './ClientSection';
import { ModeSection } from './ModeSection';
import { ChantierSection } from './ChantierSection';
import { MateriauxSection } from './MateriauxSection';
import { PrestationsSection } from './PrestationsSection';
import { RemiseSection } from './RemiseSection';
import { GarantiesSection } from './GarantiesSection';
import { PaiementSection } from './PaiementSection';
import { NotesSection } from './NotesSection';
import { CustomSectionRenderer } from './CustomSectionRenderer';
import {
  EquipementSection,
  VisiteSection,
  VerificationsSection,
  TravauxSection,
  PiecesSection,
  EtatSection,
} from './InterventionSections';

/** Call once at module scope to populate the SECTION_REGISTRY. */
export function registerAllBuiltinSections(): void {
  // ── Core sections ──
  registerSection('design', DesignSection, { sectionId: 'design', titleKey: 'sections.design' });
  registerSection('general', GeneralSection, { sectionId: 'general', titleKey: 'sections.general', blockId: 'header' });
  registerSection('devis', DevisSection, { sectionId: 'devis', titleKey: 'sections.devis' });
  registerSection('client', ClientSection, { sectionId: 'client', titleKey: 'sections.client', blockId: 'client' });
  registerSection('mode', ModeSection, { sectionId: 'mode', titleKey: 'sections.mode' });
  registerSection('chantier', ChantierSection, { sectionId: 'chantier', titleKey: 'sections.chantier', blockId: 'chantier' });
  registerSection('materiaux', MateriauxSection, { sectionId: 'materiaux', titleKey: 'sections.materiaux', blockId: 'materiaux' });
  registerSection('prestations', PrestationsSection, { sectionId: 'prestations', titleKey: 'sections.prestations', blockId: 'table' });
  registerSection('remise', RemiseSection, { sectionId: 'remise', titleKey: 'sections.remise', blockId: 'remise' });
  registerSection('garanties', GarantiesSection, { sectionId: 'garanties', titleKey: 'sections.garanties', blockId: 'garanties' });
  registerSection('paiement', PaiementSection, { sectionId: 'paiement', titleKey: 'sections.paiement', blockId: 'payment' });
  registerSection('notes', NotesSection, { sectionId: 'notes', titleKey: 'sections.notes' });

  // ── Intervention sections ──
  registerSection('equipement', EquipementSection, { sectionId: 'equipement', titleKey: 'sections.equipement' });
  registerSection('visite', VisiteSection, { sectionId: 'visite', titleKey: 'sections.visite' });
  registerSection('verifications', VerificationsSection, { sectionId: 'verifications', titleKey: 'sections.verifications' });
  registerSection('travaux', TravauxSection, { sectionId: 'travaux', titleKey: 'sections.travaux' });
  registerSection('pieces', PiecesSection, { sectionId: 'pieces', titleKey: 'sections.pieces' });
  registerSection('etat', EtatSection, { sectionId: 'etat', titleKey: 'sections.etat' });

  // ── Custom sections (fallback renderer) ──
  registerSection('__custom__', CustomSectionRenderer, { sectionId: '__custom__', titleKey: '' });
}

// Self-register on import (tree-shaking safe — called once)
registerAllBuiltinSections();
