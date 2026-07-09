import { describe, test, expect } from 'vitest'
import { modeSwitchPatch, fieldAllowedInMode, ENTREPRISE_ONLY_FIELDS, ARTISAN_ONLY_FIELDS } from '../../src/types'
import type { DocumentState } from '../../src/types'

function makeDoc(overrides: Partial<DocumentState> = {}): DocumentState {
  return {
    documentType: 'devis',
    documentNumber: 'DEV-2026-001',
    date: '2026-01-15',
    mode: 'artisan',
    clientInfo: { name: 'Client', nif: '', nis: '', rc: '', ai: '', phone: '', address: '' },
    companyInfo: undefined,
    artisanInfo: { name: 'Artisan', address: 'Alger', phone: '0555555555', carteArtisan: '123', nif: '12345678901', nis: '1234567890', ai: '1234567890' },
    items: [],
    tvaRate: 19,
    stampDuty: { rate: 1, minAmount: 100, maxAmount: 10000 },
    paymentMode: 'cheque',
    validUntil: '2026-02-15',
    sectionOrder: ['general', 'client', 'prestations'],
    hiddenFields: [],
    customFields: {},
    totalHT: 0,
    ...overrides,
  } as DocumentState
}

describe('ENTREPRISE_ONLY_FIELDS', () => {
  test('contains expected fields', () => {
    expect(ENTREPRISE_ONLY_FIELDS).toContain('companyName')
    expect(ENTREPRISE_ONLY_FIELDS).toContain('companyAddress')
    expect(ENTREPRISE_ONLY_FIELDS).toContain('rc')
    expect(ENTREPRISE_ONLY_FIELDS).toContain('companyCapital')
  })

  test('does not contain shared fields', () => {
    expect(ENTREPRISE_ONLY_FIELDS).not.toContain('nif')
    expect(ENTREPRISE_ONLY_FIELDS).not.toContain('nis')
    expect(ENTREPRISE_ONLY_FIELDS).not.toContain('ai')
  })
})

describe('ARTISAN_ONLY_FIELDS', () => {
  test('contains carteArtisan', () => {
    expect(ARTISAN_ONLY_FIELDS).toContain('carteArtisan')
  })
})

describe('fieldAllowedInMode', () => {
  test('shared fields allowed in both modes', () => {
    expect(fieldAllowedInMode('nif', 'artisan')).toBe(true)
    expect(fieldAllowedInMode('nif', 'entreprise')).toBe(true)
    expect(fieldAllowedInMode('docNumber', 'artisan')).toBe(true)
    expect(fieldAllowedInMode('docNumber', 'entreprise')).toBe(true)
  })

  test('entreprise-only fields hidden in artisan mode', () => {
    expect(fieldAllowedInMode('companyName', 'artisan')).toBe(false)
    expect(fieldAllowedInMode('rc', 'artisan')).toBe(false)
    expect(fieldAllowedInMode('companyCapital', 'artisan')).toBe(false)
  })

  test('entreprise-only fields allowed in entreprise mode', () => {
    expect(fieldAllowedInMode('companyName', 'entreprise')).toBe(true)
    expect(fieldAllowedInMode('rc', 'entreprise')).toBe(true)
  })

  test('artisan-only fields hidden in entreprise mode', () => {
    expect(fieldAllowedInMode('carteArtisan', 'entreprise')).toBe(false)
  })

  test('artisan-only fields allowed in artisan mode', () => {
    expect(fieldAllowedInMode('carteArtisan', 'artisan')).toBe(true)
  })
})

describe('modeSwitchPatch', () => {
  test('switching to entreprise creates companyInfo and clears artisanInfo', () => {
    const doc = makeDoc({ mode: 'artisan' })
    const patch = modeSwitchPatch(doc, 'entreprise')
    expect(patch.mode).toBe('entreprise')
    expect(patch.companyInfo).toBeDefined()
    expect(patch.companyInfo?.name).toBe('')
    expect(patch.artisanInfo).toBeUndefined()
  })

  test('switching to artisan creates artisanInfo and clears companyInfo', () => {
    const doc = makeDoc({
      mode: 'entreprise',
      companyInfo: { name: 'Société', address: 'Alger', taxIds: { nif: '123456789012345', nis: '1234567890', rc: '16/00-0000000', ai: '1234567890' }, capital: '1000000' },
      artisanInfo: undefined,
    })
    const patch = modeSwitchPatch(doc, 'artisan')
    expect(patch.mode).toBe('artisan')
    expect(patch.artisanInfo).toBeDefined()
    expect(patch.artisanInfo?.name).toBe('')
    expect(patch.companyInfo).toBeUndefined()
  })

  test('clears companyCapital when switching to artisan', () => {
    const doc = makeDoc({ mode: 'entreprise', companyCapital: '1000000' })
    const patch = modeSwitchPatch(doc, 'artisan')
    expect(patch.companyCapital).toBe('')
  })

  test('preserves existing artisanInfo when switching to artisan', () => {
    const doc = makeDoc({
      mode: 'entreprise',
      artisanInfo: { name: 'Existing', address: 'Addr', phone: '0555', carteArtisan: '123', nif: '12345678901', nis: '1234567890', ai: '1234567890' },
    })
    const patch = modeSwitchPatch(doc, 'artisan')
    expect(patch.artisanInfo?.name).toBe('Existing')
  })
})
