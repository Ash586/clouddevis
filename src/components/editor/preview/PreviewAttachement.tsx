'use client';
import React from 'react';
import type { DocumentState } from '@/types';
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

const UNIT_LABELS: Record<string, string> = { u:'U', h:'H', j:'J', m2:'M\u00B2', m3:'M\u00B3', ml:'ML', kg:'KG', forfait:'Forfait' };
const CATEGORY_LABELS: Record<string, string> = {
  preparation:'Pr\u00E9paration', peinture:'Peinture', finition:'Finition',
  revetement:'Rev\u00EAtement', facade:'Fa\u00E7ade', enduit:'Enduit',
  main_oeuvre:'Main d\u2019\u0152uvre', materiaux:'Mat\u00E9riaux', transport:'Transport',
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
      className="w-[21cm] min-h-[29.7cm] flex flex-col shadow-md print:shadow-none relative"
      style={{ background: '#fff' }}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${A.navy} 0%, ${A.navyMid} 60%, ${A.gold} 100%)` }} />

      {/* === COMPANY FRAME === */}
      {isEnt && doc.companyInfo && (
        <div style={{ margin: '28px 44px 0', border: '2px solid #1A1A1A', padding: '14px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 14, fontWeight: 700, color: A.dark, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.35, marginBottom: 4 }}>
            {doc.companyInfo.name}
          </div>
          {doc.companyInfo.address && (
            <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>{doc.companyInfo.address}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 11, color: '#666', fontFamily: "'JetBrains Mono', monospace", marginTop: 6, flexWrap: 'wrap' }}>
            {doc.companyInfo.taxIds.rc && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: A.navy }}>RC</b> {doc.companyInfo.taxIds.rc}</span>
            )}
            {doc.companyInfo.taxIds.nif && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: A.navy }}>N.I.F.</b> {doc.companyInfo.taxIds.nif}</span>
            )}
            {doc.companyInfo.taxIds.nis && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: A.navy }}>N.I.S.</b> {doc.companyInfo.taxIds.nis}</span>
            )}
            {doc.companyPhone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: A.navy }}>T&#233;l.</b> {doc.companyPhone}</span>
            )}
          </div>
        </div>
      )}

      {/* === DOC TITLE === */}
      <div style={{ textAlign: 'center', padding: '22px 44px 8px' }}>
        <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 700, color: A.dark, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'underline', textUnderlineOffset: 5, textDecorationThickness: 2, display: 'inline-block', marginBottom: 10 }}>
          {t('docTypeAttachement') || 'Attachement des Travaux'}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, fontSize: 11, color: '#666', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
          {sf('docNumber') && (
            <span><b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: A.navy }}>R&#233;f.</b> {doc.documentNumber}</span>
          )}
          {sf('docNumber') && sf('issueDate') && (
            <span style={{ color: '#CCC' }}>&middot;</span>
          )}
          {sf('issueDate') && (
            <span><b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: A.navy }}>Date</b> {doc.date}</span>
          )}
          {doc.bcRef && (
            <>
              <span style={{ color: '#CCC' }}>&middot;</span>
              <span><b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: A.navy }}>BC li&#233;</b> {doc.bcRef}</span>
            </>
          )}
        </div>
        {doc.chantierAddress && (
          <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic', padding: '8px 20px', border: '0.5px solid #E4DED5', borderRadius: 4, background: A.paperBg, display: 'inline-block', marginBottom: 4 }}>
            R&#233;alis&#233; au niveau {doc.chantierAddress}
          </div>
        )}
      </div>

      {/* === TABLE === */}
      {doc.items.length > 0 && (
        <div style={{ padding: '14px 44px 0', borderBottom: '1px solid #E4DED5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}>
            <thead>
              <tr style={{ background: A.navy }}>
                <th style={{ width: 36, padding: '9px 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#EEF3FB', whiteSpace: 'nowrap', textAlign: 'center' }}>N&#176;</th>
                <th style={{ padding: '9px 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#EEF3FB', whiteSpace: 'nowrap', textAlign: 'left' }}>D&#233;signation des ouvrages</th>
                <th style={{ width: 52, padding: '9px 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#EEF3FB', whiteSpace: 'nowrap', textAlign: 'center' }}>Unit&#233;</th>
                <th style={{ width: 80, padding: '9px 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#EEF3FB', whiteSpace: 'nowrap', textAlign: 'center' }}>Quantit&#233;</th>
              </tr>
            </thead>
            <tbody>
              {uncategorized.map(item => {
                rowIdx++;
                const isEven = rowIdx % 2 === 0;
                return (
                  <tr key={item.id} style={{ borderBottom: '0.5px solid #EDEAE4', background: isEven ? '#FAFAF8' : 'transparent' }}>
                    <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#AAA', width: 36, textAlign: 'center' }}>{String(rowIdx).padStart(2, '0')}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12.5, fontWeight: 500, color: A.dark, lineHeight: 1.35 }}>{item.designation}</td>
                    <td style={{ padding: '9px 10px', width: 52, textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', background: A.navyLight, color: A.navy, fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 3, letterSpacing: '0.04em' }}>{UNIT_LABELS[item.unit] ?? item.unit}</span>
                    </td>
                    <td style={{ padding: '9px 10px', width: 80, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: A.dark }}>
                      {item.quantity > 0 ? item.quantity.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : <span style={{ color: '#CCC', fontStyle: 'italic', fontSize: 10 }}>&mdash;</span>}
                    </td>
                  </tr>
                );
              })}
              {[...catOrder, ...Object.keys(grouped).filter(c => !catOrder.includes(c))].map(cat => {
                const items = grouped[cat];
                if (!items) return null;
                const catLabel = CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
                const rows: React.ReactNode[] = [
                  <tr key={'h-'+cat} style={{ background: A.navyLight }}>
                    <td colSpan={4} style={{ padding: '6px 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.navy }}>{catLabel}</td>
                  </tr>
                ];
                for (const item of items) {
                  rowIdx++;
                  const isEven = rowIdx % 2 === 0;
                  rows.push(
                    <tr key={item.id} style={{ borderBottom: '0.5px solid #EDEAE4', background: isEven ? '#FAFAF8' : 'transparent' }}>
                      <td style={{ padding: '9px 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#AAA', width: 36, textAlign: 'center' }}>{String(rowIdx).padStart(2, '0')}</td>
                      <td style={{ padding: '9px 10px', fontSize: 12.5, fontWeight: 500, color: A.dark, lineHeight: 1.35 }}>{item.designation}</td>
                      <td style={{ padding: '9px 10px', width: 52, textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', background: A.navyLight, color: A.navy, fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 3, letterSpacing: '0.04em' }}>{UNIT_LABELS[item.unit] ?? item.unit}</span>
                      </td>
                      <td style={{ padding: '9px 10px', width: 80, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: A.dark }}>
                        {item.quantity > 0 ? item.quantity.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : <span style={{ color: '#CCC', fontStyle: 'italic', fontSize: 10 }}>&mdash;</span>}
                      </td>
                    </tr>
                  );
                }
                return rows;
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* === OBSERVATIONS === */}
      {sf('notes') && doc.notes && (
        <div style={{ margin: '0 44px', padding: '14px 0', borderBottom: '1px solid #E4DED5' }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888', marginBottom: 6 }}>Observations / R&#233;erves</div>
          <div style={{ background: A.paperBg, border: '0.5px solid #E4DED5', borderLeft: `2px solid ${A.navy}`, borderRadius: '0 4px 4px 0', padding: '10px 14px', fontSize: 12, color: '#444', fontStyle: 'italic', lineHeight: 1.6, minHeight: 40 }}>{doc.notes}</div>
        </div>
      )}

      {/* === CERTIFICATION BAND === */}
      <div style={{ margin: '16px 44px', background: A.navyLight, border: '0.5px solid #B5D4F4', borderRadius: 4, padding: '10px 16px', fontSize: 12, color: A.navy, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>&#10003;</span>
        <div style={{ lineHeight: 1.55 }}>
          <b>Attestation :</b> Le soussign&#233; certifie que les travaux ci-dessus ont &#233;t&#233; r&#233;alis&#233;s et r&#233;ceptionn&#233;s conform&#233;ment aux quantit&#233;s indiqu&#233;es.
          {doc.chantierAddress && <span> au niveau {doc.chantierAddress}.</span>}
        </div>
      </div>

      {/* === 2 SIGNATURES (top) === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '20px 44px 0', gap: 0 }}>
        {/* Left: Client / Maitre d'ouvrage */}
        <div style={{ paddingBottom: 16, borderRight: '0.5px dashed #C8C2B5', paddingRight: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.navy, marginBottom: 2 }}>Le ma&#238;tre d&apos;ouvrage</div>
          {doc.sigClientSubtitle && (
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{doc.sigClientSubtitle}</div>
          )}
          {!doc.sigClientSubtitle && (
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{doc.clientInfo.name || '\u2014'}</div>
          )}
          {(doc.sigClientNameAr || doc.sigClientRole) && (
            <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic', marginBottom: 4, lineHeight: 1.5 }}>
              {doc.sigClientNameAr && <>{doc.sigClientNameAr}<br /></>}
              {doc.sigClientRole}
            </div>
          )}
          <div style={{ height: 56, borderBottom: '0.5px solid #C8C2B5', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DDD', fontSize: 11, fontStyle: 'italic' }}>Signature</div>
          {doc.sigClientRoleFr && (
            <div style={{ fontSize: 10, color: '#888', lineHeight: 1.4 }}>{doc.sigClientRoleFr}</div>
          )}
          {(doc.sigClientNameFr || doc.clientInfo.name) && (
            <div style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{doc.sigClientNameFr || doc.clientInfo.name}</div>
          )}
        </div>

        {/* Right: Company / Enterprise */}
        <div style={{ paddingBottom: 16, paddingLeft: 28, textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, marginBottom: 2 }}>L&apos;Entreprise</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{isEnt && doc.companyInfo ? doc.companyInfo.name : '\u2014'}</div>
          {doc.sigCompanyNameFr && (
            <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic', marginBottom: 4, lineHeight: 1.5 }}>
              {doc.sigCompanyNameFr}
            </div>
          )}
          <div style={{ height: 56, borderBottom: '0.5px solid #C8C2B5', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DDD', fontSize: 11, fontStyle: 'italic' }}>Signature</div>
          {(doc.sigCompanyNameFr || (isEnt && doc.companyInfo?.name)) && (
            <div style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{doc.sigCompanyNameFr || (isEnt && doc.companyInfo?.name)}</div>
          )}
        </div>
      </div>

      {/* === 3rd SIGNATURE (Direction) === */}
      <div style={{ borderTop: '0.5px dashed #C8C2B5', margin: '0 44px', padding: '18px 0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: A.green, marginBottom: 2 }}>
          {isEnt && doc.companyInfo ? doc.companyInfo.name : 'Validation Direction'}
        </div>
        {doc.sigDirectionRole && (
          <div style={{ fontSize: 10, color: '#888', marginTop: 3, marginBottom: 12, lineHeight: 1.4 }}>{doc.sigDirectionRole}</div>
        )}
        <div style={{ display: 'inline-block', textAlign: 'center' }}>
          <div style={{ height: 56, borderBottom: '0.5px solid #C8C2B5', width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DDD', fontSize: 11, fontStyle: 'italic', margin: '0 auto 8px' }}>Signature &amp; cachet officiel</div>
          {(doc.sigDirectionNameFr || (isEnt && doc.companyInfo?.name)) && (
            <div style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{doc.sigDirectionNameFr || (isEnt && doc.companyInfo?.name)}</div>
          )}
          {doc.sigDirectionRole && (
            <div style={{ fontSize: 10, color: '#888', marginTop: 2, lineHeight: 1.4 }}>{doc.sigDirectionRole}</div>
          )}
        </div>
      </div>

      {/* === FOOTER === */}
      <div style={{ background: A.paperBg, borderTop: '1px solid #E4DED5', padding: '10px 44px', fontSize: 10, color: '#999', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.8 }}>
        <strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>R&#233;f. :</strong> {doc.documentNumber}
        {doc.bcRef && <><span style={{ margin: '0 6px' }}>&middot;</span><strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>BC li&#233; :</strong> {doc.bcRef}</>}
        <span style={{ margin: '0 6px' }}>&middot;</span>
        <strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>Date :</strong> {doc.date}
        {doc.companyInfo?.taxIds?.rc && <><span style={{ margin: '0 6px' }}>&middot;</span><strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>RC :</strong> {doc.companyInfo.taxIds.rc}</>}
        <br />
        Document g&#233;n&#233;r&#233; par <strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>CloudDevis</strong>
      </div>
    </div>
  );
}
