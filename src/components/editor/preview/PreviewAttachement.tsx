'use client';
import React from 'react';
import type { DocumentState, BlockId } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';

const A = {
  navy: '#1A3A6B',
  navyLight: '#EEF3FB',
  navyMid: '#2E60B0',
  gold: '#C4A35A',
  green: '#0B3D2E',
  beige: '#C8C3BA',
  paperBg: '#F9F8F5',
  border: '#E4DED5',
  dark: '#1A1A1A',
};

interface AttProps {
  doc: DocumentState;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  t: (key: string) => string;
  tu: (key: string) => string;
  design: DocTypeDesign;
  highlight?: string | null;
}

const UNIT_LABELS: Record<string, string> = { u:'U', h:'H', j:'J', m2:'M²', m3:'M³', ml:'ML', kg:'KG', forfait:'Forfait' };
const CATEGORY_LABELS: Record<string, string> = {
  preparation:'Préparation', peinture:'Peinture', finition:'Finition',
  revetement:'Revêtement', facade:'Façade', enduit:'Enduit',
  main_oeuvre:'Main d\'Œuvre', materiaux:'Matériaux', transport:'Transport',
  divers:'Divers',
};

export function PreviewAttachement({ doc, sf, bv, vb, t, tu, design, highlight }: AttProps) {
  const isEnt = doc.mode === 'entreprise';
  const catOrder = ['preparation','peinture','finition','revetement','facade','enduit','main_oeuvre','materiaux','transport','divers'];

  const grouped: Record<string, typeof doc.items> = {};
  const uncategorized: typeof doc.items = [];
  for (const item of doc.items) {
    if (item.category) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    } else {
      uncategorized.push(item);
    }
  }

  let rowIdx = 0;

  return (
    <div
      id="print-area"
      className="w-[21cm] min-h-[29.7cm] flex flex-col justify-between shadow-md print:shadow-none relative"
      style={{ background: A.paperBg }}
    >
      {/* Top accent bar */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${A.navy} 0%, ${A.navyMid} 60%, ${A.gold} 100%)` }} />

      <div className="px-11 py-7 flex-1 flex flex-col" style={{ fontFamily: 'Inter, Helvetica, Arial, sans-serif', color: A.dark }}>

        {/* Company Frame */}
        {isEnt && doc.companyInfo && (
          <div style={{ border: '2px solid #1A1A1A', padding: '14px 20px', textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: '\'Times New Roman\', Georgia, serif', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.35, color: A.dark }}>
              {doc.companyInfo.name}
            </div>
            {doc.companyInfo.address && (
              <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>{doc.companyInfo.address}</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 11, color: '#666', fontFamily: '\'Courier New\', monospace', marginTop: 6, flexWrap: 'wrap' }}>
              {doc.companyInfo.taxIds.rc && (
                <span><b style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: A.navy }}>RC</b> {doc.companyInfo.taxIds.rc}</span>
              )}
              {doc.companyInfo.taxIds.nif && (
                <span><b style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: A.navy }}>N.I.F.</b> {doc.companyInfo.taxIds.nif}</span>
              )}
              {doc.companyInfo.taxIds.nis && (
                <span><b style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: A.navy }}>N.I.S.</b> {doc.companyInfo.taxIds.nis}</span>
              )}
            </div>
          </div>
        )}

        {/* Doc Title */}
        <div style={{ textAlign: 'center', padding: '14px 0 6px' }}>
          <h1 style={{ fontFamily: '\'Times New Roman\', Georgia, serif', fontSize: 18, fontWeight: 700, color: A.dark, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'underline', textUnderlineOffset: 5, textDecorationThickness: 2, display: 'inline-block', marginBottom: 8 }}>
            {t('docTypeAttachement') || 'Attachement des Travaux'}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, fontSize: 11, color: '#666', fontFamily: '\'Courier New\', monospace', marginBottom: 6 }}>
            {sf('docNumber') && (
              <><b style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: A.navy }}>Réf.</b> {doc.documentNumber}</>
            )}
            {sf('docNumber') && sf('issueDate') && (
              <span style={{ color: '#CCC' }}>·</span>
            )}
            {sf('issueDate') && (
              <><b style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: A.navy }}>Date</b> {doc.date}</>
            )}
            {doc.bcRef && (
              <>
                <span style={{ color: '#CCC' }}>·</span>
                <b style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: A.navy }}>BC lié</b> {doc.bcRef}
              </>
            )}
          </div>
          {doc.chantierAddress && (
            <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic', padding: '6px 20px', border: '0.5px solid #E4DED5', borderRadius: 4, background: A.paperBg, display: 'inline-block', marginBottom: 2 }}>
              Réalisé au niveau {doc.chantierAddress}
            </div>
          )}
        </div>

        {/* Items Table */}
        {doc.items.length > 0 && (
          <div style={{ borderBottom: '1px solid #E4DED5', marginTop: 10 }}>
            <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}>
              <thead>
                <tr style={{ background: A.navy }}>
                  <th className="text-center" style={{ width: 36, padding: '7px 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#EEF3FB', whiteSpace: 'nowrap' }}>N°</th>
                  <th className="text-left" style={{ padding: '7px 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#EEF3FB', whiteSpace: 'nowrap' }}>Désignation des ouvrages</th>
                  <th className="text-center" style={{ width: 52, padding: '7px 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#EEF3FB', whiteSpace: 'nowrap' }}>Unité</th>
                  <th className="text-center" style={{ width: 80, padding: '7px 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#EEF3FB', whiteSpace: 'nowrap' }}>Quantité</th>
                </tr>
              </thead>
              <tbody>
                {uncategorized.map(item => {
                  rowIdx++;
                  return (
                    <tr key={item.id} style={{ borderBottom: '0.5px solid #EDEAE4' }}>
                      <td className="text-center" style={{ padding: '7px 8px', fontFamily: '\'Courier New\', monospace', fontSize: 10, color: '#AAA', width: 36 }}>{String(rowIdx).padStart(2, '0')}</td>
                      <td style={{ padding: '7px 8px', fontWeight: 500, color: A.dark, fontSize: 12.5 }}>{item.designation}</td>
                      <td className="text-center" style={{ padding: '7px 8px', width: 52 }}>
                        <span style={{ display: 'inline-block', background: A.navyLight, color: A.navy, fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 3 }}>{UNIT_LABELS[item.unit] ?? item.unit}</span>
                      </td>
                      <td className="text-center" style={{ padding: '7px 8px', width: 80, fontFamily: '\'Courier New\', monospace', fontWeight: 500, color: A.dark }}>{item.quantity.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
                {catOrder.map(cat => {
                  const items = grouped[cat];
                  if (!items) return null;
                  const catLabel = CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
                  const rows: React.ReactNode[] = [
                    <tr key={'h-'+cat} style={{ background: A.navyLight }}>
                      <td colSpan={4} style={{ padding: '5px 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.navy }}>{catLabel}</td>
                    </tr>
                  ];
                  for (const item of items) {
                    rowIdx++;
                    rows.push(
                      <tr key={item.id} style={{ borderBottom: '0.5px solid #EDEAE4' }}>
                        <td className="text-center" style={{ padding: '7px 8px', fontFamily: '\'Courier New\', monospace', fontSize: 10, color: '#AAA', width: 36 }}>{String(rowIdx).padStart(2, '0')}</td>
                        <td style={{ padding: '7px 8px', fontWeight: 500, color: A.dark, fontSize: 12.5 }}>{item.designation}</td>
                        <td className="text-center" style={{ padding: '7px 8px', width: 52 }}>
                          <span style={{ display: 'inline-block', background: A.navyLight, color: A.navy, fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 3 }}>{UNIT_LABELS[item.unit] ?? item.unit}</span>
                        </td>
                        <td className="text-center" style={{ padding: '7px 8px', width: 80, fontFamily: '\'Courier New\', monospace', fontWeight: 500, color: A.dark }}>{item.quantity.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  }
                  return rows;
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Observations */}
        {sf('notes') && doc.notes && (
          <div style={{ padding: '12px 0', borderBottom: '1px solid #E4DED5' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888', marginBottom: 4 }}>Observations / Réserves</div>
            <div style={{ background: A.paperBg, border: '0.5px solid #E4DED5', borderLeft: `2px solid ${A.navy}`, borderRadius: '0 4px 4px 0', padding: '8px 12px', fontSize: 12, color: '#444', fontStyle: 'italic', lineHeight: 1.6 }}>{doc.notes}</div>
          </div>
        )}

        {/* Certification Band */}
        <div style={{ marginTop: 12, background: A.navyLight, border: '0.5px solid #B5D4F4', borderRadius: 4, padding: '8px 14px', fontSize: 12, color: A.navy, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>✓</span>
          <div style={{ lineHeight: 1.55 }}>
            <b>Attestation :</b> Le soussigné certifie que les travaux ci-dessus ont été réalisés et réceptionnés conformément aux quantités indiquées.
            {doc.chantierAddress && <span> au niveau {doc.chantierAddress}.</span>}
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 44px 0', gap: 0 }}>
          {/* Left: Client/ Maître d'ouvrage */}
          {doc.clientInfo.name && (
            <div style={{ borderRight: '0.5px dashed #C8C2B5', paddingRight: 28, paddingBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.navy, marginBottom: 2 }}>Le maître d'ouvrage</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{doc.clientInfo.name}</div>
              <div style={{ height: 50, borderBottom: '0.5px solid #C8C2B5', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCC', fontSize: 11, fontStyle: 'italic' }}>Signature &amp; cachet</div>
              <div style={{ width: 54, height: 54, borderRadius: '50%', border: '1.5px solid #C8C2B5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600, textTransform: 'uppercase', textAlign: 'center', color: '#666', margin: '0 auto', lineHeight: 1.3 }}>Cachet<br />Client</div>
            </div>
          )}

          {/* Right: Company / Enterprise */}
          {isEnt && doc.companyInfo && (
            <div style={{ paddingLeft: 28, paddingBottom: 14, textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, marginBottom: 2 }}>L'Entreprise</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{doc.companyInfo.name}</div>
              <div style={{ height: 50, borderBottom: '0.5px solid #C8C2B5', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCC', fontSize: 11, fontStyle: 'italic' }}>Signature &amp; cachet</div>
              <div style={{ width: 54, height: 54, borderRadius: '50%', border: '1.5px solid #C8C2B5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600, textTransform: 'uppercase', textAlign: 'center', color: '#666', margin: '0 0 0 auto', lineHeight: 1.3 }}>Cachet<br />Entr.</div>
            </div>
          )}
        </div>

        {/* Third signature: Direction / Validation */}
        <div style={{ borderTop: '0.5px dashed #C8C2B5', margin: '0 44px', padding: '14px 0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.navy, marginBottom: 2 }}>Validation Direction</div>
          <div style={{ display: 'inline-block', textAlign: 'center' }}>
            <div style={{ height: 50, borderBottom: '0.5px solid #C8C2B5', marginBottom: 6, width: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCC', fontSize: 11, fontStyle: 'italic' }}>Signature &amp; cachet officiel</div>
            <div style={{ width: 54, height: 54, borderRadius: '50%', border: '1.5px solid #C8C2B5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600, textTransform: 'uppercase', textAlign: 'center', color: '#666', margin: '0 auto 6px', lineHeight: 1.3 }}>Cachet<br />Dir.</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: A.paperBg, borderTop: '1px solid #E4DED5', padding: '8px 44px', fontSize: 10, color: '#999', textAlign: 'center', fontFamily: '\'Courier New\', monospace', lineHeight: 1.8 }}>
          <strong style={{ fontFamily: 'Inter, sans-serif', color: '#777' }}>Réf. :</strong> {doc.documentNumber}
          {doc.bcRef && <><span style={{ margin: '0 6px' }}>·</span><strong style={{ fontFamily: 'Inter, sans-serif', color: '#777' }}>BC lié :</strong> {doc.bcRef}</>}
          <span style={{ margin: '0 6px' }}>·</span>
          <strong style={{ fontFamily: 'Inter, sans-serif', color: '#777' }}>Date :</strong> {doc.date}
          {doc.companyInfo?.taxIds?.rc && <><span style={{ margin: '0 6px' }}>·</span><strong style={{ fontFamily: 'Inter, sans-serif', color: '#777' }}>RC :</strong> {doc.companyInfo.taxIds.rc}</>}
          <br />
          Document généré par <strong style={{ fontFamily: 'Inter, sans-serif', color: '#777' }}>CloudDevis</strong>
        </div>
      </div>
    </div>
  );
}
