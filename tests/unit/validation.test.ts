import { describe, test, expect } from 'vitest';
import {
  validateNIF,
  validateRC,
  validateNIS,
  validateAI,
  validateCompanyTaxIds,
  validateDocumentBody,
  validateAuthInput,
  validateLineItem,
} from '../../src/lib/validation';

describe('validateCompanyTaxIds', () => {
  test('all valid tax ids returns valid true', () => {
    const result = validateCompanyTaxIds({
      nif: '123456789012345',
      rc: '12ABC34567890',
      nis: '1234567890',
      ai: '0987654321',
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  test('empty object returns valid true', () => {
    const result = validateCompanyTaxIds({});
    expect(result.valid).toBe(true);
  });

  test('invalid NIF produces errors.nif', () => {
    const result = validateCompanyTaxIds({ nif: '123' });
    expect(result.valid).toBe(false);
    expect(result.errors.nif).toBeDefined();
  });

  test('invalid RC produces errors.rc', () => {
    const result = validateCompanyTaxIds({ rc: '123' });
    expect(result.valid).toBe(false);
    expect(result.errors.rc).toBeDefined();
  });

  test('invalid NIS produces errors.nis', () => {
    const result = validateCompanyTaxIds({ nis: '123' });
    expect(result.valid).toBe(false);
    expect(result.errors.nis).toBeDefined();
  });

  test('invalid AI produces errors.ai', () => {
    const result = validateCompanyTaxIds({ ai: '123' });
    expect(result.valid).toBe(false);
    expect(result.errors.ai).toBeDefined();
  });

  test('valid 11-digit NIF accepted', () => {
    const result = validateCompanyTaxIds({ nif: '12345678901' });
    expect(result.valid).toBe(true);
  });

  test('multiple invalid fields produce multiple errors', () => {
    const result = validateCompanyTaxIds({ nif: 'bad', nis: 'bad' });
    expect(result.valid).toBe(false);
    expect(result.errors.nif).toBeDefined();
    expect(result.errors.nis).toBeDefined();
  });
});

describe('validateDocumentBody', () => {
  test('valid minimal body returns valid true', () => {
    const result = validateDocumentBody({});
    expect(result.valid).toBe(true);
  });

  test('valid body with all fields returns valid true', () => {
    const result = validateDocumentBody({
      documentType: 'facture',
      tvaRate: 19,
      paymentMode: 'virement',
      items: [
        { designation: 'Service', quantity: 1, unitPrice: 50000 },
      ],
      acompte: 10000,
      discount: { type: 'fixed', value: 5000 },
      companyInfo: {
        taxIds: { nif: '123456789012345' },
      },
      clientInfo: {
        nif: '12345678901',
      },
    });
    expect(result.valid).toBe(true);
  });

  test('invalid documentType produces errors.documentType', () => {
    const result = validateDocumentBody({ documentType: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.errors.documentType).toBeDefined();
  });

  test('invalid tvaRate produces errors.tvaRate', () => {
    const result = validateDocumentBody({ tvaRate: 15 });
    expect(result.valid).toBe(false);
    expect(result.errors.tvaRate).toBeDefined();
  });

  test('valid tvaRate of 0 is accepted', () => {
    const result = validateDocumentBody({ tvaRate: 0 });
    expect(result.valid).toBe(true);
  });

  test('invalid paymentMode produces errors.paymentMode', () => {
    const result = validateDocumentBody({ paymentMode: 'bitcoin' });
    expect(result.valid).toBe(false);
    expect(result.errors.paymentMode).toBeDefined();
  });

  test('items not an array produces errors.items', () => {
    const result = validateDocumentBody({ items: 'not-an-array' });
    expect(result.valid).toBe(false);
    expect(result.errors.items).toBeDefined();
  });

  test('item with quantity <= 0 produces error', () => {
    const result = validateDocumentBody({
      items: [{ designation: 'Item', quantity: 0, unitPrice: 100 }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors['items.0.qty']).toBeDefined();
  });

  test('item with unitPrice > 1000000 produces error', () => {
    const result = validateDocumentBody({
      items: [{ designation: 'Item', quantity: 1, unitPrice: 1000001 }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors['items.0.price']).toBeDefined();
  });

  test('negative acompte produces errors.acompte', () => {
    const result = validateDocumentBody({ acompte: -500 });
    expect(result.valid).toBe(false);
    expect(result.errors.acompte).toBeDefined();
  });

  test('negative discount.value produces errors.discount', () => {
    const result = validateDocumentBody({
      discount: { type: 'fixed', value: -10 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.discount).toBeDefined();
  });

  test('percentage discount > 100 produces errors.discount', () => {
    const result = validateDocumentBody({
      discount: { type: 'percentage', value: 150 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.discount).toBeDefined();
  });

  test('invalid companyInfo.taxIds.nif produces error.nif', () => {
    const result = validateDocumentBody({
      companyInfo: { taxIds: { nif: 'bad' } },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.nif).toBeDefined();
  });

  test('invalid clientInfo.nif produces errors.clientNif', () => {
    const result = validateDocumentBody({
      clientInfo: { nif: 'bad' },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.clientNif).toBeDefined();
  });

  test('valid documentType values are accepted', () => {
    for (const dt of ['devis', 'proforma', 'bc', 'br', 'facture', 'intervention', 'attachement']) {
      const result = validateDocumentBody({ documentType: dt });
      expect(result.valid).toBe(true);
    }
  });
});

describe('validateAuthInput - login', () => {
  test('valid login returns valid true', () => {
    const result = validateAuthInput(
      { email: 'user@example.com', password: 'pass123' },
      'login',
    );
    expect(result.valid).toBe(true);
  });

  test('no email produces errors.email', () => {
    const result = validateAuthInput({ password: 'pass123' }, 'login');
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  test('invalid email without @ produces errors.email', () => {
    const result = validateAuthInput(
      { email: 'not-an-email', password: 'pass123' },
      'login',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  test('no password produces errors.password', () => {
    const result = validateAuthInput({ email: 'user@example.com' }, 'login');
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });

  test('empty password string produces errors.password', () => {
    const result = validateAuthInput(
      { email: 'user@example.com', password: '' },
      'login',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });
});

describe('validateAuthInput - register', () => {
  test('valid register with strong password returns valid true', () => {
    const result = validateAuthInput(
      { email: 'user@example.com', password: 'Strong1!', name: 'John' },
      'register',
    );
    expect(result.valid).toBe(true);
  });

  test('short password produces errors.password', () => {
    const result = validateAuthInput(
      { email: 'user@example.com', password: 'ab', name: 'John' },
      'register',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.password).toMatch(/^Minimum 6 caractères/);
  });

  test('weak password produces errors.password', () => {
    const result = validateAuthInput(
      { email: 'user@example.com', password: 'abcdefgh', name: 'John' },
      'register',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });

  test('no name produces errors.name', () => {
    const result = validateAuthInput(
      { email: 'user@example.com', password: 'Strong1!' },
      'register',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  test('single-char name produces errors.name', () => {
    const result = validateAuthInput(
      { email: 'user@example.com', password: 'Strong1!', name: 'A' },
      'register',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  test('password with only lowercase letters is weak', () => {
    const result = validateAuthInput(
      { email: 'user@example.com', password: 'abcdefgh', name: 'John' },
      'register',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });
});

describe('validateLineItem', () => {
  test('valid item returns valid true', () => {
    const result = validateLineItem({
      designation: 'Service',
      quantity: 2,
      unitPrice: 5000,
    });
    expect(result.valid).toBe(true);
  });

  test('empty designation produces errors.designation', () => {
    const result = validateLineItem({
      designation: '',
      quantity: 1,
      unitPrice: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.designation).toBeDefined();
  });

  test('whitespace-only designation produces errors.designation', () => {
    const result = validateLineItem({
      designation: '   ',
      quantity: 1,
      unitPrice: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.designation).toBeDefined();
  });

  test('designation longer than 200 chars produces errors.designation', () => {
    const result = validateLineItem({
      designation: 'A'.repeat(201),
      quantity: 1,
      unitPrice: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.designation).toBeDefined();
  });

  test('quantity <= 0 produces errors.quantity', () => {
    const result = validateLineItem({
      designation: 'Item',
      quantity: 0,
      unitPrice: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.quantity).toBeDefined();
  });

  test('negative quantity produces errors.quantity', () => {
    const result = validateLineItem({
      designation: 'Item',
      quantity: -5,
      unitPrice: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.quantity).toBeDefined();
  });

  test('unitPrice <= 0 produces errors.unitPrice', () => {
    const result = validateLineItem({
      designation: 'Item',
      quantity: 1,
      unitPrice: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.unitPrice).toBeDefined();
  });

  test('unitPrice > 1000000 produces errors.unitPrice', () => {
    const result = validateLineItem({
      designation: 'Item',
      quantity: 1,
      unitPrice: 1000001,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.unitPrice).toBeDefined();
  });

  test('missing designation produces errors.designation', () => {
    const result = validateLineItem({
      quantity: 1,
      unitPrice: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.designation).toBeDefined();
  });

  test('missing quantity produces errors.quantity', () => {
    const result = validateLineItem({
      designation: 'Item',
      unitPrice: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.quantity).toBeDefined();
  });

  test('missing unitPrice produces errors.unitPrice', () => {
    const result = validateLineItem({
      designation: 'Item',
      quantity: 1,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.unitPrice).toBeDefined();
  });
});

describe('validateNIF', () => {
  test('valid 15-digit NIF returns true', () => {
    expect(validateNIF('123456789012345')).toBe(true);
  });

  test('valid 11-digit NIF returns true', () => {
    expect(validateNIF('12345678901')).toBe(true);
  });

  test('invalid NIF with wrong length returns false', () => {
    expect(validateNIF('12345')).toBe(false);
  });

  test('empty string returns false', () => {
    expect(validateNIF('')).toBe(false);
  });
});

describe('validateRC', () => {
  test('valid RC returns true', () => {
    expect(validateRC('12ABC34567890')).toBe(true);
  });

  test('too short RC returns false', () => {
    expect(validateRC('123')).toBe(false);
  });

  test('empty string returns false', () => {
    expect(validateRC('')).toBe(false);
  });
});

describe('validateNIS', () => {
  test('valid 10-digit NIS returns true', () => {
    expect(validateNIS('1234567890')).toBe(true);
  });

  test('invalid NIS returns false', () => {
    expect(validateNIS('12345')).toBe(false);
  });

  test('empty string returns false', () => {
    expect(validateNIS('')).toBe(false);
  });
});

describe('validateAI', () => {
  test('valid 10-digit AI returns true', () => {
    expect(validateAI('0987654321')).toBe(true);
  });

  test('invalid AI returns false', () => {
    expect(validateAI('12345')).toBe(false);
  });

  test('empty string returns false', () => {
    expect(validateAI('')).toBe(false);
  });
});
