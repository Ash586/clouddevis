'use client';
import React from 'react';
import type { DocumentState } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { formatCurrency } from '@/lib/calculations';

const HM = {
  green: '#0d4a3e',
  gold: '#c9a227',
  text: '#111827',
  muted: '#4b5563',
  faint: '#9ca3af',
  rule: '#e5e7eb',
};

const CORMORANT = "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)";
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
}

export function PreviewHaussmann({ doc, sf, bv, vb, tc, results }: Props) {
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
    <div id="print-area" className="w-[21cm] min-h-[29.7cm] flex flex-col shadow-md print:shadow-none" style={{ background: '#fff', fontFamily: SANS }}>

      {/* Company header — centered */}
      <div style={{ padding: '40px 44px 20px', textAlign: 'center' }}>
        {doc.companyInfo?.logo && (
          <div style={{ marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc.companyInfo.logo} style={{ maxHeight: 60, maxWidth: 180, objectFit: 'contain', margin: '0 auto' }} alt="logo" />
          </div>
        )}
        {companyName && (
          <div style={{ fontFamily: CORMORANT, fontSize: 46, fontStyle: 'italic', fontWeight: 700, color: HM.green, lineHeight: 1.05, letterSpacing: '-0.5px' }}>
            {companyName}
          </div>
        )}
        <div style={{ fontSize: 10, color: HM.muted, letterSpacing: '4px', textTransform: 'uppercase', marginTop: 6 }}>
          {doc.companyTagline || (isEnt ? 'SARL' : 'Artisan')}
        </div>
        {companyAddr && (
          <div style={{ fontSize: 10, color: HM.faint, marginTop: 5, lineHeight: 1.7 }}>{companyAddr}</div>
        )}
        {isEnt && doc.companyInfo && (
          <div style={{ fontSize: 9, color: HM.faint, marginTop: 3, letterSpacing: '0.03em' }}>
            {doc.companyInfo.taxIds.nif && <span>NIF {doc.companyInfo.taxIds.nif}</span>}
            {doc.companyInfo.taxIds.rc && <span style={{ marginLeft: 12 }}>RC {doc.companyInfo.taxIds.rc}</span>}
            {doc.companyInfo.taxIds.nis && <span style={{ marginLeft: 12 }}>NIS {doc.companyInfo.taxIds.nis}</span>}
          </div>
        )}
        {!isEnt && doc.artisanInfo?.phone && (
          <div style={{ fontSize: 9, color: HM.faint, marginTop: 2 }}>Tél : {doc.artisanInfo.phone}</div>
        )}
        {doc.companyPhone && (
          <div style={{ fontSize: 9, color: HM.faint, marginTop: 2 }}>Tél : {doc.companyPhone}</div>
        )}
      </div>

      {/* Central separator — two lines with DEVIS between two gold diamonds */}
      <div style={{ padding: '0 44px', marginBottom: 4 }}>
        <div style={{ height: 0.75, background: HM.green }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 7, height: 7, background: HM.gold, transform: 'rotate(45deg)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: HM.green, letterSpacing: '6px' }}>{docLabel}</span>
          <span style={{ display: 'inline-block', width: 7, height: 7, background: HM.gold, transform: 'rotate(45deg)', flexShrink: 0 }} />
        </div>
        <div style={{ height: 0.75, background: HM.green }} />
      </div>

      {/* Two-column: reference (left) + client (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '18px 44px 10px' }}>
        {/* Left: reference */}
        <div style={{ borderRight: `0.5px solid ${HM.rule}`, paddingRight: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: HM.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 10 }}>Référence</div>
          {sf('docNumber') && doc.documentNumber && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 9, color: HM.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>Numéro</div>
              <div style={{ fontFamily: CORMORANT, fontSize: 16, color: HM.green, fontWeight: 600 }}>{doc.documentNumber}</div>
            </div>
          )}
          {sf('issueDate') && doc.date && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 9, color: HM.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>Date</div>
              <div style={{ fontSize: 12, color: HM.text }}>{doc.date}</div>
            </div>
          )}
          {sf('validUntil') && doc.validUntil && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 9, color: HM.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>Valable jusqu&apos;au</div>
              <div style={{ fontSize: 12, color: HM.text }}>{doc.validUntil}</div>
            </div>
          )}
          {sf('orderRef') && doc.bcRef && (
            <div>
              <div style={{ fontSize: 9, color: HM.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>Réf. BC</div>
              <div style={{ fontSize: 12, color: HM.text }}>{doc.bcRef}</div>
            </div>
          )}
        </div>

        {/* Right: client in Cormorant Garamond */}
        {vb('client') && doc.clientInfo.name && (
          <div style={{ paddingLeft: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: HM.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 10 }}>Adressé à</div>
            <div style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 700, color: HM.green, lineHeight: 1.1, marginBottom: 6 }}>{doc.clientInfo.name}</div>
            {doc.clientInfo.address && (
              <div style={{ fontSize: 11, color: HM.muted, lineHeight: 1.6 }}>{doc.clientInfo.address}</div>
            )}
            {(doc.clientInfo.nif || doc.clientInfo.rc) && (
              <div style={{ fontSize: 10, color: HM.faint, marginTop: 4 }}>
                {doc.clientInfo.nif && <span>NIF {doc.clientInfo.nif}</span>}
                {doc.clientInfo.rc && <span style={{ marginLeft: 10 }}>RC {doc.clientInfo.rc}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Objet */}
      {doc.objet && (
        <div style={{ margin: '4px 44px 12px', padding: '8px 12px', borderLeft: `2px solid ${HM.gold}`, fontSize: 11, color: HM.muted, lineHeight: 1.5 }}>
          <strong style={{ fontSize: 9, color: HM.gold, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Objet</strong>
          {doc.objet}
        </div>
      )}

      {/* Items table — no vertical borders, thin horizontal only, amounts in gold */}
      {vb('table') && sf('itemsTable') && doc.items.length > 0 && (
        <div style={{ padding: '0 44px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderTop: `0.5px solid ${HM.rule}`, borderBottom: `1px solid ${HM.green}` }}>
                <th style={{ padding: '8px 0', textAlign: 'left', fontSize: 9, fontWeight: 700, color: HM.green, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Désignation</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: HM.green, textTransform: 'uppercase', letterSpacing: '0.1em', width: 44 }}>Qté</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: HM.green, textTransform: 'uppercase', letterSpacing: '0.1em', width: 34 }}>U.</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: 9, fontWeight: 700, color: HM.green, textTransform: 'uppercase', letterSpacing: '0.1em', width: 96 }}>P.U. HT</th>
                <th style={{ padding: '8px 0', textAlign: 'right', fontSize: 9, fontWeight: 700, color: HM.gold, textTransform: 'uppercase', letterSpacing: '0.1em', width: 108 }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: `0.5px solid ${HM.rule}` }}>
                  <td style={{ padding: '9px 0', lineHeight: 1.4, verticalAlign: 'top' }}>
                    <div style={{ fontFamily: CORMORANT, fontSize: 13, fontStyle: 'italic', fontWeight: 600, color: HM.text }}>{item.designation}</div>
                    {item.description && <div style={{ fontFamily: SANS, fontStyle: 'normal', fontSize: 9, color: HM.faint, marginTop: 1 }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '9px 6px', textAlign: 'center', color: HM.muted, fontSize: 11 }}>{item.quantity}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'center', color: HM.faint, fontSize: 10 }}>{item.unit}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'right', color: HM.muted }}>{fmt(item.unitPrice)}</td>
                  <td style={{ padding: '9px 0', textAlign: 'right', fontWeight: 700, color: HM.gold }}>{fmt(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 44px 0' }}>
        <div style={{ width: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: HM.muted, borderBottom: `0.5px solid ${HM.rule}` }}>
            <span>Sous-total HT</span><span>{formatCurrency(results.subTotalHT, currency)}</span>
          </div>
          {results.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: '#ef4444', borderBottom: `0.5px solid ${HM.rule}` }}>
              <span>Remise</span><span>-{formatCurrency(results.discountAmount, currency)}</span>
            </div>
          )}
          {results.tvaAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: HM.muted, borderBottom: `0.5px solid ${HM.rule}` }}>
              <span>TVA ({results.tvaRate}%)</span><span>{formatCurrency(results.tvaAmount, currency)}</span>
            </div>
          )}
          {results.timbreFiscal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: HM.muted, borderBottom: `0.5px solid ${HM.rule}` }}>
              <span>Timbre fiscal</span><span>{formatCurrency(results.timbreFiscal, currency)}</span>
            </div>
          )}
          {/* Total in dark green rectangle, amount in gold */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: HM.green, marginTop: 6 }}>
            <span style={{ fontFamily: CORMORANT, fontSize: 15, fontStyle: 'italic', color: '#fff' }}>Total TTC</span>
            <span style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 700, color: HM.gold }}>{formatCurrency(results.totalTTC, currency)}</span>
          </div>
          {results.acompte > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11, color: '#ef4444', marginTop: 4 }}>
              <span>Acompte versé</span><span>-{formatCurrency(results.acompte, currency)}</span>
            </div>
          )}
          {results.netAPayer !== results.totalTTC && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, fontWeight: 700, color: HM.green }}>
              <span>Net à payer</span><span>{formatCurrency(results.netAPayer, currency)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Arrêté — italic centered */}
      {vb('tafqit') && results.totalInWords && (
        <div style={{ margin: '18px 44px 0', textAlign: 'center', padding: '11px 0', borderTop: `0.5px solid ${HM.rule}`, borderBottom: `0.5px solid ${HM.rule}` }}>
          <em style={{ fontFamily: CORMORANT, fontSize: 13, fontStyle: 'italic', color: HM.green }}>
            Arrêté à la somme de {results.totalInWords}
          </em>
        </div>
      )}

      {/* Payment */}
      {vb('payment') && bv('paymentConditions', 'paymentIban') && (doc.paymentDetails?.terms || doc.paymentDetails?.iban) && (
        <div style={{ margin: '12px 44px 0', padding: '10px 0', fontSize: 10.5, color: HM.muted, lineHeight: 1.6, borderTop: `0.5px solid ${HM.rule}` }}>
          <strong style={{ display: 'block', fontSize: 9, color: HM.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Paiement</strong>
          {doc.paymentDetails.terms && <div>{doc.paymentDetails.terms}</div>}
          {doc.paymentDetails.iban && <div style={{ fontSize: 10 }}>RIB : {doc.paymentDetails.iban}</div>}
          {doc.bankName && <div style={{ fontSize: 10 }}>{doc.bankName}{doc.bankAgency ? ` — ${doc.bankAgency}` : ''}</div>}
        </div>
      )}

      {/* Notes */}
      {doc.notes && (
        <div style={{ margin: '10px 44px 0', padding: '10px 0', fontSize: 10.5, color: HM.muted, lineHeight: 1.5, borderTop: `0.5px solid ${HM.rule}` }}>
          <strong style={{ display: 'block', fontSize: 9, color: HM.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Notes</strong>
          {doc.notes}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Two signature blocks */}
      {vb('signature') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '24px 44px 0', borderTop: `0.75px solid ${HM.rule}`, paddingTop: 22 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: HM.green, marginBottom: 8 }}>Le Client</div>
            <div style={{ height: 64, borderBottom: `0.75px solid ${HM.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 9, marginBottom: 6 }}>Signature & cachet</div>
            <div style={{ fontFamily: CORMORANT, fontStyle: 'italic', fontSize: 12, color: HM.muted }}>Bon pour accord</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: HM.green, marginBottom: 8 }}>Le Prestataire</div>
            <div style={{ height: 64, borderBottom: `0.75px solid ${HM.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 9, marginBottom: 6 }}>
              {doc.companyInfo?.signature
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={doc.companyInfo.signature} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="signature" />
                : 'Signature & cachet'}
            </div>
            <div style={{ fontFamily: CORMORANT, fontStyle: 'italic', fontSize: 12, color: HM.muted, fontWeight: 600 }}>{companyName}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '16px 44px 20px', textAlign: 'center', fontSize: 9, color: HM.faint, lineHeight: 2, marginTop: 8 }}>
        {companyAddr && <span>{companyAddr}</span>}
        {doc.companyPhone && <span style={{ marginLeft: 10 }}>· Tél : {doc.companyPhone}</span>}
        {isEnt && doc.companyInfo?.taxIds?.nif && <span style={{ marginLeft: 10 }}>· NIF : {doc.companyInfo.taxIds.nif}</span>}
        {isEnt && doc.companyInfo?.taxIds?.rc && <span style={{ marginLeft: 10 }}>· RC : {doc.companyInfo.taxIds.rc}</span>}
        <br />
        <span style={{ color: '#d1d5db' }}>Document généré par CloudDevis</span>
      </div>
    </div>
  );
}
