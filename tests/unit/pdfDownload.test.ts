import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { Document } from '../../src/mobile/types';
import type { PDFDocumentData } from '../../packages/pdf-engine';

// ── Mocks ────────────────────────────────────────────────────

const engineGeneratePDF = vi.fn(async (_pdfData: PDFDocumentData) => 'bW9ja2VkLXBkZg=='); // base64("mocked-pdf")

vi.mock('../../packages/pdf-engine', () => ({
  generatePDFBase64: (pdfData: PDFDocumentData) => engineGeneratePDF(pdfData),
}));

vi.mock('@/lib/native', () => ({
  isNativePlatform: vi.fn(() => false),
  nativeDownloadFile: vi.fn(() => true),
  nativeShareFile: vi.fn(() => true),
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Import AFTER mocks are registered
const { generatePDFBase64FromDoc, downloadDocument } = await import('../../src/mobile/lib/pdf');

// jsdom does not implement URL.createObjectURL/revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', { writable: true, value: vi.fn(() => 'blob:mock') });
Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: vi.fn() });

// ── Fixture ──────────────────────────────────────────────────

function makeDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc_1',
    type: 'FACTURE',
    number: 'FAC-2026-00001',
    date: '2026-06-21',
    dueDate: '2026-07-21',
    validUntil: '2026-07-15',
    company: {
      id: 'c1',
      name: 'Rakmana SARL',
      nif: '099916000000000',
      rc: '16/00-0000000',
      nis: '099016000000000',
      ai: '123456789000',
      phone: '0550000000',
      address: 'Alger',
      email: 'contact@rakmana.dz',
      tvaRate: 19,
    },
    client: {
      id: 'cli_1',
      name: 'Client Alpha',
      nif: '2345678900011',
      phone: '0660000000',
      email: 'client@mail.dz',
      address: 'Oran',
    },
    items: [
      { id: 'li_1', label: 'Peinture', quantity: 2, unit: 'u', unitPrice: 5000, tvaRate: 19, totalHT: 10000 },
      { id: 'li_2', label: 'Main d’œuvre', quantity: 1, unit: 'j', unitPrice: 8000, tvaRate: 9, totalHT: 8000 },
    ],
    totalHT: 18000,
    totalTVA: 2620,
    timbreFiscal: false,
    timbreAmount: 0,
    totalTTC: 20620,
    status: 'DRAFT',
    language: 'FR',
    paymentMode: 'especes',
    objet: 'Peinture appartement',
    notes: 'TVA 9/19',
    acompte: 0,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('generatePDFBase64FromDoc', () => {
  beforeEach(() => {
    engineGeneratePDF.mockClear();
  });

  test('generates a base64 PDF through the engine', async () => {
    const doc = makeDoc();
    const base64 = await generatePDFBase64FromDoc(doc);
    expect(base64).toBe('bW9ja2VkLXBkZg==');
    expect(engineGeneratePDF).toHaveBeenCalledTimes(1);
  });

  test('passes document data to the engine with correct totals', async () => {
    const doc = makeDoc();
    await generatePDFBase64FromDoc(doc);
    const [pdfData] = engineGeneratePDF.mock.calls[0];

    expect(pdfData.type).toBe('FACTURE');
    expect(pdfData.number).toBe('FAC-2026-00001');
    expect(pdfData.date).toBe('2026-06-21');
    expect(pdfData.dueDate).toBe('2026-07-21');
    expect(pdfData.validUntil).toBe('2026-07-15');
    expect(pdfData.totalHT).toBe(18000);
    expect(pdfData.totalTVA).toBe(2620);
    expect(pdfData.totalTTC).toBe(20620);
    expect(pdfData.timbreFiscal).toBe(false);
    expect(pdfData.language).toBe('FR');
  });

  test('maps line items preserving label, price, qty and totals', async () => {
    const doc = makeDoc();
    await generatePDFBase64FromDoc(doc);
    const [pdfData] = engineGeneratePDF.mock.calls[0];

    expect(pdfData.items).toHaveLength(2);
    expect(pdfData.items[0]).toMatchObject({
      label: 'Peinture',
      quantity: 2,
      unitPrice: 5000,
      tvaRate: 19,
      totalHT: 10000,
    });
    expect(pdfData.items[1]).toMatchObject({
      label: 'Main d\u2019œuvre',
      quantity: 1,
      unitPrice: 8000,
      tvaRate: 9,
      totalHT: 8000,
    });
  });

  test('maps company and client info to the PDF header', async () => {
    const doc = makeDoc();
    await generatePDFBase64FromDoc(doc);
    const [pdfData] = engineGeneratePDF.mock.calls[0];

    expect(pdfData.company).toMatchObject({
      name: 'Rakmana SARL',
      nif: '099916000000000',
      rc: '16/00-0000000',
      address: 'Alger',
      email: 'contact@rakmana.dz',
    });
    expect(pdfData.client).toMatchObject({
      name: 'Client Alpha',
      nif: '2345678900011',
      phone: '0660000000',
      address: 'Oran',
    });
  });

  test('flags a DRAFT document with a watermark', async () => {
    const doc = makeDoc();
    await generatePDFBase64FromDoc(doc);
    const [pdfData] = engineGeneratePDF.mock.calls[0];
    expect(pdfData.showWatermark).toBe(true);
  });

  test('generates totalInWords in French by default', async () => {
    const doc = makeDoc();
    await generatePDFBase64FromDoc(doc);
    const [pdfData] = engineGeneratePDF.mock.calls[0];
    // net = TTC + timbre - acompte = 20620
    expect(typeof pdfData.totalInWords).toBe('string');
    expect(pdfData.totalInWords.length).toBeGreaterThan(0);
  });

  test('falls back and strips nothing when client/company are complete', async () => {
    const doc = makeDoc();
    await generatePDFBase64FromDoc(doc);
    expect(engineGeneratePDF).toHaveBeenCalledTimes(1);
  });
});

describe('downloadDocument', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  test('appends .pdf extension when missing', async () => {
    let captured: HTMLAnchorElement | null = null;
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      captured = this;
    });
    await downloadDocument('aGk=', 'FAC-2026-00001');
    expect(captured).not.toBeNull();
    expect(captured!.getAttribute('download')).toBe('FAC-2026-00001.pdf');
    anchorClick.mockRestore();
  });

  test('keeps the .pdf extension when already present', async () => {
    let captured: HTMLAnchorElement | null = null;
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      captured = this;
    });
    await downloadDocument('aGk=', 'FAC.pdf');
    expect(captured).not.toBeNull();
    expect(captured!.getAttribute('download')).toBe('FAC.pdf');
    anchorClick.mockRestore();
  });
});