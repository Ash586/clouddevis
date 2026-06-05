import type { DocumentState, CalculationResult } from '@/types';

export function calculateDocument(doc: DocumentState): CalculationResult {
  const subTotalHT = doc.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  const discountAmount = doc.discount.value > 0
    ? doc.discount.type === 'percentage'
      ? subTotalHT * doc.discount.value / 100
      : doc.discount.value
    : 0;

  const totalHTAfterDiscount = subTotalHT - discountAmount;
  const tvaAmount = totalHTAfterDiscount * doc.tvaRate / 100;
  const totalTTC = totalHTAfterDiscount + tvaAmount;

  const isCash = doc.paymentMode === 'especes';
  const timbreRate = (doc.stampDuty?.rate ?? 1) / 100;
  const timbreMin = doc.stampDuty?.minAmount ?? 5;
  const timbreMax = doc.stampDuty?.maxAmount ?? 2500;
  const timbreFiscal = isCash ? Math.min(Math.max(totalTTC * timbreRate, timbreMin), timbreMax) : 0;

  const acompte = doc.acompte ?? 0;
  const netAPayer = totalTTC + timbreFiscal - acompte;

  return {
    subTotalHT,
    tvaRate: doc.tvaRate,
    tvaAmount,
    timbreFiscal,
    discountAmount,
    totalHTAfterDiscount,
    totalTTC,
    acompte,
    netAPayer,
    totalInWords: numberToFrenchWords(netAPayer),
  };
}

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
      else { r += tens[t] + (u > 0 ? (t === 8 ? '-' : '-') + units[u] : '') + ' '; }
    } else if (num > 0) { r += units[num] + ' '; }
    return r;
  }

  let result = toWords(intPart) + 'dinar' + (intPart > 1 ? 's' : '') + ' algérien' + (intPart > 1 ? 's' : '');
  if (decPart > 0) result += ' et ' + toWords(decPart) + 'centime' + (decPart > 1 ? 's' : '');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function tafqitAr(n: number): string {
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

export function formatCurrency(amount: number, currency = 'DA'): string {
  return amount.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
}

export function generateDocumentNumber(type: string, mode: string): string {
  const prefix = type === 'facture' ? 'FAC' : type === 'bc' ? 'BC' : type === 'br' ? 'BR' : 'DEV';
  const year = new Date().getFullYear();
  return `${prefix}-${year}-00001`;
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 9);
  }
  return Math.random().toString(36).substring(2, 11);
}

