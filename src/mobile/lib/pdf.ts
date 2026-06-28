// ============================================================
// CloudDevis Mobile — PDF Generation Helper
// Wraps the packages/pdf-engine for mobile use
// ============================================================

import { logger } from '@/lib/logger';
import { generatePDFBase64 as engineGeneratePDF } from '../../../packages/pdf-engine';
import { numberToFrenchWords, numberToArabicWords } from '../../lib/dgi';
import type { PDFDocumentData } from '../../../packages/pdf-engine';
import type { Document } from '../types';

/**
 * Generate a PDF from a Document object and return as base64.
 * Uses @react-pdf/renderer via the pdf-engine package.
 *
 * @param doc - The document to generate PDF for
 * @returns Base64-encoded PDF string
 */
export async function generatePDFBase64FromDoc(doc: Document): Promise<string> {
  const pdfData: PDFDocumentData = {
    type: doc.type,
    number: doc.number,
    date: doc.date,
    dueDate: doc.dueDate,
    validUntil: doc.validUntil,
    notes: doc.notes,
    company: {
      name: doc.company.name,
      nif: doc.company.nif,
      rc: doc.company.rc,
      nis: doc.company.nis,
      ai: doc.company.ai,
      phone: doc.company.phone,
      address: doc.company.address,
      logo: doc.company.logo,
      capital: doc.company.capital,
      signature: doc.company.signature,
    },
    client: {
      name: doc.client.name,
      nif: doc.client.nif,
      rc: doc.client.rc,
      nis: doc.client.nis,
      phone: doc.client.phone,
      email: doc.client.email,
      address: doc.client.address,
    },
    items: doc.items.map((item) => ({
      label: item.label,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      tvaRate: item.tvaRate,
      totalHT: item.totalHT,
    })),
    totalHT: doc.totalHT,
    totalTVA: doc.totalTVA,
    timbreFiscal: doc.timbreFiscal,
    timbreAmount: doc.timbreAmount,
    totalTTC: doc.totalTTC,
    totalInWords: doc.language === 'AR'
      ? numberToArabicWords(doc.totalTTC + doc.timbreAmount - (doc.acompte || 0))
      : numberToFrenchWords(doc.totalTTC + doc.timbreAmount - (doc.acompte || 0)),
    language: doc.language,
    companyTagline: doc.companyTagline,
    companyCapital: doc.companyCapital,
    rcNumber: doc.rcNumber,
    nisNumber: doc.nisNumber,
    aiNumber: doc.aiNumber,
    rib: doc.rib,
    bankName: doc.bankName,
    bankAgency: doc.bankAgency,
    ccpNumber: doc.ccpNumber,
    validityDays: doc.validityDays,
    reference: doc.reference,
    showWatermark: doc.status === 'DRAFT',
  };

  return engineGeneratePDF(pdfData);
}

/**
 * Generate a PDF from document options (legacy interface).
 * Maintains backward compatibility with existing code.
 *
 * @param options - Document data in the old format
 * @returns Base64-encoded PDF string
 */
export async function generatePDFBase64(options: {
  docNumber: string;
  docType: string;
  clientName: string;
  clientAddress?: string;
  clientNif?: string;
  items: Array<{
    designation: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subTotalHT: number;
  tvaAmount: number;
  timbreFiscal: number;
  totalTTC: number;
  totalInWords: string;
  companyName?: string;
  companyAddress?: string;
  companyNif?: string;
  companyRc?: string;
  companyNis?: string;
  companyAi?: string;
  date?: string;
  notes?: string;
}): Promise<string> {
  const pdfData: PDFDocumentData = {
    type: (options.docType.toUpperCase() as PDFDocumentData['type']) || 'FACTURE',
    number: options.docNumber,
    date: options.date || new Date().toISOString().split('T')[0],
    notes: options.notes,
    company: {
      name: options.companyName || '',
      nif: options.companyNif || '',
      rc: options.companyRc || '',
      nis: options.companyNis || '',
      ai: options.companyAi,
      address: options.companyAddress || '',
    },
    client: {
      name: options.clientName,
      address: options.clientAddress,
      nif: options.clientNif,
    },
    items: options.items.map((item) => ({
      label: item.designation,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      tvaRate: 19, // Default, will be overridden per item
      totalHT: item.total,
    })),
    totalHT: options.subTotalHT,
    totalTVA: options.tvaAmount,
    timbreFiscal: options.timbreFiscal > 0,
    timbreAmount: options.timbreFiscal,
    totalTTC: options.totalTTC,
    totalInWords: options.totalInWords,
    language: 'FR',
  };

  return engineGeneratePDF(pdfData);
}

/**
 * Trigger a download of a base64-encoded PDF.
 * Works in the browser and in the Android WebView (hands off to the
 * system download manager via an anchor with the `download` attribute).
 */
export function downloadDocument(base64: string, fileName: string): void {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    logger.error('Failed to download PDF');
  }
}

/**
 * Open PDF in a new window for printing (browser fallback).
 */
export function printDocument(base64OrHtml: string): void {
  // If it looks like HTML (starts with <), treat as legacy
  if (base64OrHtml.trimStart().startsWith('<')) {
    const blob = new Blob([base64OrHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }

  // Otherwise, decode base64 PDF and open
  try {
    const binary = atob(base64OrHtml);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    logger.error('Failed to open PDF for printing');
  }
}
