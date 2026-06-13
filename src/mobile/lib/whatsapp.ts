// CloudDevis Mobile — WhatsApp Share Helper
// Share PDF documents via WhatsApp

import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Share a document via WhatsApp or native share sheet
 */
export async function shareDocument(options: {
  pdfBase64: string;
  docNumber: string;
  clientName: string;
  total: number;
  currency?: string;
}): Promise<void> {
  const { pdfBase64, docNumber, clientName, total, currency = 'DA' } = options;

  // 1. Save PDF to cache
  const fileName = `${docNumber}.pdf`;
  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: pdfBase64,
    directory: Directory.Cache,
  });

  // 2. Share via native share sheet (user picks WhatsApp)
  await Share.share({
    title: `${docNumber} — ${clientName}`,
    text: `${docNumber}\nClient: ${clientName}\nTotal: ${total.toLocaleString('fr-DZ')} ${currency}`,
    files: [uri],
    dialogTitle: 'Partager le document',
  });
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
CloudDevis`;
}
