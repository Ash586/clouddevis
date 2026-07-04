'use client';
import React from 'react';
import type { DocumentState } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { formatCurrency } from '@/lib/calculations';

const IND = {
  slate: '#1e293b',
  slateMid: '#334155',
  slateLight: '#f1f5f9',
  slateBody: '#f8fafc',
  blue: '#2563eb',
  blueLight: '#93c5fd',
  blueDeep: '#1d4ed8',
  blueNav: '#1e40af',
  text: '#0f172a',
  muted: '#5a6b85',
  faint: '#94a3b8',
  rule: '#e2e8f0',
  white: '#ffffff',
};

// Progressive border colors for table columns
const COL_BORDERS = ['#2563eb', '#4b7ae0', '#7baef9', '#93c5fd', '#93c5fd'];

const SANS = "var(--font-montserrat, 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif)";

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

export function PreviewIndustrielle({ doc, sf, bv, vb, tc, results, onZoneClick }: Props) {
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
    <div id="print-area" className="w-[21cm] min-h-[29.7cm] flex flex-col shadow-md print:shadow-none" style={{ background: IND.white, fontFamily: SANS }}>

      {/* Two-panel header: dark left (émetteur) + light right (référence) */}
      <div style={{ display: 'flex', minHeight: 148 }}>
        {/* Left panel — #1e293b, 45% width */}
        <div style={{ background: IND.slate, width: '45%', padding: '26px 26px', flexShrink: 0 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: IND.faint, marginBottom: 10 }}>Émetteur</div>
          {doc.companyInfo?.logo && (
            <div style={{ marginBottom: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={doc.companyInfo.logo} style={{ maxHeight: 36, maxWidth: 110, objectFit: 'contain' }} alt="logo" />
            </div>
          )}
          {companyName && (
            <div style={{ fontSize: 16, fontWeight: 700, color: IND.white, lineHeight: 1.2, marginBottom: 6 }}>{companyName}</div>
          )}
          {companyAddr && (
            <div style={{ fontSize: 10, color: IND.faint, lineHeight: 1.7, marginBottom: 4 }}>{companyAddr}</div>
          )}
          {(doc.companyPhone || (!isEnt && doc.artisanInfo?.phone)) && (
            <div style={{ fontSize: 9, color: IND.faint, marginBottom: 5 }}>
              Tél : {doc.companyPhone || doc.artisanInfo?.phone}
            </div>
          )}
          {isEnt && doc.companyInfo && (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 10px', fontSize: 9, color: IND.faint, marginTop: 2 }}>
              {doc.companyInfo.taxIds.nif && <><span style={{ color: IND.blueLight, fontWeight: 700 }}>NIF</span><span>{doc.companyInfo.taxIds.nif}</span></>}
              {doc.companyInfo.taxIds.rc && <><span style={{ color: IND.blueLight, fontWeight: 700 }}>RC</span><span>{doc.companyInfo.taxIds.rc}</span></>}
              {doc.companyInfo.taxIds.nis && <><span style={{ color: IND.blueLight, fontWeight: 700 }}>NIS</span><span>{doc.companyInfo.taxIds.nis}</span></>}
              {doc.companyInfo.taxIds.ai && <><span style={{ color: IND.blueLight, fontWeight: 700 }}>AI</span><span>{doc.companyInfo.taxIds.ai}</span></>}
            </div>
          )}
        </div>

        {/* Right panel — #f1f5f9 */}
        <div style={{ background: IND.slateLight, flex: 1, padding: '26px 26px' }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: IND.faint, marginBottom: 10 }}>Référence</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: IND.slate, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1 }}>{docLabel}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 14px', fontSize: 11 }}>
            {sf('docNumber') && doc.documentNumber && (
              <><span style={{ fontSize: 9, color: IND.faint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center' }}>N°</span>
              <span style={{ color: IND.text, fontWeight: 600 }}>{doc.documentNumber}</span></>
            )}
            {sf('issueDate') && doc.date && (
              <><span style={{ fontSize: 9, color: IND.faint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center' }}>Date</span>
              <span style={{ color: IND.text }}>{doc.date}</span></>
            )}
            {sf('validUntil') && doc.validUntil && (
              <><span style={{ fontSize: 9, color: IND.faint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center' }}>Validité</span>
              <span style={{ color: IND.text }}>{doc.validUntil}</span></>
            )}
            {sf('orderRef') && doc.bcRef && (
              <><span style={{ fontSize: 9, color: IND.faint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center' }}>Réf BC</span>
              <span style={{ color: IND.text }}>{doc.bcRef}</span></>
            )}
          </div>
        </div>
      </div>

      {/* Client block on #f8fafc */}
      {vb('client') && doc.clientInfo.name && (
        <div style={{ background: IND.slateBody, margin: '14px 26px', padding: '14px 18px', ...zoneCursor }} {...zoneProps('client')}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: IND.blue, marginBottom: 9 }}>Destinataire</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 20px', fontSize: 11 }}>
            <div>
              <div style={{ fontSize: 9, color: IND.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Raison sociale</div>
              <div style={{ fontWeight: 700, color: IND.text }}>{doc.clientInfo.name}</div>
            </div>
            {doc.clientInfo.address && (
              <div>
                <div style={{ fontSize: 9, color: IND.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Adresse</div>
                <div style={{ color: IND.muted }}>{doc.clientInfo.address}</div>
              </div>
            )}
            {doc.clientInfo.nif && (
              <div>
                <div style={{ fontSize: 9, color: IND.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>NIF</div>
                <div style={{ color: IND.muted }}>{doc.clientInfo.nif}</div>
              </div>
            )}
            {doc.clientInfo.rc && (
              <div>
                <div style={{ fontSize: 9, color: IND.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>RC</div>
                <div style={{ color: IND.muted }}>{doc.clientInfo.rc}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Objet */}
      {doc.objet && (
        <div style={{ margin: '0 26px 10px', padding: '8px 12px', borderLeft: `3px solid ${IND.blue}`, background: IND.slateBody, fontSize: 11, color: IND.muted, lineHeight: 1.5 }}>
          <strong style={{ display: 'block', fontSize: 9, color: IND.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Objet</strong>
          {doc.objet}
        </div>
      )}

      {/* Items table */}
      {vb('table') && sf('itemsTable') && doc.items.length > 0 && (
        <div style={{ padding: '0 26px', ...zoneCursor }} {...zoneProps('items')}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ padding: '9px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: IND.white, background: IND.slateMid, borderLeft: `3px solid ${COL_BORDERS[0]}` }}>Désignation</th>
                <th style={{ padding: '9px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: IND.white, background: IND.slateMid, width: 44, borderLeft: `2px solid ${COL_BORDERS[1]}` }}>Qté</th>
                <th style={{ padding: '9px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: IND.white, background: IND.slateMid, width: 34, borderLeft: `2px solid ${COL_BORDERS[2]}` }}>U.</th>
                <th style={{ padding: '9px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: IND.white, background: IND.slateMid, width: 96, borderLeft: `2px solid ${COL_BORDERS[3]}` }}>P.U. HT</th>
                <th style={{ padding: '9px 8px', textAlign: 'right', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: IND.white, background: IND.slateMid, width: 108, borderLeft: `2px solid ${COL_BORDERS[4]}` }}>Montant HT</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? IND.white : IND.slateBody, borderBottom: `0.5px solid ${IND.rule}` }}>
                  <td style={{ padding: '9px 8px', color: IND.text, lineHeight: 1.4, verticalAlign: 'top', borderLeft: `3px solid ${COL_BORDERS[0]}` }}>
                    <div style={{ fontWeight: 500 }}>{item.designation}</div>
                    {item.description && <div style={{ fontSize: 9, color: IND.faint, marginTop: 1, fontStyle: 'italic' }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '9px 8px', textAlign: 'center', color: IND.muted, borderLeft: `2px solid ${COL_BORDERS[1]}` }}>{item.quantity}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'center', color: IND.faint, fontSize: 10, borderLeft: `2px solid ${COL_BORDERS[2]}` }}>{item.unit}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right', color: IND.muted, borderLeft: `2px solid ${COL_BORDERS[3]}` }}>{fmt(item.unitPrice)}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: 700, color: IND.blueDeep, borderLeft: `2px solid ${COL_BORDERS[4]}` }}>{fmt(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals — bordered grid cells */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 26px 0' }}>
        <table style={{ borderCollapse: 'collapse', width: 288, fontSize: 11, ...zoneCursor }} {...zoneProps('totals')}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, color: IND.muted }}>Sous-total HT</td>
              <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, textAlign: 'right', color: IND.text, fontWeight: 500 }}>{formatCurrency(results.subTotalHT, currency)}</td>
            </tr>
            {results.discountAmount > 0 && (
              <tr>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, color: '#ef4444' }}>Remise</td>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, textAlign: 'right', color: '#ef4444' }}>-{formatCurrency(results.discountAmount, currency)}</td>
              </tr>
            )}
            {results.tvaAmount > 0 && (
              <tr>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, color: IND.muted }}>TVA ({results.tvaRate}%)</td>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, textAlign: 'right', color: IND.text, fontWeight: 500 }}>{formatCurrency(results.tvaAmount, currency)}</td>
              </tr>
            )}
            {results.timbreFiscal > 0 && (
              <tr>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, color: IND.muted }}>Timbre fiscal</td>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, textAlign: 'right', color: IND.text, fontWeight: 500 }}>{formatCurrency(results.timbreFiscal, currency)}</td>
              </tr>
            )}
            {/* Last row — #1e40af background, white text */}
            <tr>
              <td style={{ padding: '9px 12px', border: `1px solid ${IND.blueNav}`, background: IND.blueNav, color: IND.white, fontWeight: 700, fontSize: 13 }}>Total TTC</td>
              <td style={{ padding: '9px 12px', border: `1px solid ${IND.blueNav}`, background: IND.blueNav, color: IND.white, fontWeight: 700, fontSize: 13, textAlign: 'right' }}>{formatCurrency(results.totalTTC, currency)}</td>
            </tr>
            {results.acompte > 0 && (
              <tr>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, color: '#ef4444' }}>Acompte versé</td>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, textAlign: 'right', color: '#ef4444' }}>-{formatCurrency(results.acompte, currency)}</td>
              </tr>
            )}
            {results.netAPayer !== results.totalTTC && (
              <tr>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, color: IND.blueDeep, fontWeight: 700 }}>Net à payer</td>
                <td style={{ padding: '6px 12px', border: `1px solid ${IND.rule}`, textAlign: 'right', color: IND.blueDeep, fontWeight: 700 }}>{formatCurrency(results.netAPayer, currency)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Amount in words */}
      {vb('tafqit') && results.totalInWords && (
        <div style={{ margin: '14px 26px 0', padding: '10px 14px', background: IND.slateBody, border: `1px solid ${IND.rule}`, fontSize: 10.5, color: IND.muted, lineHeight: 1.5 }}>
          <strong style={{ display: 'block', fontSize: 9, color: IND.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Arrêté à la somme de</strong>
          <em>{results.totalInWords}</em>
        </div>
      )}

      {/* Payment */}
      {vb('payment') && bv('paymentConditions', 'paymentIban') && (doc.paymentDetails?.terms || doc.paymentDetails?.iban) && (
        <div style={{ margin: '10px 26px 0', padding: '10px 14px', background: IND.slateBody, border: `1px solid ${IND.rule}`, fontSize: 10.5, color: IND.muted, lineHeight: 1.6, ...zoneCursor }} {...zoneProps('payment')}>
          <strong style={{ display: 'block', fontSize: 9, color: IND.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Paiement</strong>
          {doc.paymentDetails.terms && <div>{doc.paymentDetails.terms}</div>}
          {doc.paymentDetails.iban && <div style={{ fontSize: 10 }}>RIB : {doc.paymentDetails.iban}</div>}
          {doc.bankName && <div style={{ fontSize: 10 }}>{doc.bankName}{doc.bankAgency ? ` — ${doc.bankAgency}` : ''}</div>}
        </div>
      )}

      {/* Notes */}
      {doc.notes && (
        <div style={{ margin: '8px 26px 0', padding: '10px 14px', background: IND.slateBody, border: `1px solid ${IND.rule}`, fontSize: 10.5, color: IND.muted, lineHeight: 1.5 }}>
          <strong style={{ display: 'block', fontSize: 9, color: IND.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Notes</strong>
          {doc.notes}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Signatures */}
      {vb('signature') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '20px 26px 0', borderTop: `1px solid ${IND.rule}`, paddingTop: 18 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: IND.blue, marginBottom: 8 }}>Le Client</div>
            <div style={{ height: 60, border: `1px solid ${IND.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 9, marginBottom: 4 }}>Signature & cachet</div>
            <div style={{ fontSize: 10, color: IND.muted }}>Bon pour accord</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: IND.blue, marginBottom: 8 }}>Prestataire</div>
            <div style={{ height: 60, border: `1px solid ${IND.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 9, marginBottom: 4 }}>
              {doc.companyInfo?.signature
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={doc.companyInfo.signature} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="signature" />
                : 'Signature & cachet'}
            </div>
            <div style={{ fontSize: 10, color: IND.muted, fontWeight: 600 }}>{companyName}</div>
          </div>
        </div>
      )}

      {/* Footer — slate */}
      <div style={{ background: IND.slate, padding: '10px 26px', marginTop: 18 }}>
        <div style={{ fontSize: 9, color: IND.faint, textAlign: 'center', lineHeight: 1.9 }}>
          {companyAddr && <span>{companyAddr}</span>}
          {isEnt && doc.companyInfo?.taxIds?.nif && <><span style={{ margin: '0 8px' }}>·</span><span>NIF : {doc.companyInfo.taxIds.nif}</span></>}
          {isEnt && doc.companyInfo?.taxIds?.rc && <><span style={{ margin: '0 8px' }}>·</span><span>RC : {doc.companyInfo.taxIds.rc}</span></>}
          {doc.companyPhone && <><span style={{ margin: '0 8px' }}>·</span><span>Tél : {doc.companyPhone}</span></>}
          <br />
          <span style={{ color: '#475569' }}>Document généré par CloudDevis</span>
        </div>
      </div>
    </div>
  );
}
