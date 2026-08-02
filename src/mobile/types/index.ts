// ============================================================
// Rakmana Mobile — TypeScript Interfaces
// All data types for the mobile invoicing app
// ============================================================

// ── Enums / Union Types ──────────────────────────────────────

/** Types of documents supported */
export type DocumentType = 'DEVIS' | 'FACTURE' | 'PROFORMA' | 'BC' | 'BR' | 'BL';

/** Document workflow status */
export type DocumentStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';

/** Supported languages for documents */
export type Language = 'FR' | 'AR' | 'EN';

/** Subscription plans */
export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE';

/** Unit of measure for line items */
export type UnitMeasure = 'u' | 'h' | 'j' | 'm2' | 'm3' | 'ml' | 'kg' | 'forfait';

/** Payment methods */
export type PaymentMode = 'cheque' | 'virement' | 'especes' | 'cb';

/** Business mode */
export type UserMode = 'artisan' | 'entreprise';

// ── Core Entities ────────────────────────────────────────────

/**
 * Company — the user's business entity
 * For Algerian companies: NIF is 15 digits
 */
export interface Company {
  id: string;
  name: string;
  nif: string;           // 15-digit Numéro d'Identification Fiscale
  rc: string;            // Registre du Commerce (9-14 alphanum)
  nis: string;           // Numéro d'Identification Statistique (10 digits)
  ai: string;           // Identifiant d'Acte (10 digits)
  phone: string;
  address: string;
  email?: string;        // Contact email (shown on letterhead)
  fax?: string;          // Fax number
  logo?: string;         // Base64 data URL or file path
  tvaRate: 9 | 19;       // Default TVA rate
  capital?: string;      // Share capital
  activity?: string;     // Activité / tagline (e.g. "Importation · Vente · SAV")
  rib?: string;          // Bank RIB
  ccp?: string;          // CCP (postal) account
  bankName?: string;     // Bank name + agency
  signature?: string;    // Base64 signature image
}

/**
 * Client — a customer of the company
 */
export interface Client {
  id: string;
  name: string;
  nif?: string;          // Client's NIF (11 or 15 digits)
  rc?: string;           // Client's RC (Registre du Commerce)
  nis?: string;          // Client's NIS
  ai?: string;           // Client's AI (Identifiant / Article d'Imposition)
  phone: string;
  email?: string;
  address?: string;
  // Country-specific fields
  ice?: string;          // Morocco
  siret?: string;        // France
}

/**
 * LineItem — a single item/prestation in a document
 * Each item can have its own TVA rate
 */
export interface LineItem {
  id: string;
  code?: string;         // Optional article code (e.g. "DEM-COM")
  label: string;         // Designation / description
  quantity: number;
  unit: UnitMeasure;
  unitPrice: number;
  tvaRate: 0 | 9 | 19;   // TVA rate per item
  remise?: number;       // Optional per-line discount % (RIS.%), 0–100
  category?: string;     // Groups items under category headers in the document
  totalHT: number;       // Computed: quantity * unitPrice * (1 - remise/100)
}

/**
 * Document — a devis, facture, proforma, BC, or BR
 */
export interface Document {
  id: string;
  type: DocumentType;
  number: string;        // e.g., "DEV-2026-00001"
  date: string;          // ISO date string
  dueDate?: string;      // Payment due date (for factures)

  // Related entities
  company: Company;
  client: Client;
  items: LineItem[];

  // Financial totals
  totalHT: number;       // Sous-total hors taxes
  totalTVA: number;      // Total TVA
  timbreFiscal: boolean; // Whether timbre applies
  timbreAmount: number;  // Fixed: 1000 DA
  totalTTC: number;      // Total toutes taxes comprises

  // Status & settings
  status: DocumentStatus;
  language: Language;
  paymentMode: PaymentMode;
  mode?: UserMode;

  // Optional
  objet?: string;        // OBJET — purpose/subject of the document
  notes?: string;
  validUntil?: string;   // Devis validity date
  acompte?: number;      // Deposit amount

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
  /** PDF style template: classic | haussmann | nordic | velours | industrielle */
  template?: string;

  // BL (Bon de Livraison) fields
  delivererName?: string;
  delivererIdCard?: string;
  transporterName?: string;
  transporterIdCard?: string;
  deliveryAddress?: string;

  // Editor section data (persisted locally with the document)
  // ── Générales ──
  docNumber?: string;
  issueDate?: string;
  city?: string;
  tvaRate?: 9 | 19;
  // ── Complémentaires ──
  ccp?: string;
  // ── Paiement ──
  paymentDeposit?: number;
  paymentConditions?: string;
  // ── Garanties ──
  garantieLabor?: string;
  garantieMaterials?: string;
  garantieDuration?: string;
  garantieNotes?: string;
  // ── Signature ──
  signatoryName?: string;
  signatoryTitle?: string;
  sigClientName?: string;
  sigClientRole?: string;
  // ── Remise ──
  remiseType?: string;
  remiseValue?: number;
  remiseReason?: string;
  // ── Chantier ──
  chantierAddress?: string;
  chantierType?: string;
  chantierSurface?: string;
  // ── Matériaux ──
  materiauxBrand?: string;
  materiauxType?: string;
  materiauxColor?: string;
  materiauxQty?: number;
}

// ── User & Auth ──────────────────────────────────────────────

/**
 * User — the app user
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  plan: Plan;
  company?: Company;
  language: Language;
  createdAt: string;
}

/**
 * Auth session
 */
export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// ── Mobile-specific types ────────────────────────────────────

/**
 * Wizard state for document creation
 */
export interface WizardState {
  step: 1 | 2 | 3 | 4;
  documentType: DocumentType;
  client: Partial<Client>;
  items: LineItem[];
  notes: string;
  language: Language;
}

/**
 * Offline sync status
 */
export interface SyncStatus {
  isOnline: boolean;
  pendingSync: number;
  lastSyncAt?: string;
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  totalDocuments: number;
  totalPaid: number;
  totalUnpaid: number;
  totalDraft: number;
  monthlyRevenue: number;
}

// ── Constants ────────────────────────────────────────────────

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  DEVIS: 'Devis',
  FACTURE: 'Facture',
  PROFORMA: 'Proforma',
  BC: 'Bon de Commande',
  BR: 'Bon de Réception',
  BL: 'Bon de Livraison',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  PAID: 'Payé',
  CANCELLED: 'Annulé',
};

export const UNIT_LABELS: Record<UnitMeasure, string> = {
  u: 'Unité',
  h: 'Heure',
  j: 'Jour',
  m2: 'm²',
  m3: 'm³',
  ml: 'ml',
  kg: 'kg',
  forfait: 'Forfait',
};

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: 'Gratuit',
  PRO: 'Pro',
  ENTERPRISE: 'Entreprise',
};

export const TIMBRE_FISCAL_AMOUNT = 1000; // DA — fixed per Art. 220 CII

export const PLAN_LIMITS: Record<Plan, { maxDocuments: number; maxClients: number }> = {
  FREE: { maxDocuments: 5, maxClients: 10 },
  PRO: { maxDocuments: -1, maxClients: -1 },     // unlimited
  ENTERPRISE: { maxDocuments: -1, maxClients: -1 }, // unlimited
};
