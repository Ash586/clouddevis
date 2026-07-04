'use client';
import React from 'react';
import type { DocumentState } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { formatCurrency } from '@/lib/calculations';

const VR = {
  bordeaux: '#3d0d1c',
  gold: '#c9a227',
  goldBorder: '#e8d5b7',
  cream: '#fdfaf5',
  text: '#1a0810',
  muted: '#7c4d5a',
  faint: '#b08090',
  rule: '#e8d5b7',
  roseLight: '#f9e8ee',
};

const PLAYFAIR = "var(--font-playfair, 'Playfair Display', Georgia, 'Times New Roman', serif)";
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

export function PreviewVelours({ doc, sf, bv, vb, tc, results, onZoneClick }: Props) {
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
    <div id="print-area" className="w-[21cm] min-h-[29.7cm] flex flex-col shadow-md print:shadow-none" style={{ background: VR.cream, fontFamily: SANS }}>

      {/* Gold 3px stripe — very top */}
      <div style={{ height: 3, background: VR.gold, flexShrink: 0 }} />

      {/* Bordeaux header */}
      <div style={{ background: VR.bordeaux, padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Company — Playfair Display 34px white, left */}
        <div style={{ flex: 1, marginRight: 24 }}>
          {doc.companyInfo?.logo && (
            <div style={{ marginBottom: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={doc.companyInfo.logo} style={{ maxHeight: 44, maxWidth: 140, objectFit: 'contain' }} alt="logo" />
            </div>
          )}
          {companyName && (
            <div style={{ fontFamily: PLAYFAIR, fontSize: 34, fontWeight: 700, color: '#f0e0c8', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              {companyName}
            </div>
          )}
          <div style={{ width: 36, height: 1, background: VR.gold, margin: '10px 0 8px' }} />
          <div style={{ fontSize: 10, color: '#c9a090', lineHeight: 1.9 }}>
            {companyAddr && <span>{companyAddr}</span>}
            {doc.companyPhone && <><br /><span>Tél : {doc.companyPhone}</span></>}
            {!doc.companyPhone && !isEnt && doc.artisanInfo?.phone && <><br /><span>Tél : {doc.artisanInfo.phone}</span></>}
            {isEnt && doc.companyInfo?.taxIds?.nif && (
              <><br /><span>NIF : {doc.companyInfo.taxIds.nif}</span></>
            )}
            {isEnt && doc.companyInfo?.taxIds?.rc && (
              <><span style={{ margin: '0 6px' }}>·</span><span>RC : {doc.companyInfo.taxIds.rc}</span></>
            )}
          </div>
        </div>

        {/* Right: badge (border 1px gold) + number/date below in pale rose */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          {/* Badge with 1px gold border */}
          <div style={{ display: 'inline-block', border: `1px solid ${VR.gold}`, padding: '6px 16px', textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontFamily: PLAYFAIR, fontSize: 22, fontWeight: 700, color: '#f0e0c8', letterSpacing: '2px' }}>{docLabel}</div>
          </div>
          {/* Number and date BELOW badge, in pale rose */}
          <div style={{ fontSize: 10, color: VR.roseLight, lineHeight: 1.8 }}>
            {sf('docNumber') && doc.documentNumber && <div>N° {doc.documentNumber}</div>}
            {sf('issueDate') && doc.date && <div>{doc.date}</div>}
            {sf('validUntil') && doc.validUntil && <div style={{ fontSize: 9, color: '#c9a090' }}>Valable : {doc.validUntil}</div>}
          </div>
        </div>
      </div>

      {/* Gold 2px separator under header */}
      <div style={{ height: 2, background: VR.gold }} />

      {/* Body — cream */}
      <div style={{ flex: 1, padding: '20px 40px' }}>

        {/* Client — white box with #e8d5b7 border */}
        {vb('client') && bv('clientName', 'clientAddress') && doc.clientInfo.name && (
          <div style={{ background: '#fff', border: `1px solid ${VR.goldBorder}`, padding: '14px 18px', marginBottom: 20, ...zoneCursor }} {...zoneProps('client')}>
            <div style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: VR.gold, fontWeight: 700, marginBottom: 5 }}>Adressé à</div>
            <div style={{ fontFamily: PLAYFAIR, fontSize: 16, fontWeight: 700, color: VR.bordeaux }}>{doc.clientInfo.name}</div>
            {doc.clientInfo.address && (
              <div style={{ fontSize: 11, color: VR.muted, marginTop: 3 }}>{doc.clientInfo.address}</div>
            )}
            <div style={{ fontSize: 10, color: VR.faint, marginTop: 2 }}>
              {doc.clientInfo.nif && <span>NIF : {doc.clientInfo.nif}</span>}
              {doc.clientInfo.rc && <span style={{ marginLeft: 10 }}>RC : {doc.clientInfo.rc}</span>}
            </div>
          </div>
        )}

        {/* Objet */}
        {doc.objet && (
          <div style={{ padding: '8px 14px', borderLeft: `2px solid ${VR.gold}`, marginBottom: 16, fontSize: 11, color: VR.muted, lineHeight: 1.5 }}>
            <strong style={{ display: 'block', fontSize: 9, color: VR.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Objet</strong>
            {doc.objet}
          </div>
        )}

        {/* Items table — bordeaux column titles, alternating white/cream rows */}
        {vb('table') && sf('itemsTable') && doc.items.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 18, ...zoneCursor }} {...zoneProps('items')}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${VR.bordeaux}` }}>
                <th style={{ padding: '7px 0', textAlign: 'left', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: VR.bordeaux, fontWeight: 700 }}>Désignation</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: VR.bordeaux, fontWeight: 700, width: 44 }}>Qté</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: VR.bordeaux, fontWeight: 700, width: 34 }}>U.</th>
                <th style={{ padding: '7px 6px', textAlign: 'right', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: VR.bordeaux, fontWeight: 700, width: 100 }}>P.U.</th>
                <th style={{ padding: '7px 0', textAlign: 'right', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: VR.bordeaux, fontWeight: 700, width: 108 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: `0.5px solid ${VR.goldBorder}`, background: idx % 2 === 1 ? VR.cream : '#fff' }}>
                  <td style={{ padding: '10px 0', fontFamily: PLAYFAIR, fontStyle: 'italic', color: VR.text, lineHeight: 1.4, verticalAlign: 'top' }}>
                    <div>{item.designation}</div>
                    {item.description && <div style={{ fontFamily: SANS, fontStyle: 'normal', fontSize: 9, color: VR.muted, marginTop: 1 }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'center', color: VR.muted, fontFamily: SANS }}>{item.quantity}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'center', color: VR.muted, fontFamily: SANS, fontSize: 10 }}>{item.unit}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', color: VR.muted, fontFamily: SANS }}>{fmt(item.unitPrice)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: VR.bordeaux, fontFamily: SANS }}>{fmt(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 272, ...zoneCursor }} {...zoneProps('totals')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: VR.muted, borderBottom: `0.5px solid ${VR.rule}` }}>
              <span>Sous-total HT</span><span>{formatCurrency(results.subTotalHT, currency)}</span>
            </div>
            {results.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: '#ef4444', borderBottom: `0.5px solid ${VR.rule}` }}>
                <span>Remise</span><span>-{formatCurrency(results.discountAmount, currency)}</span>
              </div>
            )}
            {results.tvaAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: VR.muted, borderBottom: `0.5px solid ${VR.rule}` }}>
                <span>TVA ({results.tvaRate}%)</span><span>{formatCurrency(results.tvaAmount, currency)}</span>
              </div>
            )}
            {results.timbreFiscal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: VR.muted, borderBottom: `0.5px solid ${VR.rule}` }}>
                <span>Timbre fiscal</span><span>{formatCurrency(results.timbreFiscal, currency)}</span>
              </div>
            )}
            {/* Total TTC — cadre doré (gold frame) with Playfair Display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', border: `2px solid ${VR.gold}`, background: '#fff', marginTop: 6 }}>
              <span style={{ fontFamily: PLAYFAIR, fontSize: 14, fontWeight: 700, fontStyle: 'italic', color: VR.bordeaux }}>Total TTC</span>
              <span style={{ fontFamily: PLAYFAIR, fontSize: 16, fontWeight: 700, color: VR.gold }}>{formatCurrency(results.totalTTC, currency)}</span>
            </div>
            {results.acompte > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                <span>Acompte versé</span><span>-{formatCurrency(results.acompte, currency)}</span>
              </div>
            )}
            {results.netAPayer !== results.totalTTC && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, fontWeight: 700, color: VR.bordeaux }}>
                <span>Net à payer</span><span style={{ fontFamily: PLAYFAIR }}>{formatCurrency(results.netAPayer, currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Amount in words */}
        {vb('tafqit') && results.totalInWords && (
          <div style={{ marginTop: 14, padding: '10px 14px', border: `1px solid ${VR.goldBorder}`, background: '#fff', lineHeight: 1.6 }}>
            <strong style={{ display: 'block', fontSize: 9, color: VR.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Arrêté à la somme de</strong>
            <em style={{ fontFamily: PLAYFAIR, fontSize: 11, color: VR.muted }}>{results.totalInWords}</em>
          </div>
        )}

        {/* Payment */}
        {vb('payment') && bv('paymentConditions', 'paymentIban') && (doc.paymentDetails?.terms || doc.paymentDetails?.iban) && (
          <div style={{ marginTop: 12, padding: '10px 14px', border: `0.5px solid ${VR.goldBorder}`, fontSize: 10.5, color: VR.muted, lineHeight: 1.6, ...zoneCursor }} {...zoneProps('payment')}>
            <strong style={{ display: 'block', fontSize: 9, color: VR.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Paiement</strong>
            {doc.paymentDetails.terms && <div>{doc.paymentDetails.terms}</div>}
            {doc.paymentDetails.iban && <div style={{ fontSize: 10 }}>RIB : {doc.paymentDetails.iban}</div>}
            {doc.bankName && <div style={{ fontSize: 10 }}>{doc.bankName}{doc.bankAgency ? ` — ${doc.bankAgency}` : ''}</div>}
          </div>
        )}

        {/* Notes */}
        {doc.notes && (
          <div style={{ marginTop: 10, padding: '10px 14px', border: `0.5px solid ${VR.goldBorder}`, fontSize: 10.5, color: VR.muted, lineHeight: 1.5 }}>
            <strong style={{ display: 'block', fontSize: 9, color: VR.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Notes</strong>
            {doc.notes}
          </div>
        )}

        {/* Signatures */}
        {vb('signature') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 22, borderTop: `1px solid ${VR.goldBorder}`, paddingTop: 18 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: VR.bordeaux, marginBottom: 8 }}>Le Client</div>
              <div style={{ height: 60, border: `1px solid ${VR.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 9, marginBottom: 4 }}>Signature & cachet</div>
              <div style={{ fontSize: 10, fontFamily: PLAYFAIR, color: VR.muted }}>Bon pour accord</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: VR.bordeaux, marginBottom: 8 }}>Prestataire</div>
              <div style={{ height: 60, border: `1px solid ${VR.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 9, marginBottom: 4 }}>
                {doc.companyInfo?.signature
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={doc.companyInfo.signature} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="signature" />
                  : 'Signature & cachet'}
              </div>
              <div style={{ fontSize: 10, fontFamily: PLAYFAIR, color: VR.muted, fontWeight: 700 }}>{companyName}</div>
            </div>
          </div>
        )}
      </div>

      {/* Bordeaux footer */}
      <div style={{ background: VR.bordeaux, padding: '10px 40px', marginTop: 'auto' }}>
        <div style={{ fontSize: 9, color: '#c9a090', textAlign: 'center', lineHeight: 1.9 }}>
          {companyAddr && <span>{companyAddr}</span>}
          {isEnt && doc.companyInfo?.taxIds?.nif && <><span style={{ margin: '0 8px' }}>·</span><span>NIF : {doc.companyInfo.taxIds.nif}</span></>}
          {isEnt && doc.companyInfo?.taxIds?.rc && <><span style={{ margin: '0 8px' }}>·</span><span>RC : {doc.companyInfo.taxIds.rc}</span></>}
          {doc.companyPhone && <><span style={{ margin: '0 8px' }}>·</span><span>Tél : {doc.companyPhone}</span></>}
          <br />
          <span style={{ color: '#8b4857' }}>Document généré par CloudDevis</span>
        </div>
      </div>
    </div>
  );
}
