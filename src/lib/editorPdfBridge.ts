import type { DocumentState, CalculationResult } from '@/types';
import type { PDFDocumentData, PDFDocumentType } from '../../packages/pdf-engine';
import { numberToFrenchWords, numberToArabicWords } from '@/lib/dgi';

const TYPE_MAP: Record<string, PDFDocumentType> = {
  devis: 'DEVIS',
  facture: 'FACTURE',
  proforma: 'PROFORMA',
  bc: 'BC',
  br: 'BR',
  bl: 'BL',
};

export function editorStateToPDFData(
  doc: DocumentState,
  results: CalculationResult,
  language: 'FR' | 'AR' | 'EN' = 'FR',
): PDFDocumentData {
  const netAPayer = results.totalTTC + results.timbreFiscal - (results.acompte || 0);
  const totalInWords = language === 'AR'
    ? numberToArabicWords(netAPayer)
    : numberToFrenchWords(netAPayer);

  const companyName = doc.mode === 'entreprise'
    ? (doc.companyInfo?.name ?? '')
    : (doc.artisanInfo?.name ?? '');
  const companyAddress = doc.mode === 'entreprise'
    ? (doc.companyInfo?.address ?? '')
    : (doc.artisanInfo?.address ?? '');
  const taxIds = doc.mode === 'entreprise'
    ? doc.companyInfo?.taxIds
    : { nif: doc.artisanInfo?.nif ?? '', rc: '', nis: doc.artisanInfo?.nis ?? '', ai: doc.artisanInfo?.ai ?? '' };

  return {
    type: TYPE_MAP[doc.documentType] ?? 'DEVIS',
    number: doc.documentNumber,
    date: doc.date,
    validUntil: doc.validUntil,
    notes: doc.notes,
    objet: doc.objet,
    acompte: results.acompte || undefined,

    delivererName: doc.delivererName,
    delivererIdCard: doc.delivererIdCard,
    transporterName: doc.transporterName,
    transporterIdCard: doc.transporterIdCard,
    deliveryAddress: doc.deliveryAddress,

    company: {
      name: companyName,
      nif: taxIds?.nif ?? '',
      rc: taxIds?.rc ?? doc.rcNumber ?? '',
      nis: taxIds?.nis ?? doc.nisNumber ?? '',
      ai: taxIds?.ai ?? doc.aiNumber ?? '',
      phone: doc.companyPhone,
      address: companyAddress,
      logo: doc.companyInfo?.logo,
      capital: doc.companyCapital,
      activity: doc.companyTagline,
      rib: doc.rib,
      ccp: doc.ccpNumber,
      bankName: doc.bankName,
      signature: doc.companyInfo?.signature,
      carteArtisan: doc.mode === 'artisan' ? doc.artisanInfo?.carteArtisan : undefined,
    },

    client: {
      name: doc.clientInfo.name,
      nif: doc.clientInfo.nif,
      rc: doc.clientInfo.rc,
      nis: doc.clientInfo.nis,
      ai: doc.clientInfo.ai,
      phone: doc.clientInfo.phone,
      email: doc.clientInfo.email,
      address: doc.clientInfo.address,
    },

    items: doc.items.map((item) => ({
      label: item.designation,
      code: undefined,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      tvaRate: doc.tvaRate as number,
      totalHT: item.quantity * item.unitPrice,
    })),

    totalHT: results.subTotalHT,
    totalTVA: results.tvaAmount,
    timbreFiscal: results.timbreFiscal > 0,
    timbreAmount: results.timbreFiscal,
    totalTTC: results.totalTTC,
    netAPayer: results.netAPayer,
    totalInWords,

    language,
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
    showWatermark: doc.showWatermark,
  };
}

export async function downloadEditorPdfNative(
  doc: DocumentState,
  results: CalculationResult,
  language: 'FR' | 'AR' | 'EN' = 'FR',
): Promise<void> {
  const { generatePDFBase64 } = await import('../../packages/pdf-engine');
  const { downloadDocument } = await import('@/mobile/lib/pdf');

  const pdfData = editorStateToPDFData(doc, results, language);
  const base64 = await generatePDFBase64(pdfData);
  const fileName = `${pdfData.type}_${pdfData.number || 'document'}.pdf`;
  await downloadDocument(base64, fileName);
}
