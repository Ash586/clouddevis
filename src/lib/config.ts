import type { DocumentType } from '@/types';

/**
 * Document types currently enabled in the UI.
 * To enable a type, add it to this list and it will appear everywhere
 * (Sidebar, editor type menu, dashboard filters).
 */
export const ENABLED_DOC_TYPES: DocumentType[] = ['devis', 'facture', 'bl'];
