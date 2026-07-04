import type { DocumentType, SectionId } from '@/types';
import type { PreviewFocus } from '@/components/editor/DocumentPreview';

/** Map internal DocumentType → i18n key for the editor type label */
export const DOC_TYPE_EDITOR_LABELS: Record<string, string> = {
  devis: 'documentTypeQuote',
  facture: 'documentTypeInvoice',
  proforma: 'documentTypeProforma',
  bc: 'documentTypeBC',
  br: 'documentTypeBR',
  bl: 'documentTypeBL',
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
  bl: 'docTypeBL',
  intervention: 'docTypeIntervention',
  attachement: 'docTypeAttachement',
};

/** Convert user-friendly URL param to internal DocumentType */
export const URL_TYPE_MAP: Record<string, DocumentType> = {
  bon_commande: 'bc',
  bon_reception: 'br',
  bon_livraison: 'bl',
};

/** All valid internal document types */
const VALID_DOC_TYPES: DocumentType[] = ['devis', 'proforma', 'bc', 'br', 'bl', 'facture', 'intervention', 'attachement'];

/**
 * Normalize a raw `?type=` URL param into a valid internal DocumentType.
 * Handles any casing (e.g. "BC", "bc"), the user-friendly aliases in
 * URL_TYPE_MAP (e.g. "bon_commande"), and the uppercase DB enum values the
 * sidebar emits (e.g. "DEVIS", "BR"). Returns null for unknown values so the
 * editor falls back to its default type.
 */
export function normalizeDocTypeParam(raw: string | null | undefined): DocumentType | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (URL_TYPE_MAP[lower]) return URL_TYPE_MAP[lower];
  if (VALID_DOC_TYPES.includes(lower as DocumentType)) return lower as DocumentType;
  return null;
}

/** Icon component resolver for document types */
export function getDocTypeIcon(type: DocumentType) {
  const icons = {
    devis: 'FileText',
    facture: 'Receipt',
    proforma: 'ClipboardList',
    bc: 'FileStack',
    br: 'ScrollText',
    bl: 'Truck',
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
  livraison: 'header',
};

/** Reverse of sectionFocusMap: preview zone clicked → section to jump the editor to. */
export const previewFocusToSectionId: Partial<Record<NonNullable<PreviewFocus>, SectionId>> = {
  header: 'general',
  client: 'client',
  items: 'prestations',
  totals: 'remise',
  payment: 'paiement',
};
