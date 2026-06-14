import type { DocumentState, CalculationResult } from '@/types';
import {
  shouldApplyTimbre,
  calculateTimbreFiscal,
  numberToFrenchWords as dgiNumberToFrenchWords,
  numberToArabicWords as dgiNumberToArabicWords,
  formatCurrency as dgiFormatCurrency,
  generateDocNumber as dgiGenerateDocNumber,
} from './dgi';

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

  // Timbre fiscal — fixed 1,000 DA per Art. 220 CII
  // Applies to all documents except devis and attachements, when total TTC >= 10,000 DA
  const timbreApplies = shouldApplyTimbre(doc.documentType, totalTTC);
  const timbreFiscal = calculateTimbreFiscal(timbreApplies);

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
    totalInWords: dgiNumberToFrenchWords(netAPayer),
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

