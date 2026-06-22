'use client';
import React from 'react';
import type { DocumentState, CalculationResult, BlockId } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { numberToFrenchWords } from '@/lib/calculations';

// Official Algerian public-procurement "Bon de Commande" layout.
// Mirrors the reference mockup (république header, contrôle financier panel,
// service contractant / fournisseur blocks, nature & type de dépense, priced table).

const C = {
  green: '#0B3D2E',
  gold: '#C4A35A',
  dark: '#1A1A1A',
  paper: '#F9F7F3',
  border: '#E4DED5',
};

const UNIT_LABELS: Record<string, string> = { u: 'U', h: 'H', j: 'J', m2: 'M²', m3: 'M³', ml: 'ML', kg: 'KG', forfait: 'Forfait' };

interface BcProps {
  doc: DocumentState;
  results: CalculationResult;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  t: (key: string) => string;
  tc: (key: string) => string;
  tu: (key: string) => string;
  design: DocTypeDesign;
  highlight?: string | null;
}

function money(n: number): string {
  return (n || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PreviewBonCommande({ doc, results, sf, vb, t, tc }: BcProps) {
  const isEnt = doc.mode === 'entreprise';
  const currency = tc('currency');
  const bc = (doc.customFields?.bc ?? {}) as Record<string, unknown>;
  const financement = String(bc.financementSource ?? '');
  const nature = String(bc.naturePrestation ?? '');       // travaux | fournitures | services
  const depense = String(bc.typeDepense ?? '');           // fonctionnement | equipement | autre
  const codeGestionnaire = String(bc.codeGestionnaire ?? '');

  const co = doc.companyInfo;
  const tax: { nif?: string; nis?: string; rc?: string; ai?: string } = co?.taxIds ?? {};

  const chk = (on: boolean) => ({
    width: 16, height: 16, borderRadius: 3, flexShrink: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
    border: on ? `1.5px solid ${C.green}` : '1.5px solid #C8C2B5',
    background: on ? '#EAF3DE' : 'transparent', color: on ? C.green : 'transparent',
  } as React.CSSProperties);

  const idHeadTitle: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.07em' };
  const ifk: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 3 };
  const ifv: React.CSSProperties = { fontSize: 13, color: C.dark, lineHeight: 1.35 };
  const ifcK: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' };
  const ifcV: React.CSSProperties = { fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: C.green };
  const idHead: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px', background: C.paper, borderBottom: `1px solid ${C.border}` };
  const idNum: React.CSSProperties = { width: 20, height: 20, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 };
  const charColTitle: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888', marginBottom: 10 };
  const checkRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 };
  const th: React.CSSProperties = { padding: '9px 12px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#F5F1E8', whiteSpace: 'nowrap' };

  return (
    <div id="print-area" className="w-[21cm] min-h-[29.7cm] flex flex-col shadow-md print:shadow-none relative" style={{ background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.green} 60%, ${C.gold} 100%)` }} />

      {/* République */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '14px 44px 12px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', border: '1.5px solid #C8C2B5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#666', flexShrink: 0 }}>&#9789;</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, direction: 'rtl', marginBottom: 2 }}>&#1575;&#1604;&#1580;&#1605;&#1607;&#1608;&#1585;&#1610;&#1577; &#1575;&#1604;&#1580;&#1586;&#1575;&#1574;&#1585;&#1610;&#1577; &#1575;&#1604;&#1583;&#1610;&#1605;&#1602;&#1585;&#1575;&#1591;&#1610;&#1577; &#1575;&#1604;&#1588;&#1593;&#1576;&#1610;&#1577;</div>
          <div style={{ fontSize: 11, color: '#666', letterSpacing: '0.04em' }}>R&#233;publique Alg&#233;rienne D&#233;mocratique et Populaire</div>
        </div>
      </div>

      {/* Title band */}
      <div style={{ background: C.dark, padding: '11px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 14, fontWeight: 600, color: '#F5F1E8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t('docTypeOrder') || 'Bon de Commande'}</h1>
        <span style={{ fontSize: 11, color: 'rgba(245,241,232,.55)', fontFamily: "'JetBrains Mono', monospace" }}>{doc.documentNumber} {doc.date ? `· ${doc.date}` : ''}</span>
      </div>

      {/* Meta strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${C.border}` }}>
        {[
          { k: 'Numéro', v: doc.documentNumber },
          { k: "Date d'émission", v: doc.date },
          { k: 'Source de financement', v: financement || '—' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '10px 20px', borderRight: i < 2 ? `1px solid ${C.border}` : 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888' }}>{m.k}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>{m.v}</span>
          </div>
        ))}
      </div>

      {/* Body grid: contrôle financier + identités */}
      <div style={{ display: 'grid', gridTemplateColumns: '155px 1fr', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ borderRight: `1px solid ${C.border}`, padding: '16px 14px', background: C.paper }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 12, textAlign: 'center', paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>Contr&#244;le financier</div>
          {['Au service du', 'Le', 'À'].map((l, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: '#888', marginBottom: 4, display: 'block' }}>{l}</span>
              <div style={{ height: 24, borderBottom: '1px solid #DDD8CF' }} />
            </div>
          ))}
          <div style={{ marginTop: 14, border: '1px dashed #C8C2B5', borderRadius: 6, padding: '14px 8px', textAlign: 'center', color: '#AAA', fontSize: 11, fontStyle: 'italic', lineHeight: 1.4 }}>Espace visa<br />contr&#244;le financier</div>
        </div>

        <div>
          {/* Service contractant */}
          <div style={{ borderBottom: `1px solid ${C.border}` }}>
            <div style={idHead}><div style={idNum}>1</div><span style={idHeadTitle}>Service Contractant &mdash; Donneur d&apos;ordre</span></div>
            <div style={{ padding: '14px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                <div><div style={ifk}>Dénomination</div><div style={{ ...ifv, fontWeight: 600, color: C.green }}>{doc.clientInfo.name || '—'}</div></div>
                {codeGestionnaire && <div><div style={ifk}>Code gestionnaire</div><div style={{ ...ifv, fontFamily: "'JetBrains Mono', monospace" }}>{codeGestionnaire}</div></div>}
                {doc.clientInfo.address && <div><div style={ifk}>Adresse</div><div style={ifv}>{doc.clientInfo.address}</div></div>}
                {doc.clientInfo.phone && <div><div style={ifk}>Téléphone / Fax</div><div style={{ ...ifv, fontFamily: "'JetBrains Mono', monospace" }}>{doc.clientInfo.phone}</div></div>}
              </div>
            </div>
          </div>

          {/* Prestataire / Fournisseur */}
          <div style={{ borderBottom: `1px solid ${C.border}` }}>
            <div style={idHead}><div style={idNum}>2</div><span style={idHeadTitle}>Prestataire / Fournisseur</span></div>
            <div style={{ padding: '14px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                <div><div style={ifk}>Raison sociale</div><div style={{ ...ifv, fontWeight: 600, color: C.green }}>{(isEnt && co?.name) || doc.clientInfo.name || '—'}</div></div>
                {co?.address && <div><div style={ifk}>Adresse</div><div style={ifv}>{co.address}</div></div>}
                {doc.companyPhone && <div><div style={ifk}>Téléphone / Fax</div><div style={{ ...ifv, fontFamily: "'JetBrains Mono', monospace" }}>{doc.companyPhone}</div></div>}
                {co?.capital && <div><div style={ifk}>Capital</div><div style={ifv}>{co.capital}</div></div>}
              </div>
            </div>
            {(tax.nif || tax.nis || tax.rc || doc.rib) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: C.paper, borderTop: `1px solid ${C.border}` }}>
                {tax.nif && <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'baseline', gap: 8, borderRight: `1px solid ${C.border}` }}><span style={ifcK}>N.I.F.</span><span style={ifcV}>{tax.nif}</span></div>}
                {tax.nis && <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={ifcK}>N.I.S.</span><span style={ifcV}>{tax.nis}</span></div>}
                {tax.rc && <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'baseline', gap: 8, borderRight: `1px solid ${C.border}`, borderTop: `1px solid ${C.border}` }}><span style={ifcK}>N&#176; RC</span><span style={ifcV}>{tax.rc}</span></div>}
                {doc.rib && <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'baseline', gap: 8, borderTop: `1px solid ${C.border}` }}><span style={ifcK}>RIB</span><span style={ifcV}>{doc.rib}</span></div>}
              </div>
            )}
          </div>

          {/* Caractéristiques & objet */}
          <div>
            <div style={idHead}><div style={idNum}>3</div><span style={idHeadTitle}>Caractéristiques &amp; Objet de la commande</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: '14px 20px', borderRight: `1px solid ${C.border}` }}>
                <div style={charColTitle}>Nature de prestation</div>
                {[['travaux', 'Travaux'], ['fournitures', 'Fournitures'], ['services', 'Services']].map(([val, lbl]) => (
                  <div key={val} style={checkRow}><div style={chk(nature === val)}>{nature === val ? '✓' : ''}</div><span style={{ fontSize: 13, color: nature === val ? C.green : '#333', fontWeight: nature === val ? 500 : 400 }}>{lbl}</span></div>
                ))}
              </div>
              <div style={{ padding: '14px 20px' }}>
                <div style={charColTitle}>Type de dépense</div>
                {[['fonctionnement', 'Dépenses de fonctionnement'], ['equipement', "Dépenses d'équipement"], ['autre', 'Autre']].map(([val, lbl]) => (
                  <div key={val} style={checkRow}><div style={chk(depense === val)}>{depense === val ? '✓' : ''}</div><span style={{ fontSize: 13, color: depense === val ? C.green : '#333', fontWeight: depense === val ? 500 : 400 }}>{lbl}</span></div>
                ))}
              </div>
              {doc.objet && (
                <div style={{ gridColumn: '1 / -1', borderTop: `1px solid ${C.border}`, padding: '14px 20px' }}>
                  <div style={{ background: '#FDFAF4', borderLeft: `3px solid ${C.gold}`, borderRadius: '0 5px 5px 0', padding: '10px 14px', fontSize: 13, color: '#333', lineHeight: 1.6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.gold, display: 'block', marginBottom: 4 }}>Objet détaillé</span>
                    {doc.objet}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      {vb('table') && sf('itemsTable') && doc.items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.dark }}>
              <th style={{ ...th, width: 38, textAlign: 'left' }}>N&#176;</th>
              <th style={{ ...th, textAlign: 'left' }}>D&#233;signation</th>
              <th style={{ ...th, width: 46, textAlign: 'center' }}>Unit&#233;</th>
              <th style={{ ...th, width: 58, textAlign: 'center' }}>Quantit&#233;</th>
              <th style={{ ...th, width: 130, textAlign: 'right' }}>Prix unitaire</th>
              <th style={{ ...th, width: 130, textAlign: 'right' }}>Montant HT</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #EDEAE4', background: i % 2 === 1 ? '#FAFAF8' : 'transparent' }}>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#888' }}>{String(i + 1).padStart(2, '0')}</td>
                <td style={{ padding: '10px 12px', color: C.dark, lineHeight: 1.4 }}><span style={{ fontWeight: 500 }}>{item.designation}</span></td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{UNIT_LABELS[item.unit] ?? item.unit}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{money(item.unitPrice)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{money(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Bottom: montant en lettres + conditions | totals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ padding: '18px 20px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ background: '#FDFAF4', borderLeft: `3px solid ${C.gold}`, borderRadius: '0 5px 5px 0', padding: '11px 14px', marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888', display: 'block', marginBottom: 4 }}>Arrêtée la présente commande à la somme de</span>
            <div style={{ fontSize: 12, fontStyle: 'italic', color: '#333', lineHeight: 1.55 }}>{numberToFrenchWords(results.totalTTC)} ({money(results.totalTTC)} {currency})</div>
          </div>
          {sf('notes') && doc.notes && (
            <div style={{ fontSize: 11, color: '#666', lineHeight: 1.7 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.green, display: 'block', marginBottom: 5 }}>Conditions &amp; engagements</span>
              {doc.notes}
            </div>
          )}
        </div>
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid #EDEAE4', fontSize: 13 }}><span style={{ color: '#666' }}>Montant HT</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500, color: C.dark }}>{money(results.subTotalHT)} {currency}</span></div>
          {results.tvaRate > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: `2px solid ${C.dark}`, fontSize: 13 }}><span style={{ color: '#666' }}>TVA ({results.tvaRate}%)</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500, color: C.dark }}>{money(results.tvaAmount)} {currency}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0 0', marginTop: 2, fontSize: 13 }}><span style={{ fontWeight: 600, fontSize: 14, color: C.green }}>Montant TTC</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 700, color: C.green }}>{money(results.totalTTC)} {currency}</span></div>
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${C.border}`, padding: '22px 44px 28px' }}>
        <div style={{ textAlign: 'center', borderRight: '1px dashed #C8C2B5', paddingRight: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.green, marginBottom: 2 }}>Le service co-contractant</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>Signature &amp; cachet du prestataire</div>
          <div style={{ height: 66, borderBottom: '1px solid #C8C2B5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DDD', fontSize: 11, fontStyle: 'italic', marginBottom: 10 }}>Signature</div>
          <div style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{(isEnt && co?.name) || 'Le Gérant'}</div>
        </div>
        <div style={{ textAlign: 'center', paddingLeft: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.green, marginBottom: 2 }}>Le service contractant</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>{doc.docCity ? `À ${doc.docCity}, le ................` : 'Signature & cachet'}</div>
          <div style={{ height: 66, borderBottom: '1px solid #C8C2B5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DDD', fontSize: 11, fontStyle: 'italic', marginBottom: 10 }}>Signature</div>
          <div style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{doc.clientInfo.name || 'Le Directeur'}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.paper, borderTop: `1px solid ${C.border}`, padding: '11px 44px', fontSize: 11, color: '#999', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.8 }}>
        <strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>R&#233;f. :</strong> {doc.documentNumber}
        {tax.nif && <><span style={{ margin: '0 6px' }}>&middot;</span><strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>N.I.F. :</strong> {tax.nif}</>}
        {tax.rc && <><span style={{ margin: '0 6px' }}>&middot;</span><strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>RC :</strong> {tax.rc}</>}
        <br />Document g&#233;n&#233;r&#233; par <strong style={{ fontFamily: "'Inter', sans-serif", color: '#777' }}>CloudDevis</strong>
      </div>
    </div>
  );
}
