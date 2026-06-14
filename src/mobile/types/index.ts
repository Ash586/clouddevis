// ============================================================
// CloudDevis Mobile — TypeScript Interfaces
// All data types for the mobile invoicing app
// ============================================================

// ── Enums / Union Types ──────────────────────────────────────

/** Types of documents supported */
export type DocumentType = 'DEVIS' | 'FACTURE' | 'PROFORMA' | 'BC' | 'BR';

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
  logo?: string;         // Base64 data URL or file path
  tvaRate: 9 | 19;       // Default TVA rate
  capital?: string;      // Share capital
  signature?: string;    // Base64 signature image
}

/**
 * Client — a customer of the company
 */
export interface Client {
  id: string;
  name: string;
  nif?: string;          // Client's NIF (15 digits for companies)
  rc?: string;           // Client's RC
  nis?: string;          // Client's NIS
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
  label: string;         // Designation / description
  quantity: number;
  unit: UnitMeasure;
  unitPrice: number;
  tvaRate: 0 | 9 | 19;   // TVA rate per item
  totalHT: number;       // Computed: quantity * unitPrice
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

  // Optional
  notes?: string;
  validUntil?: string;   // Devis validity date
  acompte?: number;      // Deposit amount
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
