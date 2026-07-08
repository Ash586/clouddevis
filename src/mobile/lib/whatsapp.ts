// Rakmana Mobile — Share Helper
// Cross-platform: native (Capacitor) → Web Share API (mobile browsers) →
// download fallback (desktop browsers). Returns how it was delivered so the
// caller can give the right follow-up (e.g. open WhatsApp / mailto on web).

import { downloadDocument } from './pdf';

export type ShareResult = 'shared' | 'downloaded';

function base64ToBlob(base64: string, type = 'application/pdf'): Blob {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

/**
 * Share a document PDF through the best channel available on this platform.
 */
export async function shareDocument(options: {
  pdfBase64: string;
  docNumber: string;
  clientName: string;
  total: number;
  currency?: string;
}): Promise<ShareResult> {
  const { pdfBase64, docNumber, clientName, total, currency = 'DA' } = options;
  const fileName = `${docNumber}.pdf`;
  const title = `${docNumber} — ${clientName}`;
  const text = `${docNumber}\nClient: ${clientName}\nTotal: ${total.toLocaleString('fr-DZ')} ${currency}`;

  // 1. Native (Capacitor) — write to cache then open the OS share sheet.
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const { uri } = await Filesystem.writeFile({ path: fileName, data: pdfBase64, directory: Directory.Cache });
      await Share.share({ title, text, files: [uri], dialogTitle: 'Partager le document' });
      return 'shared';
    }
  } catch {
    // fall through to web
  }

  // 2. Web Share API with a real file (works on most mobile browsers).
  try {
    const file = new File([base64ToBlob(pdfBase64)], fileName, { type: 'application/pdf' });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
      share?: (data?: ShareData) => Promise<void>;
    };
    if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title, text });
      return 'shared';
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return 'shared';
  }

  // 3. Desktop fallback — download the PDF so the user can attach it.
  downloadDocument(pdfBase64, fileName);
  return 'downloaded';
}

/**
 * Open WhatsApp directly with a pre-filled message
 */
export async function openWhatsApp(options: {
  phone?: string;
  message: string;
}): Promise<void> {
  const { phone, message } = options;
  const encodedMessage = encodeURIComponent(message);

  let url: string;
  if (phone) {
    // Clean phone number: remove spaces, dashes, plus
    const cleanPhone = phone.replace(/[\s\-+()]/g, '');
    url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  } else {
    url = `https://wa.me/?text=${encodedMessage}`;
  }

  // Use Capacitor Browser or window.open
  window.open(url, '_system');
}

/**
 * Generate a payment reminder message
 */
export function generatePaymentReminder(options: {
  docNumber: string;
  clientName: string;
  total: number;
  daysOverdue: number;
  currency?: string;
}): string {
  const { docNumber, clientName, total, daysOverdue, currency = 'DA' } = options;

  return `Bonjour ${clientName},

Je me permets de vous rappeler que la facture ${docNumber} d'un montant de ${total.toLocaleString('fr-DZ')} ${currency} est en retard de paiement depuis ${daysOverdue} jours.

Merci de procéder au règlement dans les meilleurs délais.

Cordialement,
Rakmana`;
}
