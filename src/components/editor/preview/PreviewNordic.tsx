'use client';
import React from 'react';
import type { DocumentState } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { formatCurrency } from '@/lib/calculations';

const NK = {
  teal: '#0f766e',
  tealLight: '#f0fdf4',
  tealBorder: '#bbf7d0',
  tealDark: '#134e4a',
  text: '#111827',
  muted: '#6b7280',
  faint: '#9ca3af',
  rule: '#e5e7eb',
};

const FONT = "var(--font-montserrat, 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif)";

interface Props {
  doc: DocumentState;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  t: (key: string) => string;
  tc: (key: string) => string;
  tu: (key: string) => string;
  results: {
    subTotalHT: number;
    tvaRate: number;
    tvaAmount: number;
    timbreFiscal: number;
    discountAmount: number;
    totalTTC: number;
    acompte: number;
    netAPayer: number;
    totalInWords: string;
  };
  design: DocTypeDesign;
  highlight?: string | null;
  onZoneClick?: (focus: 'header' | 'client' | 'items' | 'totals' | 'payment') => void;
}

export function PreviewNordic({ doc, sf, bv, vb, tc, results, onZoneClick }: Props) {
  const zoneProps = (focus: 'header' | 'client' | 'items' | 'totals' | 'payment') =>
    onZoneClick ? { onClick: () => onZoneClick(focus), title: 'Cliquer pour modifier' } : {};
  const zoneCursor: React.CSSProperties = onZoneClick ? { cursor: 'pointer' } : {};
  const isEnt = doc.mode === 'entreprise';
  const currency = tc('currency') || 'DA';
  const fmt = (n: number) => n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const companyName = isEnt ? (doc.companyInfo?.name ?? '') : (doc.artisanInfo?.name ?? '');
  const companyAddr = isEnt ? (doc.companyInfo?.address ?? '') : (doc.artisanInfo?.address ?? '');

  const docLabel =
    doc.documentType === 'facture' ? 'FACTURE' :
    doc.documentType === 'proforma' ? 'PROFORMA' :
    doc.documentType === 'bc' ? 'BON DE COMMANDE' :
    doc.documentType === 'br' ? 'BON DE RÉCEPTION' : 'DEVIS';

  return (
    <div id="print-area" className="w-[21cm] min-h-[29.7cm] flex flex-col shadow-md print:shadow-none" style={{ background: '#fff', fontFamily: FONT }}>
      {/* Top accent stripe */}
      <div style={{ height: 3, background: NK.teal, flexShrink: 0 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '32px 40px 20px' }}>
        <div style={{ flex: 1 }}>
          {companyName && (
            <div style={{ fontSize: 18, fontWeight: 700, color: NK.text, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {companyName}
            </div>
          )}
          {companyAddr && (
            <div style={{ fontSize: 11, color: NK.muted, lineHeight: 1.6, marginBottom: 3 }}>{companyAddr}</div>
          )}
          {doc.companyPhone && (
            <div style={{ fontSize: 10, color: NK.faint }}>Tél : {doc.companyPhone}</div>
          )}
          {isEnt && doc.companyInfo && (
            <div style={{ fontSize: 10, color: NK.faint, lineHeight: 1.9, marginTop: 2 }}>
              {doc.companyInfo.taxIds.nif && <span>NIF : {doc.companyInfo.taxIds.nif}</span>}
              {doc.companyInfo.taxIds.rc && <span style={{ marginLeft: 10 }}>RC : {doc.companyInfo.taxIds.rc}</span>}
              {doc.companyInfo.taxIds.nis && <><br /><span>NIS : {doc.companyInfo.taxIds.nis}</span></>}
            </div>
          )}
          {/* Artisan mode */}
          {!isEnt && doc.artisanInfo && (
            <div style={{ fontSize: 10, color: NK.faint, marginTop: 2 }}>
              {doc.artisanInfo.phone && <span>Tél : {doc.artisanInfo.phone}</span>}
            </div>
          )}
        </div>

        {/* Doc title block */}
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 24 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: NK.teal, letterSpacing: '-1px', lineHeight: 1 }}>{docLabel}</div>
          {sf('docNumber') && doc.documentNumber && (
            <div style={{ fontSize: 11, color: NK.muted, marginTop: 6 }}>N° {doc.documentNumber}</div>
          )}
          {sf('issueDate') && doc.date && (
            <div style={{ fontSize: 11, color: NK.muted }}>Date : {doc.date}</div>
          )}
          {sf('validUntil') && doc.validUntil && (
            <div style={{ fontSize: 10, color: NK.faint }}>Valable : {doc.validUntil}</div>
          )}
          {sf('orderRef') && doc.bcRef && (
            <div style={{ fontSize: 10, color: NK.faint }}>Réf BC : {doc.bcRef}</div>
          )}
        </div>
      </div>

      {/* Rule */}
      <div style={{ height: 1, background: NK.tealBorder, margin: '0 40px' }} />

      {/* Client */}
      {vb('client') && bv('clientName', 'clientAddress') && doc.clientInfo.name && (
        <div style={{ margin: '20px 40px', background: NK.tealLight, borderLeft: `3px solid ${NK.teal}`, padding: '12px 16px', ...zoneCursor }} {...zoneProps('client')}>
          <div style={{ fontSize: 9, fontWeight: 700, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Client</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: NK.text }}>{doc.clientInfo.name}</div>
          {doc.clientInfo.address && (
            <div style={{ fontSize: 11, color: NK.muted, marginTop: 2 }}>{doc.clientInfo.address}</div>
          )}
          {doc.clientInfo.nif && (
            <div style={{ fontSize: 10, color: NK.faint, marginTop: 2 }}>NIF : {doc.clientInfo.nif}</div>
          )}
          {doc.clientInfo.rc && (
            <span style={{ fontSize: 10, color: NK.faint, marginLeft: 10 }}>RC : {doc.clientInfo.rc}</span>
          )}
        </div>
      )}

      {/* Objet */}
      {doc.objet && (
        <div style={{ margin: '0 40px 16px', borderLeft: `2px solid ${NK.tealBorder}`, padding: '8px 12px', fontSize: 11, color: NK.muted, lineHeight: 1.5 }}>
          <strong style={{ fontSize: 9, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Objet</strong>
          {doc.objet}
        </div>
      )}

      {/* Items table */}
      {vb('table') && sf('itemsTable') && doc.items.length > 0 && (
        <div style={{ padding: '0 40px', ...zoneCursor }} {...zoneProps('items')}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${NK.teal}` }}>
                <th style={{ padding: '8px 0 8px 2px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Désignation</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em', width: 44 }}>Qté</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em', width: 34 }}>U.</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em', width: 96 }}>P.U. HT</th>
                <th style={{ padding: '8px 0', textAlign: 'right', fontSize: 9, fontWeight: 700, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em', width: 108 }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: `0.5px solid ${NK.rule}`, background: idx % 2 === 1 ? NK.tealLight : '#fff' }}>
                  <td style={{ padding: '9px 0 9px 2px', color: NK.text, lineHeight: 1.4, verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 500 }}>{item.designation}</div>
                    {item.description && <div style={{ fontSize: 9, color: NK.faint, marginTop: 1, fontStyle: 'italic' }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '9px 6px', textAlign: 'center', color: NK.muted }}>{item.quantity}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'center', color: NK.muted, fontSize: 10 }}>{item.unit}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'right', color: NK.muted }}>{fmt(item.unitPrice)}</td>
                  <td style={{ padding: '9px 0', textAlign: 'right', fontWeight: 700, color: NK.tealDark }}>{fmt(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 40px 0' }}>
        <div style={{ width: 264, ...zoneCursor }} {...zoneProps('totals')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: NK.muted, borderBottom: `0.5px solid ${NK.rule}` }}>
            <span>Sous-total HT</span>
            <span>{formatCurrency(results.subTotalHT, currency)}</span>
          </div>
          {results.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: '#ef4444', borderBottom: `0.5px solid ${NK.rule}` }}>
              <span>Remise</span>
              <span>-{formatCurrency(results.discountAmount, currency)}</span>
            </div>
          )}
          {results.tvaAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: NK.muted, borderBottom: `0.5px solid ${NK.rule}` }}>
              <span>TVA ({results.tvaRate}%)</span>
              <span>{formatCurrency(results.tvaAmount, currency)}</span>
            </div>
          )}
          {results.timbreFiscal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: NK.muted, borderBottom: `0.5px solid ${NK.rule}` }}>
              <span>Timbre fiscal</span>
              <span>{formatCurrency(results.timbreFiscal, currency)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: NK.teal, color: '#fff', fontSize: 13, fontWeight: 700, marginTop: 6 }}>
            <span>Total TTC</span>
            <span style={{ fontSize: 15 }}>{formatCurrency(results.totalTTC, currency)}</span>
          </div>
          {results.acompte > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: '#ef4444', marginTop: 4 }}>
              <span>Acompte versé</span>
              <span>-{formatCurrency(results.acompte, currency)}</span>
            </div>
          )}
          {results.netAPayer !== results.totalTTC && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, fontWeight: 700, color: NK.tealDark }}>
              <span>Net à payer</span>
              <span>{formatCurrency(results.netAPayer, currency)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount in words */}
      {vb('tafqit') && results.totalInWords && (
        <div style={{ margin: '14px 40px 0', padding: '10px 14px', border: `0.5px solid ${NK.tealBorder}`, background: NK.tealLight, fontSize: 10.5, color: NK.muted, lineHeight: 1.5 }}>
          <strong style={{ display: 'block', fontSize: 9, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Arrêté à la somme de</strong>
          <em>{results.totalInWords}</em>
        </div>
      )}

      {/* Payment info */}
      {vb('payment') && bv('paymentConditions', 'paymentIban') && (doc.paymentDetails.terms || doc.paymentDetails.iban) && (
        <div style={{ margin: '12px 40px 0', padding: '10px 14px', border: `0.5px solid ${NK.rule}`, fontSize: 10.5, color: NK.muted, lineHeight: 1.6, ...zoneCursor }} {...zoneProps('payment')}>
          <strong style={{ display: 'block', fontSize: 9, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Paiement</strong>
          {doc.paymentDetails.terms && <div>{doc.paymentDetails.terms}</div>}
          {doc.paymentDetails.iban && <div style={{ fontSize: 10 }}>RIB : {doc.paymentDetails.iban}</div>}
          {doc.bankName && <div style={{ fontSize: 10 }}>{doc.bankName}{doc.bankAgency ? ` — ${doc.bankAgency}` : ''}</div>}
        </div>
      )}

      {/* Notes */}
      {doc.notes && (
        <div style={{ margin: '10px 40px 0', padding: '10px 14px', border: `0.5px solid ${NK.rule}`, fontSize: 10.5, color: NK.muted, lineHeight: 1.5 }}>
          <strong style={{ display: 'block', fontSize: 9, color: NK.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Notes</strong>
          {doc.notes}
        </div>
      )}

      {/* Signatures */}
      {vb('signature') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '20px 40px 0', borderTop: `1px solid ${NK.rule}`, paddingTop: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: NK.teal, marginBottom: 8 }}>Le Client</div>
            <div style={{ height: 60, border: `1px solid ${NK.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 9, marginBottom: 4 }}>Signature & cachet</div>
            <div style={{ fontSize: 10, color: NK.muted }}>Bon pour accord</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: NK.teal, marginBottom: 8 }}>Prestataire</div>
            <div style={{ height: 60, border: `1px solid ${NK.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 9, marginBottom: 4 }}>
              {doc.companyInfo?.signature
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={doc.companyInfo.signature} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="signature" />
                : 'Signature & cachet'}
            </div>
            <div style={{ fontSize: 10, color: NK.muted, fontWeight: 600 }}>{companyName}</div>
          </div>
        </div>
      )}

      {/* Spacer pushes footer down */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${NK.tealBorder}`, margin: '16px 40px 0', paddingTop: 10 }} />
      <div style={{ padding: '0 40px 14px', fontSize: 9, color: NK.faint, textAlign: 'center', lineHeight: 1.9 }}>
        {companyAddr && <span>{companyAddr}</span>}
        {isEnt && doc.companyInfo?.taxIds?.nif && <span style={{ marginLeft: 12 }}>· NIF : {doc.companyInfo.taxIds.nif}</span>}
        {isEnt && doc.companyInfo?.taxIds?.rc && <span style={{ marginLeft: 12 }}>· RC : {doc.companyInfo.taxIds.rc}</span>}
        {doc.companyPhone && <span style={{ marginLeft: 12 }}>· Tél : {doc.companyPhone}</span>}
        <br />
        <span style={{ color: '#d1fae5' }}>Document généré par CloudDevis</span>
      </div>
    </div>
  );
}
