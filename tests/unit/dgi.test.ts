import { describe, test, expect } from 'vitest'
import * as dgi from '../../src/lib/dgi'

describe('TIMBRE_FISCAL_AMOUNT', () => {
  test('equals 1000', () => {
    expect(dgi.TIMBRE_FISCAL_AMOUNT).toBe(1000)
  })
})

describe('TIMBRE_FISCAL_THRESHOLD', () => {
  test('equals 10000', () => {
    expect(dgi.TIMBRE_FISCAL_THRESHOLD).toBe(10000)
  })
})

describe('TVA_RATES', () => {
  test('contains 0, 9, 19', () => {
    expect(dgi.TVA_RATES).toEqual([0, 9, 19])
  })
})

describe('validateNIF', () => {
  test('valid 11-digit NIF', () => {
    expect(dgi.validateNIF('12345678901')).toBe(true)
  })

  test('valid 15-digit NIF', () => {
    expect(dgi.validateNIF('123456789012345')).toBe(true)
  })

  test('invalid 12-digit NIF', () => {
    expect(dgi.validateNIF('123456789012')).toBe(false)
  })

  test('empty string', () => {
    expect(dgi.validateNIF('')).toBe(false)
  })

  test('null-like input', () => {
    expect(dgi.validateNIF(null as unknown as string)).toBe(false)
  })

  test('with leading and trailing spaces', () => {
    expect(dgi.validateNIF('  12345678901  ')).toBe(true)
  })

  test('with spaces in the middle', () => {
    expect(dgi.validateNIF('123 456 789 01')).toBe(false)
  })

  test('leading zeros are valid', () => {
    expect(dgi.validateNIF('00000000001')).toBe(true)
  })

  test('leading zeros 15-digit', () => {
    expect(dgi.validateNIF('000000000000001')).toBe(true)
  })

  test('letters are invalid', () => {
    expect(dgi.validateNIF('1234567890a')).toBe(false)
  })
})

describe('isCompanyNIF', () => {
  test('15-digit returns true', () => {
    expect(dgi.isCompanyNIF('123456789012345')).toBe(true)
  })

  test('11-digit returns false', () => {
    expect(dgi.isCompanyNIF('12345678901')).toBe(false)
  })

  test('empty returns false', () => {
    expect(dgi.isCompanyNIF('')).toBe(false)
  })
})

describe('isIndividualNIF', () => {
  test('11-digit returns true', () => {
    expect(dgi.isIndividualNIF('12345678901')).toBe(true)
  })

  test('15-digit returns false', () => {
    expect(dgi.isIndividualNIF('123456789012345')).toBe(false)
  })

  test('empty returns false', () => {
    expect(dgi.isIndividualNIF('')).toBe(false)
  })
})

describe('validateRC', () => {
  test('valid 9-char RC', () => {
    expect(dgi.validateRC('ABC123456')).toBe(true)
  })

  test('valid 14-char RC', () => {
    expect(dgi.validateRC('ABCD1234567890')).toBe(true)
  })

  test('invalid 8-char RC', () => {
    expect(dgi.validateRC('ABC12345')).toBe(false)
  })

  test('lowercase is converted to uppercase', () => {
    expect(dgi.validateRC('abc123456')).toBe(true)
  })

  test('empty string', () => {
    expect(dgi.validateRC('')).toBe(false)
  })
})

describe('validateNIS', () => {
  test('valid 10-digit NIS', () => {
    expect(dgi.validateNIS('1234567890')).toBe(true)
  })

  test('invalid 9-digit NIS', () => {
    expect(dgi.validateNIS('123456789')).toBe(false)
  })

  test('empty string', () => {
    expect(dgi.validateNIS('')).toBe(false)
  })
})

describe('validateAI', () => {
  test('valid 10-digit AI', () => {
    expect(dgi.validateAI('1234567890')).toBe(true)
  })

  test('invalid 12-digit AI', () => {
    expect(dgi.validateAI('123456789012')).toBe(false)
  })

  test('empty string', () => {
    expect(dgi.validateAI('')).toBe(false)
  })
})

describe('validateCompanyTaxIds', () => {
  test('all valid', () => {
    const result = dgi.validateCompanyTaxIds({
      nif: '12345678901',
      rc: 'ABC123456',
      nis: '1234567890',
      ai: '1234567890',
    })
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  test('some invalid', () => {
    const result = dgi.validateCompanyTaxIds({
      nif: '123',
      rc: 'AB',
      nis: '1234567890',
      ai: '1234567890',
    })
    expect(result.valid).toBe(false)
    expect(result.errors.nif).toBeDefined()
    expect(result.errors.rc).toBeDefined()
    expect(result.errors.nis).toBeUndefined()
    expect(result.errors.ai).toBeUndefined()
  })

  test('empty object is valid', () => {
    const result = dgi.validateCompanyTaxIds({})
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  test('all invalid', () => {
    const result = dgi.validateCompanyTaxIds({
      nif: '123',
      rc: 'X',
      nis: '123',
      ai: '123',
    })
    expect(result.valid).toBe(false)
    expect(Object.keys(result.errors)).toHaveLength(4)
  })
})

describe('shouldApplyTimbre', () => {
  test('FACTURE >= 10000 applies', () => {
    expect(dgi.shouldApplyTimbre('FACTURE', 10000)).toBe(true)
  })

  test('FACTURE above 10000 applies', () => {
    expect(dgi.shouldApplyTimbre('FACTURE', 15000)).toBe(true)
  })

  test('DEVIS >= 10000 is exempt', () => {
    expect(dgi.shouldApplyTimbre('DEVIS', 10000)).toBe(false)
  })

  test('devis lowercase is exempt', () => {
    expect(dgi.shouldApplyTimbre('devis', 10000)).toBe(false)
  })

  test('ATTACHEMENT >= 10000 is exempt', () => {
    expect(dgi.shouldApplyTimbre('ATTACHEMENT', 10000)).toBe(false)
  })

  test('attachement lowercase is exempt', () => {
    expect(dgi.shouldApplyTimbre('attachement', 10000)).toBe(false)
  })

  test('FACTURE < 10000 does not apply', () => {
    expect(dgi.shouldApplyTimbre('FACTURE', 9999)).toBe(false)
  })

  test('PROFORMA >= 10000 applies', () => {
    expect(dgi.shouldApplyTimbre('PROFORMA', 10000)).toBe(true)
  })
})

describe('calculateTimbreFiscal', () => {
  test('true returns 1000', () => {
    expect(dgi.calculateTimbreFiscal(true)).toBe(1000)
  })

  test('false returns 0', () => {
    expect(dgi.calculateTimbreFiscal(false)).toBe(0)
  })
})

describe('calculateDocumentTotals', () => {
  test('empty items returns zeros', () => {
    const result = dgi.calculateDocumentTotals([], 'FACTURE')
    expect(result.subTotalHT).toBe(0)
    expect(result.totalTVA).toBe(0)
    expect(result.totalTTC).toBe(0)
    expect(result.timbreFiscal).toBe(false)
    expect(result.timbreAmount).toBe(0)
    expect(result.netAPayer).toBe(0)
  })

  test('single item 0% TVA', () => {
    const result = dgi.calculateDocumentTotals(
      [{ quantity: 2, unitPrice: 1000, tvaRate: 0 }],
      'FACTURE'
    )
    expect(result.subTotalHT).toBe(2000)
    expect(result.totalTVA).toBe(0)
    expect(result.totalTTC).toBe(2000)
    expect(result.netAPayer).toBe(2000)
  })

  test('single item 19% TVA', () => {
    const result = dgi.calculateDocumentTotals(
      [{ quantity: 1, unitPrice: 10000, tvaRate: 19 }],
      'FACTURE'
    )
    expect(result.subTotalHT).toBe(10000)
    expect(result.totalTVA).toBe(1900)
    expect(result.totalTTC).toBe(11900)
    expect(result.timbreFiscal).toBe(true)
    expect(result.timbreAmount).toBe(1000)
    expect(result.netAPayer).toBe(12900)
  })

  test('multiple items 19% TVA', () => {
    const result = dgi.calculateDocumentTotals(
      [
        { quantity: 2, unitPrice: 5000, tvaRate: 19 },
        { quantity: 3, unitPrice: 2000, tvaRate: 19 },
      ],
      'FACTURE'
    )
    expect(result.subTotalHT).toBe(16000)
    expect(result.totalTVA).toBe(3040)
    expect(result.totalTTC).toBe(19040)
    expect(result.timbreFiscal).toBe(true)
    expect(result.timbreAmount).toBe(1000)
    expect(result.netAPayer).toBe(20040)
  })

  test('timbre on facture >= 10000', () => {
    const result = dgi.calculateDocumentTotals(
      [{ quantity: 1, unitPrice: 10000, tvaRate: 0 }],
      'FACTURE'
    )
    expect(result.timbreFiscal).toBe(true)
    expect(result.timbreAmount).toBe(1000)
  })

  test('no timbre on devis', () => {
    const result = dgi.calculateDocumentTotals(
      [{ quantity: 1, unitPrice: 50000, tvaRate: 19 }],
      'DEVIS'
    )
    expect(result.timbreFiscal).toBe(false)
    expect(result.timbreAmount).toBe(0)
  })

  test('with acompte', () => {
    const result = dgi.calculateDocumentTotals(
      [{ quantity: 1, unitPrice: 20000, tvaRate: 0 }],
      'FACTURE',
      5000
    )
    expect(result.totalTTC).toBe(20000)
    expect(result.netAPayer).toBe(16000)
  })

  test('9% TVA rate', () => {
    const result = dgi.calculateDocumentTotals(
      [{ quantity: 1, unitPrice: 10000, tvaRate: 9 }],
      'FACTURE'
    )
    expect(result.subTotalHT).toBe(10000)
    expect(result.totalTVA).toBe(900)
    expect(result.totalTTC).toBe(10900)
  })
})

describe('generateDocNumber', () => {
  const year = new Date().getFullYear()

  test('DEVIS generates DEV prefix', () => {
    expect(dgi.generateDocNumber('DEVIS')).toBe(`DEV-${year}-00001`)
  })

  test('FACTURE generates FAC prefix', () => {
    expect(dgi.generateDocNumber('FACTURE')).toBe(`FAC-${year}-00001`)
  })

  test('PROFORMA generates PRO prefix', () => {
    expect(dgi.generateDocNumber('PROFORMA')).toBe(`PRO-${year}-00001`)
  })

  test('BC generates BC prefix', () => {
    expect(dgi.generateDocNumber('BC')).toBe(`BC-${year}-00001`)
  })

  test('BR generates BR prefix', () => {
    expect(dgi.generateDocNumber('BR')).toBe(`BR-${year}-00001`)
  })

  test('INTERVENTION generates INT prefix', () => {
    expect(dgi.generateDocNumber('INTERVENTION')).toBe(`INT-${year}-00001`)
  })

  test('ATTACHEMENT generates ATT prefix', () => {
    expect(dgi.generateDocNumber('ATTACHEMENT')).toBe(`ATT-${year}-00001`)
  })

  test('unknown type generates DOC prefix', () => {
    expect(dgi.generateDocNumber('UNKNOWN')).toBe(`DOC-${year}-00001`)
  })

  test('with custom sequence number', () => {
    expect(dgi.generateDocNumber('FACTURE', 42)).toBe(`FAC-${year}-00042`)
  })

  test('lowercase type is handled', () => {
    expect(dgi.generateDocNumber('facture')).toBe(`FAC-${year}-00001`)
  })
})

describe('formatCurrency', () => {
  test('formats basic amount with DA', () => {
    const result = dgi.formatCurrency(1234.56)
    expect(result).toContain('DA')
    expect(result).toContain('1')
  })

  test('formats zero', () => {
    const result = dgi.formatCurrency(0)
    expect(result).toContain('0,00')
    expect(result).toContain('DA')
  })
})

describe('formatDateAlgerian', () => {
  test('formats known date', () => {
    const result = dgi.formatDateAlgerian('2024-01-15')
    expect(result).toContain('15')
    expect(result).toContain('01')
    expect(result).toContain('2024')
  })

  test('formats Date object', () => {
    const result = dgi.formatDateAlgerian(new Date(2024, 0, 15))
    expect(result).toContain('15')
    expect(result).toContain('01')
    expect(result).toContain('2024')
  })
})

describe('numberToFrenchWords', () => {
  test('0 returns Zéro', () => {
    expect(dgi.numberToFrenchWords(0)).toBe('Zéro dinar algérien')
  })

  test('1000 returns mille', () => {
    const result = dgi.numberToFrenchWords(1000)
    expect(result.toLowerCase()).toContain('mille')
  })

  test('1500', () => {
    const result = dgi.numberToFrenchWords(1500)
    expect(result.toLowerCase()).toContain('mille')
    expect(result.toLowerCase()).toContain('cinq')
  })

  test('25000', () => {
    const result = dgi.numberToFrenchWords(25000)
    expect(result.toLowerCase()).toContain('vingt')
    expect(result.toLowerCase()).toContain('cinq')
    expect(result.toLowerCase()).toContain('mille')
  })

  test('result starts with uppercase', () => {
    const result = dgi.numberToFrenchWords(42)
    expect(result[0]).toBe(result[0].toUpperCase())
  })
})

describe('numberToArabicWords', () => {
  test('0 returns صفر دينار جزائري', () => {
    expect(dgi.numberToArabicWords(0)).toBe('صفر دينار جزائري')
  })

  test('1000 contains ألف', () => {
    const result = dgi.numberToArabicWords(1000)
    expect(result).toContain('ألف')
  })

  test('5000 contains خمسة', () => {
    const result = dgi.numberToArabicWords(5000)
    expect(result).toContain('خمسة')
    expect(result).toContain('ألف')
  })
})
