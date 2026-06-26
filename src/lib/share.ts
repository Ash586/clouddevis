// ============================================================
// CloudDevis — PDF Sharing System
// Generate, save, and share PDFs via Capacitor APIs
// Works on both iOS and Android
// ============================================================

import { logger } from '@/lib/logger';
import { generatePDFBase64 } from '../../packages/pdf-engine';
import type { PDFDocumentData } from '../../packages/pdf-engine';
import type { Document } from '../mobile/types';

// ── Helper: Convert Document to PDF data ──────────────────────

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
    totalInWords: '', // Will be filled by the caller or use dgi.ts
    language: doc.language,
  };
}

// ── Helper: Check if Capacitor is available ───────────────────

function isCapacitorAvailable(): boolean {
  return typeof window !== 'undefined' && 'Capacitor' in window;
}

// ── Helper: Get Capacitor plugins ─────────────────────────────

async function getSharePlugin() {
  if (!isCapacitorAvailable()) return null;
  const { Share } = await import('@capacitor/share');
  return Share;
}

async function getFilesystemPlugin() {
  if (!isCapacitorAvailable()) return null;
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  return { Filesystem, Directory };
}

// ── Main Share Function ───────────────────────────────────────

export interface ShareOptions {
  /** Document to share */
  doc: Document;
  /** Override total in words (optional) */
  totalInWords?: string;
}

export interface ShareResult {
  success: boolean;
  error?: string;
}

/**
 * Share a document as PDF via the native share sheet.
 *
 * Flow:
 * 1. Generate PDF buffer via pdf-engine
 * 2. Save to temp file via Capacitor Filesystem
 * 3. Open Capacitor Share sheet
 *
 * Works on both iOS and Android via Capacitor Share API.
 *
 * @param options - Document and optional overrides
 * @returns ShareResult indicating success or failure
 */
export async function sharePDF(options: ShareOptions): Promise<ShareResult> {
  const { doc, totalInWords } = options;

  try {
    // 1. Convert document to PDF data
    const pdfData = documentToPDFData(doc);
    if (totalInWords) {
      pdfData.totalInWords = totalInWords;
    }

    // 2. Generate PDF base64
    const base64 = await generatePDFBase64(pdfData);

    // 3. Check if we're in Capacitor (native) or browser
    if (isCapacitorAvailable()) {
      // Native: Save to filesystem and share
      const Share = await getSharePlugin();
      const fsResult = await getFilesystemPlugin();

      if (!Share || !fsResult) {
        return { success: false, error: 'Capacitor plugins not available' };
      }

      const { Filesystem, Directory } = fsResult;

      // Save PDF to cache directory
      const fileName = `${doc.number}.pdf`;
      const { uri } = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });

      // Open native share sheet
      await Share.share({
        title: `${getTypeLabel(doc.type)} ${doc.number}`,
        text: `Veuillez trouver ci-joint votre ${getTypeLabel(doc.type).toLowerCase()} de ${doc.totalTTC.toLocaleString('fr-DZ')} DA`,
        url: uri,
        dialogTitle: `Partager ${doc.number}`,
      });

      return { success: true };
    } else {
      // Browser fallback: Download the PDF
      return downloadPDF(base64, `${doc.number}.pdf`);
    }
  } catch (err) {
    logger.error('PDF share failed:', { error: String(err) });
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur lors du partage',
    };
  }
}

// ── WhatsApp Share ────────────────────────────────────────────

export interface WhatsAppOptions {
  /** Document to share */
  doc: Document;
  /** Phone number (optional, formats to international) */
  phone?: string;
  /** Override total in words */
  totalInWords?: string;
}

/**
 * Share a document via WhatsApp.
 *
 * Flow:
 * 1. Generate PDF buffer via pdf-engine
 * 2. Save to temp file via Capacitor Filesystem
 * 3. Open WhatsApp with message + trigger share sheet
 *
 * @param options - Document, phone, and optional overrides
 * @returns ShareResult indicating success or failure
 */
export async function shareWhatsApp(options: WhatsAppOptions): Promise<ShareResult> {
  const { doc, phone, totalInWords } = options;

  try {
    // 1. Convert document to PDF data
    const pdfData = documentToPDFData(doc);
    if (totalInWords) {
      pdfData.totalInWords = totalInWords;
    }

    // 2. Generate PDF base64
    const base64 = await generatePDFBase64(pdfData);

    // 3. Build WhatsApp message
    const typeLabel = getTypeLabel(doc.type);
    const message = encodeURIComponent(
      `${typeLabel} ${doc.number}\n` +
      `Client: ${doc.client.name}\n` +
      `Total TTC: ${doc.totalTTC.toLocaleString('fr-DZ')} DA\n\n` +
      `Veuillez trouver ci-joint votre ${typeLabel.toLowerCase()}.`
    );

    // 4. Check if we're in Capacitor or browser
    if (isCapacitorAvailable()) {
      const Share = await getSharePlugin();
      const fsResult = await getFilesystemPlugin();

      if (!Share || !fsResult) {
        return { success: false, error: 'Capacitor plugins not available' };
      }

      const { Filesystem, Directory } = fsResult;

      // Save PDF to cache directory
      const fileName = `${doc.number}.pdf`;
      const { uri } = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });

      // Try to open WhatsApp directly
      const phoneFormatted = phone ? formatPhoneForWhatsApp(phone) : '';
      const whatsappUrl = phoneFormatted
        ? `whatsapp://send?phone=${phoneFormatted}&text=${message}`
        : `whatsapp://send?text=${message}`;

      // Open WhatsApp via deep link (works in Capacitor WebView)
      window.open(whatsappUrl, '_system');

      // After a brief delay, also trigger the share sheet with the PDF
      setTimeout(async () => {
        try {
          await Share.share({
            title: `${typeLabel} ${doc.number}`,
            text: `Pièce jointe: ${typeLabel} ${doc.number}`,
            url: uri,
            dialogTitle: 'Partager via WhatsApp',
          });
        } catch {
          // Share sheet may fail if user already left the app
        }
      }, 1000);

      return { success: true };
    } else {
      // Browser fallback: Open WhatsApp Web
      const phoneFormatted = phone ? formatPhoneForWhatsApp(phone) : '';
      const whatsappWebUrl = phoneFormatted
        ? `https://wa.me/${phoneFormatted}?text=${message}`
        : `https://wa.me/?text=${message}`;

      window.open(whatsappWebUrl, '_blank');

      // Also offer PDF download
      return downloadPDF(base64, `${doc.number}.pdf`);
    }
  } catch (err) {
    logger.error('WhatsApp share failed:', { error: String(err) });
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur lors du partage WhatsApp',
    };
  }
}

// ── Download PDF (Browser fallback) ───────────────────────────

/**
 * Download a PDF file in the browser.
 * Used as fallback when Capacitor is not available.
 *
 * @param base64 - Base64-encoded PDF
 * @param fileName - File name
 * @returns ShareResult
 */
function downloadPDF(base64: string, fileName: string): ShareResult {
  try {
    // Convert base64 to blob
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });

    // Create download link
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
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur lors du téléchargement',
    };
  }
}

// ── Helper Functions ──────────────────────────────────────────

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    DEVIS: 'Devis',
    FACTURE: 'Facture',
    PROFORMA: 'Proforma',
    BC: 'Bon de Commande',
    BR: 'Bon de Réception',
  };
  return labels[type] || type;
}

function formatPhoneForWhatsApp(phone: string): string {
  // Remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // If starts with 0 (Algerian local), replace with 213
  if (cleaned.startsWith('0')) {
    cleaned = '213' + cleaned.slice(1);
  }

  // If doesn't start with country code, add 213
  if (!cleaned.startsWith('+') && !cleaned.startsWith('213')) {
    cleaned = '213' + cleaned;
  }

  // Remove leading +
  cleaned = cleaned.replace(/^\+/, '');

  return cleaned;
}
