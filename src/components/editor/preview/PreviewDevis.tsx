'use client';
import React from 'react';
import type { DocumentState, BlockId } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { formatCurrency } from '@/lib/calculations';

const A = {
  green: '#0B3D2E',
  greenLight: '#F1F7F3',
  gold: '#C4A35A',
  goldLight: '#F2EFE8',
  dark: '#161616',
  paperBg: '#F9F8F5',
  beige: '#E0DAD0',
  border: '#ECE7DD',
  cream: '#FFFBF3',
  white: '#fff',
};

interface DevProps {
  doc: DocumentState;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  t: (key: string) => string;
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

export function PreviewDevis({ doc, sf, bv, vb, t, tu, results, design, highlight }: DevProps) {
  const isEnt = doc.mode === 'entreprise';
  const companyName = isEnt && doc.companyInfo ? doc.companyInfo.name : '';
  const companyAddr = isEnt && doc.companyInfo ? doc.companyInfo.address : '';
  const currency = t('currency') || 'DA';
  const numFmt = (n: number) => n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const today = new Date();
  const formattedDate = doc.date || today.toLocaleDateString('fr-DZ');

  let rowIdx = 0;

  return (
    <div
      id="print-area"
      className="w-[21cm] min-h-[29.7cm] flex flex-col shadow-md print:shadow-none relative"
      style={{ background: '#fff' }}
    >
      {/* Top accent bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${A.green} 0%, ${A.gold} 100%)` }} />

      {/* === HEADER === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, padding: '32px 44px 22px', borderBottom: `2px solid ${A.dark}` }}>
        {/* Left: Company info */}
        <div>
          {isEnt && companyName && (
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, fontWeight: 700, color: A.green, letterSpacing: '0.01em', marginBottom: 5 }}>
              {companyName}
            </div>
          )}
          {doc.companyTagline && (
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.55, marginBottom: 4 }}>{doc.companyTagline}</div>
          )}
          {doc.companyCapital && (
            <div style={{ fontSize: 11, color: '#777', fontStyle: 'italic', marginBottom: 12 }}>Au Capital Social de {doc.companyCapital}</div>
          )}
          {isEnt && doc.companyInfo && (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 12px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#444' }}>
              {doc.companyInfo.taxIds.rc && (
                <>
                  <span style={{ fontWeight: 600, color: A.green, fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>R.C.</span>
                  <span>{doc.companyInfo.taxIds.rc}</span>
                </>
              )}
              {doc.companyInfo.taxIds.nis && (
                <>
                  <span style={{ fontWeight: 600, color: A.green, fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>N.I.S.</span>
                  <span>{doc.companyInfo.taxIds.nis}</span>
                </>
              )}
              {doc.companyInfo.taxIds.nif && (
                <>
                  <span style={{ fontWeight: 600, color: A.green, fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>N.I.F.</span>
                  <span>{doc.companyInfo.taxIds.nif}</span>
                </>
              )}
              {doc.companyInfo.taxIds.ai && (
                <>
                  <span style={{ fontWeight: 600, color: A.green, fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>N° Article</span>
                  <span>{doc.companyInfo.taxIds.ai}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Seal zone */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 130 }}>
          {isEnt && companyName && (
            <div style={{ width: 96, height: 96, border: `2.5px solid ${A.gold}`, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#8A6D2E', transform: 'rotate(-8deg)' }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>EURL</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: A.green, margin: '3px 0' }}>{companyName.split(' ').slice(0, 2).join(' ')}</span>
              <span style={{ fontSize: 9, color: '#999' }}>{companyAddr ? companyAddr.split('—').pop()?.trim().split(',')[0] || '' : ''}</span>
            </div>
          )}
          <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#555', lineHeight: 1.6 }}>
            <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, marginBottom: 2 }}>Lieu &amp; Date</span>
            {doc.docCity || companyAddr ? `${doc.docCity || companyAddr?.split('—')[0]?.trim() || ''}, le ${formattedDate}` : formattedDate}
          </div>
        </div>
      </div>

      {/* === TITLE ROW === */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 44px 16px' }}>
        <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 27, fontWeight: 700, color: A.dark, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Devis <span style={{ color: A.green }}>N° {doc.documentNumber}</span>
        </div>
        <div style={{ background: A.goldLight, border: `1px solid ${A.beige}`, borderRadius: 999, padding: '6px 16px', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#555' }}>
          <strong style={{ color: A.green, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 10, textTransform: 'uppercase', marginRight: 6 }}>Date</strong>
          {formattedDate}
        </div>
      </div>

      {/* === CLIENT + OBJET === */}
      <div style={{ padding: '0 44px 16px' }}>
        {doc.clientInfo.name && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 14.7, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: A.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Client</span>
            <span style={{ fontWeight: 700, color: A.dark, borderBottom: `1.5px solid ${A.gold}`, paddingBottom: 2 }}>{doc.clientInfo.name}</span>
          </div>
        )}
        {(doc.objet || doc.notes) && (
          <div style={{ background: '#F7F5F0', borderLeft: `3px solid ${A.green}`, borderRadius: '0 6px 6px 0', padding: '12px 16px', fontSize: 13, color: '#333', lineHeight: 1.55 }}>
            <strong style={{ color: A.green, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em', display: 'block', marginBottom: 3 }}>Objet</strong>
            {doc.objet || doc.notes}
          </div>
        )}
      </div>

      {/* === TABLE === */}
      {doc.items.length > 0 && (
        <div style={{ padding: '18px 44px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: A.green, color: '#F5F1E8' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', width: 36 }}>N°</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Désignation</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', width: 50 }}>Qté</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', width: 110 }}>P.U HT</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', width: 115 }}>Montant HT</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map(item => {
                rowIdx++;
                const isEven = rowIdx % 2 === 0;
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${A.border}`, background: isEven ? '#FAFAF8' : 'transparent' }}>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#999', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>{String(rowIdx).padStart(2, '0')}</td>
                    <td style={{ padding: '12px', color: A.dark, lineHeight: 1.45, fontWeight: 500 }}>{item.designation}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{numFmt(item.unitPrice)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{numFmt(item.quantity * item.unitPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* === BOTTOM: RIB + TOTALS === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: 0, marginTop: 6, padding: '20px 44px 22px', alignItems: 'start' }}>
        {/* RIB Card */}
        {doc.paymentDetails.iban && (
          <div style={{ fontSize: 11.5, color: '#555', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.75, border: `1px dashed ${A.beige}`, borderRadius: 5, padding: '12px 16px' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, display: 'block', marginBottom: 6 }}>Coordonnées bancaires</span>
            {doc.paymentDetails.iban && <span>RIB N° {doc.paymentDetails.iban}</span>}
            {doc.bankName && <><br />{doc.bankName}</>}
            {doc.bankAgency && <> — {doc.bankAgency}</>}
            {doc.ccpNumber && <><br />C.C.P. N° {doc.ccpNumber}</>}
          </div>
        )}

        {/* Totals */}
        <div style={{ paddingLeft: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: `1px solid ${A.border}`, fontSize: 13.5 }}>
            <span style={{ color: '#555' }}>MT HT</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: A.dark }}>{formatCurrency(results.subTotalHT, currency)}</span>
          </div>
          {results.tvaAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: `1px solid ${A.border}`, fontSize: 13.5, color: '#444' }}>
              <span>TVA ({results.tvaRate}%)</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{formatCurrency(results.tvaAmount, currency)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0 7px', borderBottom: 'none', borderTop: `2.5px solid ${A.dark}`, marginTop: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14.7, color: A.dark, textTransform: 'uppercase', letterSpacing: '0.03em' }}>MT TTC</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 19, fontWeight: 700, color: A.green }}>{formatCurrency(results.totalTTC, currency)}</span>
          </div>
        </div>
      </div>

      {/* === MONTANT EN LETTRES === */}
      {results.totalInWords && (
        <div style={{ padding: '0 44px 22px' }}>
          <div style={{ border: `1px solid ${A.beige}`, borderRadius: 5, background: A.cream, padding: '13px 18px', fontSize: 13, lineHeight: 1.6, color: '#333' }}>
            <strong style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, marginBottom: 5 }}>Le présent devis est arrêté à la somme de</strong>
            <em style={{ fontStyle: 'italic' }}>{results.totalInWords}</em>
          </div>
        </div>
      )}

      {/* === SIGNATURES === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '24px 44px 32px', borderTop: `1px solid ${A.border}` }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, marginBottom: 8 }}>Le Client</div>
          <div style={{ height: 76, borderBottom: `1.5px solid #C8C2B5`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DDD', fontSize: 11, fontStyle: 'italic', marginBottom: 8 }}>Signature &amp; cachet</div>
          <div style={{ fontSize: 12.5, color: '#333', fontWeight: 600 }}>Bon pour accord</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, marginBottom: 8 }}>Cachet &amp; Signature</div>
          {isEnt && companyName && (
            <div style={{ width: 88, height: 88, border: `2px solid ${A.green}`, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: A.green, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.45 }}>
              <span>EURL</span>
              <span style={{ fontSize: 12 }}>{companyName.split(' ').slice(0, 2).join(' ')}</span>
              <span style={{ fontSize: 9, color: '#999' }}>Gérant</span>
            </div>
          )}
          <div style={{ fontSize: 12.5, color: '#333', fontWeight: 600 }}>{companyName || 'Gérant'}</div>
        </div>
      </div>

      {/* === FOOTER === */}
      <div style={{ background: '#F7F5F0', borderTop: `1px solid ${A.border}`, padding: '13px 44px', fontSize: 10.5, color: '#999', textAlign: 'center', lineHeight: 1.85, fontFamily: "'JetBrains Mono', monospace" }}>
        {companyAddr && <><strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>Siège Social :</strong> {companyAddr}</>}
        {doc.companyPhone && <><span style={{ margin: '0 6px' }}>·</span><strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>Tél/Fax :</strong> {doc.companyPhone}</>}
        <br />
        {isEnt && doc.companyInfo?.taxIds?.nif && <><strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>N.I.F. :</strong> {doc.companyInfo.taxIds.nif}</>}
        {isEnt && doc.companyInfo?.taxIds?.rc && <><span style={{ margin: '0 6px' }}>·</span><strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>R.C. :</strong> {doc.companyInfo.taxIds.rc}</>}
        <br />
        Document généré par <strong style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>CloudDevis</strong>
      </div>
    </div>
  );
}
