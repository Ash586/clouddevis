import { describe, test, expect } from 'vitest';
import type { DocumentState } from '../../src/types';
import {
  calculateDocument,
  numberToFrenchWords,
  tafqitAr,
  formatCurrency,
  generateDocumentNumber,
  formatDateISO,
  generateId,
} from '../../src/lib/calculations';

function makeDoc(overrides: Partial<DocumentState> = {}): DocumentState {
  return {
    mode: 'artisan',
    clientInfo: { name: 'Client', address: 'Alger' },
    items: [],
    tvaRate: 19,
    paymentMode: 'especes',
    documentType: 'facture',
    documentNumber: 'FAC-2026-00001',
    date: '2026-06-21',
    discount: { type: 'percentage', value: 0, reason: '' },
    stampDuty: { rate: 0, minAmount: 0, maxAmount: 0 },
    paymentDetails: { terms: '', iban: '' },
    hiddenBlocks: [],
    chantierAddress: '',
    chantierType: '',
    chantierSurface: 0,
    chantierEtat: '',
    chantierProtection: '',
    materiauxMarque: '',
    materiauxType: '',
    materiauxCouleur: '',
    materiauxQte: 0,
    garantieMO: '',
    garantieMateriaux: '',
    garantieNotes: '',
    sectionOrder: [],
    customFields: {},
    ...overrides,
  };
}

describe('calculateDocument', () => {
  test('empty items returns all zeros', () => {
    const result = calculateDocument(makeDoc({ items: [] }));
    expect(result.subTotalHT).toBe(0);
    expect(result.tvaAmount).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.totalHTAfterDiscount).toBe(0);
    expect(result.totalTTC).toBe(0);
    expect(result.timbreFiscal).toBe(0);
    expect(result.netAPayer).toBe(0);
  });

  test('single item, 0% TVA, no discount', () => {
    const result = calculateDocument(makeDoc({
      tvaRate: 0,
      items: [{ id: '1', designation: 'A', quantity: 3, unit: 'u', unitPrice: 2000 }],
    }));
    expect(result.subTotalHT).toBe(6000);
    expect(result.tvaRate).toBe(0);
    expect(result.tvaAmount).toBe(0);
    expect(result.totalHTAfterDiscount).toBe(6000);
    expect(result.totalTTC).toBe(6000);
  });

  test('single item, 19% TVA, no discount', () => {
    const result = calculateDocument(makeDoc({
      tvaRate: 19,
      items: [{ id: '1', designation: 'B', quantity: 1, unit: 'u', unitPrice: 10000 }],
    }));
    expect(result.subTotalHT).toBe(10000);
    expect(result.tvaRate).toBe(19);
    expect(result.tvaAmount).toBe(1900);
    expect(result.totalHTAfterDiscount).toBe(10000);
    expect(result.totalTTC).toBe(11900);
  });

  test('single item, 9% TVA, no discount', () => {
    const result = calculateDocument(makeDoc({
      tvaRate: 9,
      items: [{ id: '1', designation: 'C', quantity: 2, unit: 'u', unitPrice: 5000 }],
    }));
    expect(result.subTotalHT).toBe(10000);
    expect(result.tvaRate).toBe(9);
    expect(result.tvaAmount).toBe(900);
    expect(result.totalTTC).toBe(10900);
  });

  test('multiple items sum correctly', () => {
    const result = calculateDocument(makeDoc({
      tvaRate: 19,
      items: [
        { id: '1', designation: 'X', quantity: 2, unit: 'u', unitPrice: 1000 },
        { id: '2', designation: 'Y', quantity: 3, unit: 'u', unitPrice: 2000 },
        { id: '3', designation: 'Z', quantity: 1, unit: 'j', unitPrice: 5000 },
      ],
    }));
    expect(result.subTotalHT).toBe(2000 + 6000 + 5000);
    expect(result.subTotalHT).toBe(13000);
    expect(result.tvaAmount).toBe(13000 * 0.19);
    expect(result.totalTTC).toBe(13000 + 13000 * 0.19);
  });

  test('percentage discount of 10%', () => {
    const result = calculateDocument(makeDoc({
      tvaRate: 19,
      discount: { type: 'percentage', value: 10, reason: 'promo' },
      items: [{ id: '1', designation: 'D', quantity: 1, unit: 'u', unitPrice: 10000 }],
    }));
    expect(result.subTotalHT).toBe(10000);
    expect(result.discountAmount).toBe(1000);
    expect(result.totalHTAfterDiscount).toBe(9000);
    expect(result.tvaAmount).toBe(9000 * 0.19);
    expect(result.totalTTC).toBe(9000 + 9000 * 0.19);
  });

  test('fixed discount of 500', () => {
    const result = calculateDocument(makeDoc({
      tvaRate: 19,
      discount: { type: 'fixed', value: 500, reason: 'remise' },
      items: [{ id: '1', designation: 'E', quantity: 1, unit: 'u', unitPrice: 10000 }],
    }));
    expect(result.subTotalHT).toBe(10000);
    expect(result.discountAmount).toBe(500);
    expect(result.totalHTAfterDiscount).toBe(9500);
    expect(result.tvaAmount).toBe(9500 * 0.19);
  });

  test('acompte reduces netAPayer', () => {
    const result = calculateDocument(makeDoc({
      tvaRate: 19,
      acompte: 3000,
      items: [{ id: '1', designation: 'F', quantity: 1, unit: 'u', unitPrice: 10000 }],
    }));
    const expectedTotalTTC = 11900;
    expect(result.acompte).toBe(3000);
    expect(result.netAPayer).toBe(expectedTotalTTC + result.timbreFiscal - 3000);
  });

  test('timbre fiscal = 1000 for facture with totalTTC >= 10000', () => {
    const result = calculateDocument(makeDoc({
      documentType: 'facture',
      tvaRate: 19,
      items: [{ id: '1', designation: 'G', quantity: 1, unit: 'u', unitPrice: 10000 }],
    }));
    expect(result.timbreFiscal).toBe(1000);
    expect(result.netAPayer).toBe(result.totalTTC + 1000 - result.acompte);
  });

  test('timbre fiscal = 0 for facture with totalTTC < 10000', () => {
    const result = calculateDocument(makeDoc({
      documentType: 'facture',
      tvaRate: 0,
      items: [{ id: '1', designation: 'H', quantity: 1, unit: 'u', unitPrice: 5000 }],
    }));
    expect(result.timbreFiscal).toBe(0);
  });

  test('timbre fiscal = 0 for devis regardless of total', () => {
    const result = calculateDocument(makeDoc({
      documentType: 'devis',
      tvaRate: 19,
      items: [{ id: '1', designation: 'I', quantity: 10, unit: 'u', unitPrice: 10000 }],
    }));
    expect(result.timbreFiscal).toBe(0);
  });

  test('timbre fiscal = 0 for attachement regardless of total', () => {
    const result = calculateDocument(makeDoc({
      documentType: 'attachement',
      tvaRate: 19,
      items: [{ id: '1', designation: 'J', quantity: 10, unit: 'u', unitPrice: 10000 }],
    }));
    expect(result.timbreFiscal).toBe(0);
  });

  test('timbre fiscal applies for proforma with totalTTC >= 10000', () => {
    const result = calculateDocument(makeDoc({
      documentType: 'proforma',
      tvaRate: 19,
      items: [{ id: '1', designation: 'K', quantity: 1, unit: 'u', unitPrice: 10000 }],
    }));
    expect(result.timbreFiscal).toBe(1000);
  });

  test('acompte defaults to 0 when not provided', () => {
    const result = calculateDocument(makeDoc({
      items: [{ id: '1', designation: 'L', quantity: 1, unit: 'u', unitPrice: 1000 }],
    }));
    expect(result.acompte).toBe(0);
  });

  test('totalInWords is a non-empty string', () => {
    const result = calculateDocument(makeDoc({
      items: [{ id: '1', designation: 'M', quantity: 1, unit: 'u', unitPrice: 10000 }],
    }));
    expect(typeof result.totalInWords).toBe('string');
    expect(result.totalInWords.length).toBeGreaterThan(0);
  });

  test('multiple items with mixed discounts', () => {
    const result = calculateDocument(makeDoc({
      tvaRate: 9,
      discount: { type: 'percentage', value: 20, reason: 'grossiste' },
      items: [
        { id: '1', designation: 'A1', quantity: 5, unit: 'u', unitPrice: 2000 },
        { id: '2', designation: 'A2', quantity: 2, unit: 'kg', unitPrice: 3000 },
      ],
    }));
    expect(result.subTotalHT).toBe(10000 + 6000);
    expect(result.discountAmount).toBe(16000 * 0.2);
    expect(result.totalHTAfterDiscount).toBe(16000 - 3200);
    expect(result.tvaAmount).toBe(12800 * 0.09);
  });
});

describe('numberToFrenchWords', () => {
  test('returns a non-empty string for positive number', () => {
    const result = numberToFrenchWords(1000);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('returns zero representation for 0', () => {
    const result = numberToFrenchWords(0);
    expect(result).toContain('ro');
  });

  test('returns a different string for a different number', () => {
    const a = numberToFrenchWords(1);
    const b = numberToFrenchWords(100);
    expect(a).not.toBe(b);
  });
});

describe('tafqitAr', () => {
  test('returns a non-empty string for positive number', () => {
    const result = tafqitAr(5000);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('returns zero representation for 0', () => {
    const result = tafqitAr(0);
    expect(result).toContain('\u0635\u0641\u0631');
  });
});

describe('formatCurrency', () => {
  test('formats with default DA currency', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('DA');
  });

  test('formats with explicit currency', () => {
    const result = formatCurrency(1000, 'EUR');
    expect(result).toContain('EUR');
  });

  test('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('DA');
  });

  test('formats large number with separators', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('DA');
    expect(result).toMatch(/\d/);
  });
});

describe('generateDocumentNumber', () => {
  test('generates a number string for facture type', () => {
    const result = generateDocumentNumber('FACTURE', 'auto', 1);
    expect(typeof result).toBe('string');
    expect(result).toContain('FAC');
  });

  test('generates a number string for devis type', () => {
    const result = generateDocumentNumber('DEVIS', 'manual', 5);
    expect(result).toContain('DEV');
  });

  test('generates a number string with unknown type', () => {
    const result = generateDocumentNumber('UNKNOWN', 'auto', 1);
    expect(typeof result).toBe('string');
  });
});

describe('formatDateISO', () => {
  test('returns YYYY-MM-DD format', () => {
    const date = new Date(Date.UTC(2026, 0, 15));
    const result = formatDateISO(date);
    expect(result).toBe('2026-01-15');
  });

  test('returns correct format for end of year', () => {
    const date = new Date(Date.UTC(2026, 11, 31));
    const result = formatDateISO(date);
    expect(result).toBe('2026-12-31');
  });

  test('returns correct format for single digit month/day', () => {
    const date = new Date(Date.UTC(2025, 2, 7));
    const result = formatDateISO(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe('2025-03-07');
  });
});

describe('generateId', () => {
  test('returns a string of length 9', () => {
    const result = generateId();
    expect(typeof result).toBe('string');
    expect(result.length).toBe(9);
  });

  test('returns different values on subsequent calls', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });

  test('returns only alphanumeric characters', () => {
    const result = generateId();
    expect(result).toMatch(/^[a-zA-Z0-9-]+$/);
  });
});
