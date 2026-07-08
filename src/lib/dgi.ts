// ============================================================
// Rakmana — DGI (Direction Générale des Impôts) Engine
// Single source of truth for Algerian tax validation & calculation
// ============================================================

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

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
 * - Exempt when payment is by cheque or virement (non-cash)
 * - Amount is fixed at 1,000 DA
 *
 * @param documentType - The type of document
 * @param totalTTC - Total TTC amount
 * @param paymentMode - Payment mode (especes | cheque | virement | cb)
 * @returns true if timbre fiscal should be applied
 */
export function shouldApplyTimbre(
  documentType: string,
  totalTTC: number,
  paymentMode?: string
): boolean {
  // Devis and attachements are exempt
  // BL (bon de livraison) carries no fiscal stamp, no TVA, no TTC.
  const exemptTypes = ['DEVIS', 'devis', 'ATTACHEMENT', 'attachement', 'BL', 'bl'];
  if (exemptTypes.includes(documentType)) return false;

  // Cheque and virement are exempt per Art. 220 CII
  const exemptModes = ['cheque', 'virement'];
  if (paymentMode && exemptModes.includes(paymentMode.toLowerCase())) return false;

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

export interface DiscountInput {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface FullDocumentCalculationResult {
  subTotalHT: number;
  discountAmount: number;
  totalHTAfterDiscount: number;
  totalTVA: number;
  totalTTC: number;
  timbreFiscal: boolean;
  timbreAmount: number;
  acompte: number;
  netAPayer: number;
}

/**
 * Unified calculation engine — single source of truth for all platforms.
 * Supports per-item TVA rates, discount (percentage or fixed), paymentMode.
 */
export function calculateDocumentFull(
  items: LineItemInput[],
  documentType: string,
  discount: DiscountInput = { type: 'percentage', value: 0 },
  acompte: number = 0,
  paymentMode?: string
): FullDocumentCalculationResult {
  let subTotalHT = 0;
  let totalTVA = 0;

  for (const item of items) {
    const itemHT = item.quantity * item.unitPrice;
    subTotalHT += itemHT;
    // TVA applied after discount proportionally per item
  }

  subTotalHT = round2(subTotalHT);

  const discountAmount = round2(
    discount.value > 0
      ? discount.type === 'percentage'
        ? subTotalHT * discount.value / 100
        : discount.value
      : 0
  );

  const totalHTAfterDiscount = round2(subTotalHT - discountAmount);

  // Recompute TVA on discounted HT, preserving per-item rates weighted by item share
  if (subTotalHT > 0) {
    const discountRatio = totalHTAfterDiscount / subTotalHT;
    for (const item of items) {
      const itemHT = item.quantity * item.unitPrice;
      totalTVA += itemHT * discountRatio * item.tvaRate / 100;
    }
  } else {
    for (const item of items) {
      totalTVA += item.quantity * item.unitPrice * item.tvaRate / 100;
    }
  }

  totalTVA = round2(totalTVA);
  const totalTTC = round2(totalHTAfterDiscount + totalTVA);

  const timbreFiscal = shouldApplyTimbre(documentType, totalTTC, paymentMode);
  const timbreAmount = calculateTimbreFiscal(timbreFiscal);
  const netAPayer = round2(totalTTC + timbreAmount - acompte);

  return {
    subTotalHT,
    discountAmount,
    totalHTAfterDiscount,
    totalTVA,
    totalTTC,
    timbreFiscal,
    timbreAmount,
    acompte,
    netAPayer,
  };
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
  acompte: number = 0,
  paymentMode?: string
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
  subTotalHT = round2(subTotalHT);
  totalTVA = round2(totalTVA);

  const totalTTC = round2(subTotalHT + totalTVA);

  // Timbre fiscal
  const timbreFiscal = shouldApplyTimbre(documentType, totalTTC, paymentMode);
  const timbreAmount = calculateTimbreFiscal(timbreFiscal);

  const netAPayer = round2(totalTTC + timbreAmount - acompte);

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
    BL: 'BL',
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
    if (num >= 1000000) {
      const m = Math.floor(num / 1000000);
      r += toWords(m) + (m > 1 ? ' millions ' : ' million ');
      num %= 1000000;
    }
    if (num >= 1000) { const k = Math.floor(num / 1000); r += (k === 1 ? 'mille ' : toWords(k) + ' mille '); num %= 1000; }
    if (num >= 100) {
      const h = Math.floor(num / 100);
      const rem = num % 100;
      if (h === 1) { r += 'cent '; }
      else { r += units[h] + (rem === 0 ? ' cents ' : ' cent '); }
      num = rem;
    }
    if (num >= 20) {
      const t = Math.floor(num / 10);
      const u = num % 10;
      if (t === 7) {
        // 70-79: soixante-dix à soixante-dix-neuf
        r += 'soixante-' + units[10 + u] + ' ';
      } else if (t === 8) {
        // 80-89: quatre-vingts / quatre-vingt-un …
        r += 'quatre-vingt' + (u === 0 ? 's' : '-' + units[u]) + ' ';
      } else if (t === 9) {
        // 90-99: quatre-vingt-dix à quatre-vingt-dix-neuf
        r += 'quatre-vingt-' + units[10 + u] + ' ';
      } else {
        r += tens[t] + (u > 0 ? '-' + units[u] : '') + ' ';
      }
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
