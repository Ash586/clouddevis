// ============================================================
// CloudDevis PDF Engine — Shared Types
// Types for PDF document generation
// ============================================================

/** Company data for PDF header */
export interface PDFCompany {
  name: string;
  nif: string;
  rc: string;
  nis: string;
  ai?: string;
  phone?: string;
  fax?: string;
  email?: string;
  address: string;
  logo?: string;        // Base64 data URL
  capital?: string;
  activity?: string;    // Activité / tagline
  rib?: string;
  ccp?: string;
  bankName?: string;
  signature?: string;   // Base64 data URL
}

/** Client data for PDF */
export interface PDFClient {
  name: string;
  nif?: string;
  rc?: string;
  nis?: string;
  ai?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/** Line item for PDF table */
export interface PDFLineItem {
  label: string;
  code?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  tvaRate: number;
  remise?: number;      // per-line discount %
  totalHT: number;
}

/** Document type for PDF */
export type PDFDocumentType = 'DEVIS' | 'FACTURE' | 'PROFORMA' | 'BC' | 'BR' | 'BL';

/** Complete data needed to generate a PDF */
export interface PDFDocumentData {
  // Document info
  type: PDFDocumentType;
  number: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  notes?: string;

  // Entities
  company: PDFCompany;
  client: PDFClient;
  items: PDFLineItem[];

  // Totals
  totalHT: number;
  totalTVA: number;
  timbreFiscal: boolean;
  timbreAmount: number;
  totalTTC: number;

  // Formatting
  totalInWords: string;

  // Optional document fields
  objet?: string;
  paymentMode?: string;   // already-localized label, e.g. "Virement"
  acompte?: number;
  netAPayer?: number;

  // Settings
  language: 'FR' | 'AR' | 'EN';

  // DEVIS-specific fields
  companyTagline?: string;
  companyCapital?: string;
  rcNumber?: string;
  nisNumber?: string;
  aiNumber?: string;
  rib?: string;
  bankName?: string;
  bankAgency?: string;
  ccpNumber?: string;
  validityDays?: number;
  reference?: string;
  showWatermark?: boolean;

  // BL (Bon de Livraison) specific fields
  delivererName?: string;
  delivererIdCard?: string;
  transporterName?: string;
  transporterIdCard?: string;
  deliveryAddress?: string;
}

/** PDF generation options */
export interface PDFOptions {
  /** Output format */
  format?: 'A4';
  /** Page orientation */
  orientation?: 'portrait';
  /** Margins in points (1pt = 1/72 inch) */
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}
