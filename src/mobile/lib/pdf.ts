// ============================================================
// Rakmana Mobile — PDF Generation Helper
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
    objet: doc.objet,
    acompte: doc.acompte,
    delivererName: doc.delivererName,
    delivererIdCard: doc.delivererIdCard,
    transporterName: doc.transporterName,
    transporterIdCard: doc.transporterIdCard,
    deliveryAddress: doc.deliveryAddress,
    company: {
      name: doc.company.name,
      nif: doc.company.nif,
      rc: doc.company.rc,
      nis: doc.company.nis,
      ai: doc.company.ai,
      phone: doc.company.phone,
      fax: doc.company.fax,
      email: doc.company.email,
      address: doc.company.address,
      logo: doc.company.logo,
      capital: doc.company.capital,
      activity: doc.company.activity,
      rib: doc.company.rib,
      ccp: doc.company.ccp,
      bankName: doc.company.bankName,
      signature: doc.company.signature,
    },
    client: {
      name: doc.client.name,
      nif: doc.client.nif,
      rc: doc.client.rc,
      nis: doc.client.nis,
      ai: doc.client.ai,
      phone: doc.client.phone,
      email: doc.client.email,
      address: doc.client.address,
    },
    items: doc.items.map((item) => ({
      label: item.label,
      code: item.code,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      tvaRate: item.tvaRate,
      remise: item.remise,
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
    mode: doc.mode,
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
  clientRc?: string;
  clientNis?: string;
  clientAi?: string;
  items: Array<{
    designation: string;
    code?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    tvaRate?: 0 | 9 | 19;
    remise?: number;
    total: number;
  }>;
  subTotalHT: number;
  tvaAmount: number;
  timbreFiscal: number;
  totalTTC: number;
  netAPayer?: number;
  acompte?: number;
  totalInWords: string;
  companyName?: string;
  companyAddress?: string;
  companyNif?: string;
  companyRc?: string;
  companyNis?: string;
  companyAi?: string;
  companyActivity?: string;
  companyCapital?: string;
  companyPhone?: string;
  companyFax?: string;
  companyEmail?: string;
  companyRib?: string;
  companyCcp?: string;
  companyBank?: string;
  companyLogo?: string;
  companySignature?: string;
  reference?: string;
  objet?: string;
  paymentMode?: string;
  date?: string;
  notes?: string;
  language?: 'FR' | 'AR' | 'EN';
}): Promise<string> {
  const pdfData: PDFDocumentData = {
    type: (options.docType.toUpperCase() as PDFDocumentData['type']) || 'FACTURE',
    number: options.docNumber,
    date: options.date || new Date().toISOString().split('T')[0],
    notes: options.notes,
    objet: options.objet,
    reference: options.reference,
    paymentMode: options.paymentMode,
    company: {
      name: options.companyName || '',
      nif: options.companyNif || '',
      rc: options.companyRc || '',
      nis: options.companyNis || '',
      ai: options.companyAi,
      phone: options.companyPhone,
      fax: options.companyFax,
      email: options.companyEmail,
      address: options.companyAddress || '',
      capital: options.companyCapital,
      activity: options.companyActivity,
      rib: options.companyRib,
      ccp: options.companyCcp,
      bankName: options.companyBank,
      logo: options.companyLogo,
      signature: options.companySignature,
    },
    client: {
      name: options.clientName,
      address: options.clientAddress,
      nif: options.clientNif,
      rc: options.clientRc,
      nis: options.clientNis,
      ai: options.clientAi,
    },
    items: options.items.map((item) => ({
      label: item.designation,
      code: item.code,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      tvaRate: item.tvaRate ?? 19,
      remise: item.remise,
      totalHT: item.total,
    })),
    totalHT: options.subTotalHT,
    totalTVA: options.tvaAmount,
    timbreFiscal: options.timbreFiscal > 0,
    timbreAmount: options.timbreFiscal,
    totalTTC: options.totalTTC,
    netAPayer: options.netAPayer,
    acompte: options.acompte,
    totalInWords: options.totalInWords,
    language: options.language ?? 'FR',
  };

  return engineGeneratePDF(pdfData);
}

/**
 * Trigger a download of a base64-encoded PDF.
 * On native (Capacitor): writes to cache then opens the OS share sheet,
 * which gives the user "Save to Downloads" and other options.
 * On browser: uses the anchor download attribute.
 */
export async function downloadDocument(base64: string, fileName: string): Promise<void> {
  const name = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  // Native (Capacitor) — write to cache then share sheet
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const { uri } = await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });
      await Share.share({ title: name, files: [uri], dialogTitle: 'Enregistrer le PDF' });
      return;
    }
  } catch {
    // fall through to browser download
  }

  // Browser fallback — anchor download
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
    a.download = name;
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
 * On native (Capacitor): uses Share sheet so the user can pick a print app.
 * On browser: opens in a new tab.
 */
export async function printDocument(base64OrHtml: string): Promise<void> {
  // If it looks like HTML (starts with <), treat as legacy
  if (base64OrHtml.trimStart().startsWith('<')) {
    const blob = new Blob([base64OrHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }

  // Native (Capacitor) — write to cache then open share sheet for printing
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const { uri } = await Filesystem.writeFile({ path: 'document.pdf', data: base64OrHtml, directory: Directory.Cache });
      await Share.share({ title: 'Imprimer', files: [uri], dialogTitle: 'Imprimer le document' });
      return;
    }
  } catch {
    // fall through to browser
  }

  // Browser fallback
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
