'use client';
import React from 'react';
import type { DocumentState } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { formatCurrency } from '@/lib/calculations';

const A = {
  green: '#0B3D2E',
  greenLight: '#F1F7F3',
  gold: '#C4A35A',
  goldLight: '#F2EFE8',
  dark: '#161616',
  border: '#E4E0D8',
  cream: '#FFFBF3',
};

const PX = 36;

const TaxRow = ({ label, value }: { label: string; value: string }) =>
  value ? (
    <><span style={{ fontWeight: 600, color: A.green, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>{label}</span><span>{value}</span></>
  ) : null;

interface DevProps {
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
    totalTTC: number;
    netAPayer: number;
    totalInWords: string;
  };
  design: DocTypeDesign;
  highlight?: string | null;
}

export function PreviewDevis({ doc, sf, bv, vb, t, tc, tu, results, design, highlight }: DevProps) {
  const isEnt = doc.mode === 'entreprise';
  const companyName = isEnt && doc.companyInfo ? doc.companyInfo.name : '';
  const companyAddr = isEnt && doc.companyInfo ? doc.companyInfo.address : '';
  const currency = tc('currency') || 'DA';
  const numFmt = (n: number) => n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedDate = doc.date || new Date().toLocaleDateString('fr-DZ');
  let rowIdx = 0;

  return (
    <div id="print-area" className="w-[21cm] min-h-[29.7cm] flex flex-col shadow-md print:shadow-none relative" style={{ background: '#fff' }}>
      {/* Accent bar */}
      <div style={{ height: 3, background: A.green }} />

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, padding: `${PX - 4}px ${PX}px ${PX - 14}px`, borderBottom: `1px solid ${A.border}` }}>
        <div>
          {isEnt && companyName && (
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: A.dark, letterSpacing: '-0.01em', marginBottom: 2 }}>
              {companyName}
            </div>
          )}
          {doc.companyTagline && (
            <div style={{ fontSize: 11.5, color: '#666', lineHeight: 1.5, marginBottom: 2 }}>{doc.companyTagline}</div>
          )}
          {doc.companyCapital && (
            <div style={{ fontSize: 10.5, color: '#777', marginBottom: 8 }}>Au Capital Social de {doc.companyCapital}</div>
          )}
          {isEnt && doc.companyInfo && (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 10px', fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: '#555' }}>
              <TaxRow label="R.C." value={doc.companyInfo.taxIds.rc} />
              <TaxRow label="N.I.S." value={doc.companyInfo.taxIds.nis} />
              <TaxRow label="N.I.F." value={doc.companyInfo.taxIds.nif} />
              <TaxRow label="N° A.I." value={doc.companyInfo.taxIds.ai} />
            </div>
          )}
        </div>

        {/* Seal + lieu & date */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 130 }}>
          {isEnt && companyName && (
            <div style={{ width: 90, height: 90, border: `2px solid ${A.gold}`, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#8A6D2E' }}>
              <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>EURL</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: A.green, margin: '2px 0' }}>{companyName.split(' ').slice(0, 2).join(' ')}</span>
              <span style={{ fontSize: 8, color: '#999' }}>{companyAddr ? companyAddr.split('—').pop()?.trim().split(',')[0] || '' : ''}</span>
            </div>
          )}
          <div style={{ textAlign: 'center', fontSize: 10.5, color: '#555', lineHeight: 1.5 }}>
            <span style={{ display: 'block', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: A.green, marginBottom: 1 }}>Lieu & Date</span>
            {doc.docCity || companyAddr ? `${doc.docCity || companyAddr?.split('—')[0]?.trim() || ''}, le ${formattedDate}` : formattedDate}
          </div>
        </div>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${PX - 12}px ${PX}px ${PX - 18}px` }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: A.dark, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Devis <span style={{ color: A.green, fontWeight: 800 }}>N° {doc.documentNumber}</span>
        </div>
        <div style={{ color: '#666', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ fontWeight: 600, color: A.green, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>Date</span>
          {formattedDate}
        </div>
      </div>

      {/* Client + Objet */}
      <div style={{ padding: `0 ${PX}px ${PX - 20}px` }}>
        {doc.clientInfo.name && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14, marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: A.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Client</span>
            <span style={{ fontWeight: 600, color: A.dark }}>{doc.clientInfo.name}</span>
          </div>
        )}
        {(doc.objet || doc.notes) && (
          <div style={{ borderLeft: `3px solid ${A.green}`, padding: '10px 14px', fontSize: 12.5, color: '#444', lineHeight: 1.5, background: '#F8F7F4' }}>
            <strong style={{ color: A.green, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em', display: 'block', marginBottom: 2 }}>Objet</strong>
            {doc.objet || doc.notes}
          </div>
        )}
      </div>

      {/* Table */}
      {doc.items.length > 0 && (
        <div style={{ padding: `0 ${PX}px` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: A.green, color: '#F5F1E8' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', width: 32 }}>N°</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Désignation</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', width: 48 }}>Qté</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', width: 100 }}>P.U HT</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', width: 105 }}>Montant HT</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, idx) => {
                rowIdx++;
                const isLast = idx === doc.items.length - 1;
                return (
                  <tr key={item.id} style={{ borderBottom: isLast ? `1.5px solid ${A.dark}` : `0.5px solid ${A.border}` }}>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: '#AAA', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{String(rowIdx).padStart(2, '0')}</td>
                    <td style={{ padding: '9px 10px', color: A.dark, lineHeight: 1.4, verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 500 }}>{item.designation}</div>
                      {item.description && <div style={{ fontSize: 10, color: '#999', marginTop: 1, fontStyle: 'italic' }}>{item.description}</div>}
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{numFmt(item.unitPrice)}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{numFmt(item.quantity * item.unitPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* RIB + Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 0, marginTop: 4, padding: `${PX - 14}px ${PX}px ${PX - 14}px`, alignItems: 'start' }}>
        {doc.paymentDetails.iban && (
          <div style={{ fontSize: 11, color: '#555', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7, padding: '10px 0' }}>
            <span style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, display: 'block', marginBottom: 4 }}>Coordonnées bancaires</span>
            RIB N° {doc.paymentDetails.iban}
            {doc.bankName && <><br />{doc.bankName}</>}
            {doc.bankAgency && <> — {doc.bankAgency}</>}
            {doc.ccpNumber && <><br />C.C.P. N° {doc.ccpNumber}</>}
          </div>
        )}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: `0.5px solid ${A.border}`, fontSize: 12.5 }}>
            <span style={{ color: '#666' }}>MT HT</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: A.dark }}>{formatCurrency(results.subTotalHT, currency)}</span>
          </div>
          {results.tvaAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: `0.5px solid ${A.border}`, fontSize: 12.5, color: '#666' }}>
              <span>TVA ({results.tvaRate}%)</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{formatCurrency(results.tvaAmount, currency)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0 5px', borderTop: `2px solid ${A.dark}`, marginTop: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: A.dark, textTransform: 'uppercase' }}>MT TTC</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 700, color: A.green }}>{formatCurrency(results.totalTTC, currency)}</span>
          </div>
        </div>
      </div>

      {/* Montant en lettres */}
      {results.totalInWords && (
        <div style={{ padding: `0 ${PX}px ${PX - 14}px` }}>
          <div style={{ border: `0.5px solid ${A.border}`, padding: '11px 16px', fontSize: 12, lineHeight: 1.55, color: '#444', background: A.cream }}>
            <strong style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: A.green, marginBottom: 4 }}>Arrêté à la somme de</strong>
            <em style={{ fontStyle: 'italic' }}>{results.totalInWords}</em>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: `${PX - 12}px ${PX}px ${PX - 4}px`, borderTop: `1px solid ${A.border}` }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: A.green, marginBottom: 6 }}>Le Client</div>
          <div style={{ height: 60, borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCC', fontSize: 10, marginBottom: 6 }}>Signature & cachet</div>
          <div style={{ fontSize: 12, color: '#333', fontWeight: 600 }}>Bon pour accord</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: A.green, marginBottom: 6 }}>Cachet & Signature</div>
          {isEnt && companyName && (
            <div style={{ width: 80, height: 80, border: `1.5px solid ${A.green}`, borderRadius: '50%', margin: '0 auto 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: A.green, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.4 }}>
              <span>EURL</span>
              <span style={{ fontSize: 11 }}>{companyName.split(' ').slice(0, 2).join(' ')}</span>
              <span style={{ fontSize: 8, color: '#999' }}>Gérant</span>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#333', fontWeight: 600 }}>{companyName || 'Gérant'}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#F8F7F4', borderTop: `0.5px solid ${A.border}`, padding: '10px 36px', fontSize: 10, color: '#999', textAlign: 'center', lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
        {companyAddr && <><strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>Siège Social :</strong> {companyAddr}</>}
        {doc.companyPhone && <><span style={{ margin: '0 6px' }}>·</span><strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>Tél :</strong> {doc.companyPhone}</>}
        <br />
        {isEnt && doc.companyInfo?.taxIds?.nif && <><strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>N.I.F. :</strong> {doc.companyInfo.taxIds.nif}</>}
        {isEnt && doc.companyInfo?.taxIds?.rc && <><span style={{ margin: '0 6px' }}>·</span><strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>R.C. :</strong> {doc.companyInfo.taxIds.rc}</>}
        <br />Document généré par <strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>CloudDevis</strong>
      </div>
    </div>
  );
}
