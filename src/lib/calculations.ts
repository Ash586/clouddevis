import type { DocumentState, CalculationResult } from '@/types';
import {
  calculateDocumentFull,
  numberToFrenchWords as dgiNumberToFrenchWords,
  numberToArabicWords as dgiNumberToArabicWords,
  formatCurrency as dgiFormatCurrency,
  generateDocNumber as dgiGenerateDocNumber,
} from './dgi';

/** Round to 2 decimals (centimes) to avoid binary floating-point drift on money. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateDocument(doc: DocumentState): CalculationResult {
  const items = doc.items.map(it => ({
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    tvaRate: doc.tvaRate,
  }));

  const result = calculateDocumentFull(
    items,
    doc.documentType,
    doc.discount,
    doc.acompte ?? 0,
    doc.paymentMode
  );

  // Bon de Livraison carries no VAT / timbre / TTC — only HT amounts.
  // Zeroing the tax here makes every downstream renderer (HTML templates,
  // PDF engine, live preview) hide the tax rows via their existing guards.
  if (doc.documentType === 'bl') {
    const ht = result.totalHTAfterDiscount;
    return {
      subTotalHT: result.subTotalHT,
      tvaRate: 0,
      tvaAmount: 0,
      timbreFiscal: 0,
      discountAmount: result.discountAmount,
      totalHTAfterDiscount: ht,
      totalTTC: ht,
      acompte: 0,
      netAPayer: ht,
      totalInWords: dgiNumberToFrenchWords(ht),
    };
  }

  return {
    subTotalHT: result.subTotalHT,
    tvaRate: doc.tvaRate,
    tvaAmount: result.totalTVA,
    timbreFiscal: result.timbreAmount,
    discountAmount: result.discountAmount,
    totalHTAfterDiscount: result.totalHTAfterDiscount,
    totalTTC: result.totalTTC,
    acompte: result.acompte,
    netAPayer: result.netAPayer,
    totalInWords: dgiNumberToFrenchWords(result.netAPayer),
  };
}

export function numberToFrenchWords(n: number): string {
  return dgiNumberToFrenchWords(n);
}

export function tafqitAr(n: number): string {
  return dgiNumberToArabicWords(n);
}

export function formatCurrency(amount: number, currency = 'DA'): string {
  return dgiFormatCurrency(amount, currency);
}

export function generateDocumentNumber(type: string, mode: string, sequenceNumber?: number): string {
  return dgiGenerateDocNumber(type, sequenceNumber);
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

