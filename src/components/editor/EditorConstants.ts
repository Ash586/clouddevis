import type { DocumentType, SectionId } from '@/types';
import type { PreviewFocus } from '@/components/editor/DocumentPreview';

/** Map internal DocumentType → i18n key for the editor type label */
export const DOC_TYPE_EDITOR_LABELS: Record<string, string> = {
  devis: 'documentTypeQuote',
  facture: 'documentTypeInvoice',
  proforma: 'documentTypeProforma',
  bc: 'documentTypeBC',
  br: 'documentTypeBR',
  intervention: 'documentTypeIntervention',
  attachement: 'documentTypeAttachement',
};

/** Map internal DocumentType → i18n key for the preview type label */
export const DOC_TYPE_PREVIEW_LABELS: Record<string, string> = {
  devis: 'docTypeQuote',
  facture: 'docTypeInvoice',
  proforma: 'docTypeProforma',
  bc: 'docTypeOrder',
  br: 'docTypeBR',
  intervention: 'docTypeIntervention',
  attachement: 'docTypeAttachement',
};

/** Convert user-friendly URL param to internal DocumentType */
export const URL_TYPE_MAP: Record<string, DocumentType> = {
  bon_commande: 'bc',
  bon_reception: 'br',
};

/** Icon component resolver for document types */
export function getDocTypeIcon(type: DocumentType) {
  const icons = {
    devis: 'FileText',
    facture: 'Receipt',
    proforma: 'ClipboardList',
    bc: 'FileStack',
    br: 'ScrollText',
    intervention: 'Wrench',
    attachement: 'FileText',
  } as const;
  return icons[type] ?? 'FileText';
}

/** Map section ID → preview focus area */
export const sectionFocusMap: Record<string, PreviewFocus> = {
  prestations: 'items',
  client: 'client',
  general: 'header',
  design: 'header',
  paiement: 'payment',
  chantier: 'header',
  materiaux: 'header',
  remise: 'totals',
  garanties: 'payment',
  notes: null,
  mode: 'header',
  devis: 'header',
};
