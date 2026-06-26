// ============================================================
// CloudDevis Mobile — Zod Schemas
// Runtime validation with DGI Algerian rules
// ============================================================

import { z } from 'zod';
import { round2 } from '@/lib/calculations';
import type { LineItem } from './index';

// ── DGI Validation Constants ─────────────────────────────────

/** NIF for Algerian companies: exactly 15 digits */
const NIF_REGEX = /^\d{15}$/;

/** NIF for Algerian individuals: exactly 11 digits */
const NIF_INDIVIDUAL_REGEX = /^\d{11}$/;

/** RC: 9-14 alphanumeric characters */
const RC_REGEX = /^[A-Z0-9]{9,14}$/;

/** NIS: exactly 10 digits */
const NIS_REGEX = /^\d{10}$/;

/** AI (Identifiant d'Acte): exactly 10 digits */
const AI_REGEX = /^\d{10}$/;

// ── Custom Zod Effects ───────────────────────────────────────

/**
 * NIF validation — supports both formats:
 * - 15 digits for companies
 * - 11 digits for individuals
 */
const nifField = z.string().refine(
  (val) => val === '' || NIF_REGEX.test(val) || NIF_INDIVIDUAL_REGEX.test(val),
  { message: 'NIF invalide: 11 ou 15 chiffres requis' }
);

/**
 * NIF validation — company only (15 digits)
 */
const nifCompanyField = z.string().refine(
  (val) => val === '' || NIF_REGEX.test(val),
  { message: 'NIF invalide: exactement 15 chiffres requis' }
);

/**
 * RC validation — Algerian format
 */
const rcField = z.string().refine(
  (val) => val === '' || RC_REGEX.test(val),
  { message: 'RC invalide: 9-14 caractères alphanumériques requis' }
);

/**
 * NIS validation — exactly 10 digits
 */
const nisField = z.string().refine(
  (val) => val === '' || NIS_REGEX.test(val),
  { message: 'NIS invalide: exactement 10 chiffres requis' }
);

/**
 * AI validation — exactly 10 digits
 */
const aiField = z.string().refine(
  (val) => val === '' || AI_REGEX.test(val),
  { message: 'AI invalide: exactement 10 chiffres requis' }
);

// ── Zod Schemas ──────────────────────────────────────────────

/**
 * Company schema
 */
export const CompanySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nom de société requis').max(200),
  nif: nifCompanyField,
  rc: rcField,
  nis: nisField,
  ai: aiField,
  phone: z.string().min(8, 'Numéro de téléphone invalide').max(20),
  address: z.string().min(5, 'Adresse requise').max(500),
  logo: z.string().optional(),
  tvaRate: z.union([z.literal(9), z.literal(19)]),
  capital: z.string().optional(),
  signature: z.string().optional(),
});

/**
 * Client schema
 */
export const ClientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nom du client requis').max(200),
  nif: nifField.optional().default(''),
  rc: rcField.optional().default(''),
  nis: nisField.optional().default(''),
  phone: z.string().min(8, 'Numéro de téléphone invalide').max(20),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().max(500).optional().default(''),
});

/**
 * LineItem schema
 * Each item has its own TVA rate
 */
export const LineItemSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1, 'Désignation requise').max(200),
  quantity: z.number().positive('La quantité doit être > 0').max(100000),
  unit: z.enum(['u', 'h', 'j', 'm2', 'm3', 'ml', 'kg', 'forfait']),
  unitPrice: z.number()
    .positive('Le prix unitaire doit être > 0')
    .max(1_000_000, 'Prix max 1 000 000 DA'),
  tvaRate: z.union([z.literal(0), z.literal(9), z.literal(19)]),
  totalHT: z.number().min(0),
}).refine(
  (data) => {
    // Verify totalHT = quantity * unitPrice (within rounding tolerance)
    const expected = round2(data.quantity * data.unitPrice);
    return Math.abs(data.totalHT - expected) < 0.02;
  },
  { message: 'Total HT ne correspond pas à quantité × prix unitaire', path: ['totalHT'] }
);

/**
 * Document schema
 */
export const DocumentSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR']),
  number: z.string().min(1, 'Numéro de document requis'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),

  company: CompanySchema,
  client: ClientSchema,
  items: z.array(LineItemSchema).min(1, 'Au moins un article requis'),

  totalHT: z.number().min(0),
  totalTVA: z.number().min(0),
  timbreFiscal: z.boolean(),
  timbreAmount: z.number().default(1000),
  totalTTC: z.number().min(0),

  status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']),
  language: z.enum(['FR', 'AR', 'EN']),
  paymentMode: z.enum(['cheque', 'virement', 'especes', 'cb']),

  notes: z.string().max(1000).optional(),
  validUntil: z.string().optional(),
  acompte: z.number().min(0).optional(),
}).refine(
  (data) => {
    // Verify totalTTC >= totalHT + totalTVA
    return data.totalTTC >= data.totalHT + data.totalTVA;
  },
  { message: 'Total TTC doit être >= Total HT + TVA', path: ['totalTTC'] }
).refine(
  (data) => {
    // Timbre amount should be 1000 when applied
    if (data.timbreFiscal) {
      return data.timbreAmount === 1000;
    }
    return data.timbreAmount === 0;
  },
  { message: 'Montant timbre: 1000 DA si applicable, 0 sinon', path: ['timbreAmount'] }
);

/**
 * User schema
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Nom requis').max(100),
  phone: z.string().optional(),
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
  company: CompanySchema.optional(),
  language: z.enum(['FR', 'AR', 'EN']).default('FR'),
  createdAt: z.string().datetime(),
});

/**
 * Auth schemas
 */
export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe: min 6 caractères'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(6, 'Mot de passe: min 6 caractères')
    .refine(
      (val) => {
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        return score >= 2;
      },
      { message: 'Mot de passe trop faible: ajoutez majuscule, chiffre ou caractère spécial' }
    ),
  name: z.string().min(2, 'Nom requis').max(100),
});

// ── Calculation Helpers ──────────────────────────────────────

/**
 * Calculate document totals from items
 */
export function calculateDocumentTotals(items: LineItem[]): {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
} {
  let totalHT = 0;
  let totalTVA = 0;

  for (const item of items) {
    const itemHT = item.quantity * item.unitPrice;
    const itemTVA = itemHT * item.tvaRate / 100;
    totalHT += itemHT;
    totalTVA += itemTVA;
  }

  const totalTTC = totalHT + totalTVA;

  return {
    totalHT: round2(totalHT),
    totalTVA: round2(totalTVA),
    totalTTC: round2(totalTTC),
  };
}

/**
 * Check if timbre fiscal applies
 * Art. 220 CII: applies to all invoices >= 10,000 DA (excluding devis)
 */
export function shouldApplyTimbre(
  documentType: string,
  totalTTC: number
): boolean {
  return documentType !== 'DEVIS' && totalTTC >= 10_000;
}

/**
 * Calculate final total with timbre
 */
export function calculateFinalTotal(
  totalTTC: number,
  timbreFiscal: boolean,
  acompte: number = 0
): { timbreAmount: number; netAPayer: number } {
  const timbreAmount = timbreFiscal ? 1000 : 0;
  const netAPayer = totalTTC + timbreAmount - acompte;
  return {
    timbreAmount,
    netAPayer: round2(netAPayer),
  };
}
