// ============================================================
// Rakmana — PDF Sharing System
// Generate, save, and share PDFs via Android JS Bridge
// Falls back to browser download
// ============================================================

import { logger } from '@/lib/logger';
import { generatePDFBase64 } from '../../packages/pdf-engine';
import type { PDFDocumentData } from '../../packages/pdf-engine';
import type { Document } from '../mobile/types';
import { isNativePlatform, nativeShareFile, nativeDownloadFile } from '@/lib/native';

function documentToPDFData(doc: Document): PDFDocumentData {
  return {
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
    totalInWords: '',
    language: doc.language,
    mode: doc.mode,
  };
}

export interface ShareOptions {
  doc: Document;
  totalInWords?: string;
}

export interface ShareResult {
  success: boolean;
  error?: string;
}

export async function sharePDF(options: ShareOptions): Promise<ShareResult> {
  const { doc, totalInWords } = options;
  try {
    const pdfData = documentToPDFData(doc);
    if (totalInWords) pdfData.totalInWords = totalInWords;
    const base64 = await generatePDFBase64(pdfData);
    const fileName = `${doc.number}.pdf`;

    if (isNativePlatform()) {
      nativeShareFile(base64, fileName, `${getTypeLabel(doc.type)} ${doc.number}`);
      return { success: true };
    }

    return downloadBrowserPDF(base64, fileName);
  } catch (err) {
    logger.error('PDF share failed:', { error: String(err) });
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors du partage' };
  }
}

export interface WhatsAppOptions {
  doc: Document;
  phone?: string;
  totalInWords?: string;
}

export async function shareWhatsApp(options: WhatsAppOptions): Promise<ShareResult> {
  const { doc, phone, totalInWords } = options;
  try {
    const pdfData = documentToPDFData(doc);
    if (totalInWords) pdfData.totalInWords = totalInWords;
    const base64 = await generatePDFBase64(pdfData);
    const typeLabel = getTypeLabel(doc.type);
    const message = encodeURIComponent(
      `${typeLabel} ${doc.number}\nClient: ${doc.client.name}\nTotal TTC: ${doc.totalTTC.toLocaleString('fr-DZ')} DA\n\nVeuillez trouver ci-joint votre ${typeLabel.toLowerCase()}.`
    );

    const phoneFormatted = phone ? formatPhoneForWhatsApp(phone) : '';
    const whatsappWebUrl = phoneFormatted
      ? `https://wa.me/${phoneFormatted}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(whatsappWebUrl, '_blank');

    const fileName = `${doc.number}.pdf`;
    if (isNativePlatform()) {
      nativeDownloadFile(base64, fileName);
    }
    return { success: true };
  } catch (err) {
    logger.error('WhatsApp share failed:', { error: String(err) });
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors du partage WhatsApp' };
  }
}

function downloadBrowserPDF(base64: string, fileName: string): ShareResult {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors du téléchargement' };
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    DEVIS: 'Devis', FACTURE: 'Facture', PROFORMA: 'Proforma',
    BC: 'Bon de Commande', BR: 'Bon de Réception',
  };
  return labels[type] || type;
}

function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) cleaned = '213' + cleaned.slice(1);
  if (!cleaned.startsWith('+') && !cleaned.startsWith('213')) cleaned = '213' + cleaned;
  return cleaned.replace(/^\+/, '');
}
