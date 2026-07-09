import { describe, test, expect } from 'vitest'
import { auditDocument } from '../../src/lib/complianceAudit'
import type { DocumentState, CalculationResult } from '../../src/types'

function makeDoc(overrides: Partial<DocumentState> = {}): DocumentState {
  return {
    documentType: 'facture',
    documentNumber: 'FAC-2026-001',
    date: '2026-01-15',
    mode: 'artisan',
    clientInfo: { name: 'Client Test', nif: '12345678901', nis: '1234567890', rc: '', ai: '', phone: '0555555555', address: 'Alger' },
    companyInfo: undefined,
    artisanInfo: { name: 'Artisan Test', address: 'Alger', phone: '0555555555', carteArtisan: '056/04/2024/12345', nif: '12345678901', nis: '1234567890', ai: '1234567890' },
    items: [],
    tvaRate: 19,
    stampDuty: { rate: 1, minAmount: 100, maxAmount: 10000 },
    paymentMode: 'especes',
    validUntil: '2026-02-15',
    sectionOrder: ['general', 'client', 'prestations'],
    hiddenFields: [],
    customFields: {},
    totalHT: 0,
    ...overrides,
  } as DocumentState
}

function makeResults(overrides: Partial<CalculationResult> = {}): CalculationResult {
  return {
    subTotalHT: 100000,
    tvaRate: 19,
    tvaAmount: 19000,
    timbreFiscal: 1000,
    discountAmount: 0,
    totalHTAfterDiscount: 100000,
    totalTTC: 120000,
    acompte: 0,
    netAPayer: 120000,
    totalInWords: 'Cent vingt mille dinars algériens',
    ...overrides,
  }
}

describe('auditDocument', () => {
  test('returns no issues for valid artisan document', () => {
    const doc = makeDoc()
    const results = makeResults()
    const issues = auditDocument(doc, results)
    expect(issues).toEqual([])
  })

  test('warns when artisan NIF is missing', () => {
    const doc = makeDoc({ artisanInfo: { name: 'Test', address: '', phone: '', nif: '', nis: '1234567890', ai: '1234567890', carteArtisan: '123' } })
    const issues = auditDocument(doc, makeResults())
    expect(issues.some(i => i.id === 'artisan-nif-missing')).toBe(true)
  })

  test('errors when artisan NIF is invalid', () => {
    const doc = makeDoc({ artisanInfo: { name: 'Test', address: '', phone: '', nif: '123', nis: '1234567890', ai: '1234567890', carteArtisan: '123' } })
    const issues = auditDocument(doc, makeResults())
    expect(issues.some(i => i.id === 'artisan-nif-invalid')).toBe(true)
  })

  test('warns when artisan carteArtisan is missing', () => {
    const doc = makeDoc({ artisanInfo: { name: 'Test', address: '', phone: '', nif: '12345678901', nis: '1234567890', ai: '1234567890', carteArtisan: '' } })
    const issues = auditDocument(doc, makeResults())
    expect(issues.some(i => i.id === 'artisan-carte-missing')).toBe(true)
  })

  test('returns no issues for valid entreprise document', () => {
    const doc = makeDoc({
      mode: 'entreprise',
      artisanInfo: undefined,
      companyInfo: { name: 'Société Test', address: 'Alger', taxIds: { nif: '123456789012345', nis: '1234567890', rc: '1600000000', ai: '1234567890' }, capital: '1000000' },
    })
    const issues = auditDocument(doc, makeResults())
    expect(issues).toEqual([])
  })

  test('warns when entreprise NIF is missing', () => {
    const doc = makeDoc({
      mode: 'entreprise',
      artisanInfo: undefined,
      companyInfo: { name: 'Société Test', address: 'Alger', taxIds: { nif: '', nis: '1234567890', rc: '1600000000', ai: '1234567890' }, capital: '1000000' },
    })
    const issues = auditDocument(doc, makeResults())
    expect(issues.some(i => i.id === 'entreprise-nif-missing')).toBe(true)
  })

  test('errors when entreprise RC is invalid', () => {
    const doc = makeDoc({
      mode: 'entreprise',
      artisanInfo: undefined,
      companyInfo: { name: 'Société Test', address: 'Alger', taxIds: { nif: '123456789012345', nis: '1234567890', rc: 'invalid', ai: '1234567890' }, capital: '1000000' },
    })
    const issues = auditDocument(doc, makeResults())
    expect(issues.some(i => i.id === 'entreprise-rc-invalid')).toBe(true)
  })

  test('warns when client NIF is missing', () => {
    const doc = makeDoc({ clientInfo: { name: 'Client', nif: '', nis: '', rc: '', ai: '', phone: '', address: '' } })
    const issues = auditDocument(doc, makeResults())
    expect(issues.some(i => i.id === 'client-nif-missing')).toBe(true)
  })

  test('errors when client NIF is invalid', () => {
    const doc = makeDoc({ clientInfo: { name: 'Client', nif: '123', nis: '', rc: '', ai: '', phone: '', address: '' } })
    const issues = auditDocument(doc, makeResults())
    expect(issues.some(i => i.id === 'client-nif-invalid')).toBe(true)
  })

  test('warns when timbre is missing for high TTC', () => {
    const doc = makeDoc()
    const results = makeResults({ totalTTC: 50000, timbreFiscal: 0 })
    const issues = auditDocument(doc, results)
    expect(issues.some(i => i.id === 'timbre-missing')).toBe(true)
  })
})
