// ============================================================
// CloudDevis — DGI (Direction Générale des Impôts) Engine
// Single source of truth for Algerian tax validation & calculation
// ============================================================

// ── Validation Constants ─────────────────────────────────────

/**
 * NIF (Numéro d'Identification Fiscale):
 * - 15 digits for companies / moral persons
 * - 11 digits for individuals / physical persons
 */
const NIF_COMPANY_REGEX = /^\d{15}$/;
const NIF_INDIVIDUAL_REGEX = /^\d{11}$/;

/**
 * RC (Registre du Commerce):
 * Format: Typically Wilaya code (2 digits) + 7-12 alphanumeric characters
 */
const RC_REGEX = /^[A-Z0-9]{9,14}$/;

/**
 * NIS (Numéro d'Identification Statistique):
 * Exactly 10 digits (issued by INS)
 */
const NIS_REGEX = /^\d{10}$/;

/**
 * AI (Identifiant d'Acte / Article d'Imposition):
 * Exactly 10 digits
 */
const AI_REGEX = /^\d{10}$/;

// ── Timbre Fiscal Constants (Art. 220 CII) ───────────────────

/**
 * Timbre fiscal amount — fixed 1,000 DA for all invoices
 * per Art. 220 of the Code des Impôts Indirects (CII)
 * Applies to all documents except devis and attachements
 */
export const TIMBRE_FISCAL_AMOUNT = 1000;

/**
 * Minimum TTC threshold for timbre fiscal applicability
 * Art. 220 CII: applies when total TTC >= 10,000 DA
 */
export const TIMBRE_FISCAL_THRESHOLD = 10_000;

// ── TVA Rates (Algeria) ──────────────────────────────────────

/**
 * Official TVA rates in Algeria
 * - 0%: Exempt goods/services (exports, health, education)
 * - 9%: Reduced rate (food, medicine, agricultural inputs)
 * - 19%: Standard rate (most goods and services)
 */
export const TVA_RATES = [0, 9, 19] as const;
export type TvaRate = (typeof TVA_RATES)[number];

// ── Validation Functions ─────────────────────────────────────

/**
 * Validate NIF — supports both formats:
 * - 15 digits for companies
 * - 11 digits for individuals
 *
 * @param nif - The NIF string to validate
 * @returns true if valid (11 or 15 digits)
 */
export function validateNIF(nif: string): boolean {
  if (!nif || typeof nif !== 'string') return false;
  const cleaned = nif.trim();
  return NIF_COMPANY_REGEX.test(cleaned) || NIF_INDIVIDUAL_REGEX.test(cleaned);
}

/**
 * Check if NIF is a company NIF (15 digits)
 */
export function isCompanyNIF(nif: string): boolean {
  return NIF_COMPANY_REGEX.test(nif?.trim() ?? '');
}

/**
 * Check if NIF is an individual NIF (11 digits)
 */
export function isIndividualNIF(nif: string): boolean {
  return NIF_INDIVIDUAL_REGEX.test(nif?.trim() ?? '');
}

/**
 * Validate RC (Registre du Commerce)
 * Format: 9-14 alphanumeric characters (uppercase)
 *
 * @param rc - The RC string to validate
 * @returns true if valid
 */
export function validateRC(rc: string): boolean {
  if (!rc || typeof rc !== 'string') return false;
  return RC_REGEX.test(rc.trim().toUpperCase());
}

/**
 * Validate NIS (Numéro d'Identification Statistique)
 * Exactly 10 digits
 *
 * @param nis - The NIS string to validate
 * @returns true if valid
 */
export function validateNIS(nis: string): boolean {
  if (!nis || typeof nis !== 'string') return false;
  return NIS_REGEX.test(nis.trim());
}

/**
 * Validate AI (Identifiant d'Acte)
 * Exactly 10 digits
 *
 * @param ai - The AI string to validate
 * @returns true if valid
 */
export function validateAI(ai: string): boolean {
  if (!ai || typeof ai !== 'string') return false;
  return AI_REGEX.test(ai.trim());
}

/**
 * Validate all company tax identifiers at once
 *
 * @param taxIds - Object containing tax IDs
 * @returns Validation result with any errors
 */
export function validateCompanyTaxIds(taxIds: {
  nif?: string;
  rc?: string;
  nis?: string;
  ai?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (taxIds.nif && !validateNIF(taxIds.nif)) {
    errors.nif = 'NIF invalide: 11 ou 15 chiffres requis';
  }
  if (taxIds.rc && !validateRC(taxIds.rc)) {
    errors.rc = 'RC invalide: 9-14 caractères alphanumériques requis';
  }
  if (taxIds.nis && !validateNIS(taxIds.nis)) {
    errors.nis = 'NIS invalide: exactement 10 chiffres requis';
  }
  if (taxIds.ai && !validateAI(taxIds.ai)) {
    errors.ai = 'AI invalide: exactement 10 chiffres requis';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Timbre Fiscal Logic ──────────────────────────────────────

/**
 * Determine if timbre fiscal applies to this document
 *
 * Rules (Art. 220 CII):
 * - Applies to all documents EXCEPT devis and attachements
 * - Applies when total TTC >= 10,000 DA
 * - Amount is fixed at 1,000 DA
 *
 * @param documentType - The type of document
 * @param totalTTC - Total TTC amount
 * @returns true if timbre fiscal should be applied
 */
export function shouldApplyTimbre(
  documentType: string,
  totalTTC: number
): boolean {
  // Devis and attachements are exempt
  const exemptTypes = ['DEVIS', 'devis', 'ATTACHEMENT', 'attachement'];
  if (exemptTypes.includes(documentType)) return false;

  // Must meet threshold
  return totalTTC >= TIMBRE_FISCAL_THRESHOLD;
}

/**
 * Calculate timbre fiscal amount
 * Fixed 1,000 DA per Art. 220 CII
 *
 * @param applies - Whether timbre applies
 * @returns 1000 if applies, 0 otherwise
 */
export function calculateTimbreFiscal(applies: boolean): number {
  return applies ? TIMBRE_FISCAL_AMOUNT : 0;
}

// ── Document Calculation Engine ───────────────────────────────

export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  tvaRate: number;
}

export interface DocumentCalculationResult {
  subTotalHT: number;
  totalTVA: number;
  totalTTC: number;
  timbreFiscal: boolean;
  timbreAmount: number;
  netAPayer: number;
}

/**
 * Calculate all document totals from line items
 *
 * @param items - Array of line items
 * @param documentType - Type of document (for timbre logic)
 * @param acompte - Optional deposit amount
 * @returns Complete calculation result
 */
export function calculateDocumentTotals(
  items: LineItemInput[],
  documentType: string,
  acompte: number = 0
): DocumentCalculationResult {
  let subTotalHT = 0;
  let totalTVA = 0;

  for (const item of items) {
    const itemHT = item.quantity * item.unitPrice;
    const itemTVA = itemHT * item.tvaRate / 100;
    subTotalHT += itemHT;
    totalTVA += itemTVA;
  }

  // Round to avoid floating point issues
  subTotalHT = Math.round(subTotalHT * 100) / 100;
  totalTVA = Math.round(totalTVA * 100) / 100;

  const totalTTC = Math.round((subTotalHT + totalTVA) * 100) / 100;

  // Timbre fiscal
  const timbreFiscal = shouldApplyTimbre(documentType, totalTTC);
  const timbreAmount = calculateTimbreFiscal(timbreFiscal);

  const netAPayer = Math.round((totalTTC + timbreAmount - acompte) * 100) / 100;

  return {
    subTotalHT,
    totalTVA,
    totalTTC,
    timbreFiscal,
    timbreAmount,
    netAPayer,
  };
}

// ── Document Numbering ────────────────────────────────────────

/**
 * Generate a document number in standard format
 * Format: PREFIX-YYYY-NNNNN
 *
 * @param type - Document type
 * @param sequenceNumber - Sequential number (1-based)
 * @returns Formatted document number
 */
export function generateDocNumber(
  type: string,
  sequenceNumber: number = 1
): string {
  const prefixMap: Record<string, string> = {
    DEVIS: 'DEV',
    FACTURE: 'FAC',
    PROFORMA: 'PRO',
    BC: 'BC',
    BR: 'BR',
    INTERVENTION: 'INT',
    ATTACHEMENT: 'ATT',
  };

  const prefix = prefixMap[type.toUpperCase()] || 'DOC';
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(5, '0');

  return `${prefix}-${year}-${seq}`;
}

// ── Currency Formatting ───────────────────────────────────────

/**
 * Format amount as Algerian Dinar currency
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: DA)
 * @returns Formatted string, e.g. "1 234,56 DA"
 */
export function formatCurrency(amount: number, currency: string = 'DA'): string {
  return amount.toLocaleString('fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ' + currency;
}

/**
 * Format date in Algerian format (DD/MM/YYYY)
 *
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDateAlgerian(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Number to Words (Tafqit) ─────────────────────────────────

/**
 * Convert number to French words (for invoice total in words)
 *
 * @param n - Amount to convert
 * @returns French text representation
 */
export function numberToFrenchWords(n: number): string {
  if (n <= 0) return 'Zéro dinar algérien';

  const intPart = Math.floor(Math.abs(n));
  const decPart = Math.round((Math.abs(n) - intPart) * 100);

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  function toWords(num: number): string {
    if (num === 0) return '';
    let r = '';
    if (num >= 1000000) { r += toWords(Math.floor(num / 1000000)) + ' million '; num %= 1000000; }
    if (num >= 1000) { const k = Math.floor(num / 1000); r += (k === 1 ? 'mille ' : toWords(k) + ' mille '); num %= 1000; }
    if (num >= 100) { const h = Math.floor(num / 100); r += (h === 1 ? 'cent ' : units[h] + ' cent '); num %= 100; }
    if (num >= 20) {
      const t = Math.floor(num / 10);
      const u = num % 10;
      if (t === 7 || t === 9) { r += tens[t - 1] + (u > 0 ? '-' + units[10 + u] : '') + ' '; }
      else { r += tens[t] + (u > 0 ? '-' + units[u] : '') + ' '; }
    } else if (num > 0) { r += units[num] + ' '; }
    return r;
  }

  let result = toWords(intPart) + 'dinar' + (intPart > 1 ? 's' : '') + ' algérien' + (intPart > 1 ? 's' : '');
  if (decPart > 0) result += ' et ' + toWords(decPart) + 'centime' + (decPart > 1 ? 's' : '');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Convert number to Arabic words (for invoice total in words)
 *
 * @param n - Amount to convert
 * @returns Arabic text representation
 */
export function numberToArabicWords(n: number): string {
  if (n === 0) return 'صفر دينار جزائري';

  const intPart = Math.floor(Math.abs(n));
  const decPart = Math.round((Math.abs(n) - intPart) * 100);
  const u = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const t = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

  function toWords(num: number): string {
    if (num === 0) return '';
    let r = '';
    if (num >= 1000000) { r += toWords(Math.floor(num / 1000000)) + ' مليون '; num %= 1000000; }
    if (num >= 1000) { const k = Math.floor(num / 1000); r += (k === 1 ? 'ألف ' : toWords(k) + ' ألف '); num %= 1000; }
    if (num >= 100) { const h = Math.floor(num / 100); r += (h === 1 ? 'مائة ' : h === 2 ? 'مئتان ' : u[h] + ' مائة '); num %= 100; }
    if (num >= 20) { const d = Math.floor(num / 10); const o = num % 10; r += (o ? u[o] + ' و ' : '') + t[d] + ' '; }
    else if (num > 0) r += u[num] + ' ';
    return r;
  }

  let result = toWords(intPart) + 'دينار جزائري';
  if (decPart > 0) result += ' و ' + toWords(decPart) + 'سنتيم';
  return result.trim();
}
