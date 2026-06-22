'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { calculateDocument } from '@/lib/calculations';

interface Props {
  defaultAmount?: number;
  defaultTva?: number;
}

export function TaxCalculator({ defaultAmount = 100000, defaultTva = 19 }: Props) {
  const t = useTranslations('calc');
  const [amount, setAmount] = useState(defaultAmount);
  const [tvaRate, setTvaRate] = useState(defaultTva);
  const [docType, setDocType] = useState<'facture' | 'devis'>('facture');

  const results = useMemo(() => {
    const mockDoc = {
      mode: 'entreprise' as const,
      clientInfo: { name: '', address: '', phone: '', email: '', ai: '' },
      items: [{ id: 'calc', designation: 'Service', quantity: 1, unit: 'u' as const, unitPrice: amount }],
      tvaRate,
      paymentMode: 'virement' as const,
      documentType: docType,
      documentNumber: 'CALC-001',
      date: new Date().toISOString().split('T')[0],
      discount: { type: 'percentage' as const, value: 0, reason: '' },
      stampDuty: { rate: 1, minAmount: 5, maxAmount: 2500 },
      paymentDetails: { terms: '', iban: '' },
      hiddenBlocks: [],
      chantierAddress: '', chantierType: '', chantierSurface: 0, chantierEtat: '', chantierProtection: '',
      materiauxMarque: '', materiauxType: '', materiauxCouleur: '', materiauxQte: 0,
      garantieMO: '', garantieMateriaux: '', garantieNotes: '',
      sectionOrder: [],
      customFields: {},
    };
    return calculateDocument(mockDoc);
  }, [amount, tvaRate, docType]);

  return (
    <div className="calc-widget">
      <div className="calc-header">
        <div className="calc-title">{t('title')}</div>
        <div className="calc-subtitle">{t('subtitle')}</div>
      </div>

      <div className="calc-body">
        <div className="calc-field">
          <label className="calc-label">{t('totalHT')}</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="calc-input"
          />
        </div>

        <div className="calc-field">
          <label className="calc-label">{t('tvaRate')}</label>
          <select
            value={tvaRate}
            onChange={e => setTvaRate(Number(e.target.value))}
            className="calc-select"
          >
            <option value={19}>19%</option>
            <option value={9}>9%</option>
            <option value={0}>0%</option>
          </select>
        </div>

        <div className="calc-field">
          <label className="calc-label">{t('docType')}</label>
          <select
            value={docType}
            onChange={e => setDocType(e.target.value as 'facture' | 'devis')}
            className="calc-select"
          >
            <option value="facture">{t('invoice')}</option>
            <option value="devis">{t('quote')}</option>
          </select>
        </div>

        <div className="calc-results">
          <div className="calc-result-row">
            <span className="calc-result-label">{t('tva')}</span>
            <span className="calc-result-value">{results.tvaAmount.toLocaleString('fr-DZ')} DA</span>
          </div>

          {results.timbreFiscal > 0 && (
            <div className="calc-result-row highlight">
              <span className="calc-result-label">{t('timbreFiscal')}</span>
              <span className="calc-result-value">{results.timbreFiscal.toLocaleString('fr-DZ')} DA</span>
            </div>
          )}

          <div className="calc-result-row total">
            <span className="calc-total-label">{t('totalTTC')}</span>
            <span className="calc-total-value">{results.totalTTC.toLocaleString('fr-DZ')} DA</span>
          </div>
        </div>
      </div>
    </div>
  );
}