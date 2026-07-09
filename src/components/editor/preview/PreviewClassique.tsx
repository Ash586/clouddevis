'use client';
import React from 'react';
import type { DocumentState, CalculationResult } from '@/types';
import type { PreviewFocus } from '@/components/editor/DocumentPreview';

const C = {
  text:    '#111111',
  muted:   '#555555',
  light:   '#888888',
  border:  '#aaaaaa',
  thead:   '#1c1c1c',
  rule:    '#cccccc',
};

const SIZE_CLASS: Record<string, string> = {
  sm: 'max-w-[60px]  max-h-[40px]',
  md: 'max-w-[120px] max-h-[70px]',
  lg: 'max-w-[200px] max-h-[100px]',
};

const UNIT_LABELS: Record<string, string> = {
  u: 'u', h: 'h', j: 'j', m2: 'm²', m3: 'm³', ml: 'ml', kg: 'kg', forfait: 'fft',
};

const CAT_LABELS: Record<string, string> = {
  preparation: 'Préparation', peinture: 'Peinture', finition: 'Finition',
  revetement: 'Revêtement', facade: 'Façade', enduit: 'Enduit',
  main_oeuvre: 'Main-d\'œuvre', materiaux: 'Matériaux', transport: 'Transport', divers: 'Divers',
};

const DOC_LABELS: Record<string, string> = {
  devis: 'DEVIS', facture: 'FACTURE', proforma: 'FACTURE PROFORMA',
  bc: 'BON DE COMMANDE', br: 'BON DE RÉCEPTION', bl: 'BON DE LIVRAISON',
  intervention: 'RAPPORT D\'INTERVENTION', attachement: 'DÉCOMPTE D\'ATTACHEMENT',
};

function numFmt(n: number) {
  return n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  doc: DocumentState;
  results: CalculationResult;
  sf: (f: string) => boolean;
  bv: (...fs: string[]) => boolean;
  vb: (b: string) => boolean;
  highlight?: PreviewFocus;
  onZoneClick?: (focus: NonNullable<PreviewFocus>) => void;
}

export function PreviewClassique({ doc, results, sf, bv, vb, highlight, onZoneClick }: Props) {
  const isEnt = doc.mode === 'entreprise';
  const comp = doc.companyInfo;
  const art  = doc.artisanInfo;
  const cli  = doc.clientInfo;

  const logoUrl = comp?.logo ?? undefined;
  const logoPos = doc.logoPosition ?? 'right';
  const logoSize = doc.logoSize ?? 'md';

  const docLabel = DOC_LABELS[doc.documentType] ?? doc.documentType.toUpperCase();

  // Group items by category
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
  const CAT_ORDER = ['preparation','peinture','finition','revetement','facade','enduit','main_oeuvre','materiaux','transport','divers'];
  const allCats = [...CAT_ORDER, ...Object.keys(grouped).filter(c => !CAT_ORDER.includes(c))];

  const currency = 'DA';

  /* ── Company name display ── */
  const companyName = isEnt && comp ? comp.name : art?.name ?? '';
  const companyAddr = isEnt && comp ? comp.address : art?.address ?? '';
  const companyPhone = doc.companyPhone ?? (art?.phone ?? '');
  const taxIds = isEnt && comp ? comp.taxIds : art ? { nif: art.nif ?? '', nis: art.nis ?? '', rc: '', ai: art.ai ?? '' } : null;
  const carteArtisan = !isEnt && art?.carteArtisan ? art.carteArtisan : '';

  /* ── Logo element ── */
  const LogoEl = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt="Logo" className={`object-contain ${SIZE_CLASS[logoSize] ?? SIZE_CLASS.md}`} />
  ) : null;

  return (
    <div
      id="print-area"
      className="w-[21cm] min-h-[29.7cm] bg-white flex flex-col shadow-md print:shadow-none"
      style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", color: C.text, fontSize: 11, padding: '1.2cm 1.5cm', position: 'relative' }}
    >
      {/* ── HEADER ── */}
      <div
        onClick={onZoneClick ? () => onZoneClick('header') : undefined}
        className={`mb-3 transition-all duration-700 print:transition-none ${onZoneClick ? 'cursor-pointer' : ''} ${highlight === 'header' ? 'ring-1 ring-blue-400/50 bg-blue-50/30 rounded p-1 -m-1' : ''}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          {/* Left: company info */}
          <div style={{ flex: 1 }}>
            {logoPos === 'left' && LogoEl && <div style={{ marginBottom: 8 }}>{LogoEl}</div>}
            {companyName && (
              <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em', color: C.text, lineHeight: 1.2, marginBottom: 4 }}>
                {companyName}
              </div>
            )}
            {doc.companyTagline && (
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: '0.04em' }}>
                {doc.companyTagline}
              </div>
            )}
            {companyAddr && (
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 2, whiteSpace: 'pre-line' }}>{companyAddr}</div>
            )}
            {companyPhone && <div style={{ fontSize: 9, color: C.muted }}>Tél : {companyPhone}</div>}
            {taxIds?.nif && <div style={{ fontSize: 9, color: C.muted }}>Id Fiscal : {taxIds.nif}</div>}
            {(doc.bankName || doc.bankAgency || doc.bankAgencyCode || doc.bankAddress) && (
              <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                Compte : {[doc.bankName, doc.bankAgency, doc.bankAgencyCode, doc.bankAddress].filter(Boolean).join(' ')}
              </div>
            )}
            {doc.rib && <div style={{ fontSize: 9, color: C.muted }}>RIB : {doc.rib}</div>}
            {doc.ccpNumber && <div style={{ fontSize: 9, color: C.muted }}>CCP Banquaire : {doc.ccpNumber}</div>}
          </div>

          {/* Right: logo + tax IDs */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {logoPos !== 'left' && LogoEl && (
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: logoPos === 'center' ? 'center' : 'flex-end' }}>
                {LogoEl}
              </div>
            )}
            {taxIds && (
              <div style={{ fontSize: 9, color: C.muted, lineHeight: 1.7, textAlign: 'right' }}>
                {taxIds.rc  && <div><strong>RC :</strong> {taxIds.rc}</div>}
                {taxIds.ai  && <div><strong>AI :</strong> {taxIds.ai}</div>}
                {taxIds.nis && <div><strong>NIS :</strong> {taxIds.nis}</div>}
                {carteArtisan && <div><strong>Carte Artisan :</strong> {carteArtisan}</div>}
                {isEnt && comp?.capital && <div><strong>Capital :</strong> {comp.capital}</div>}
              </div>
            )}
            {art?.phone && !isEnt && (
              <div style={{ fontSize: 9, color: C.muted }}>Tél : {art.phone}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL RULE ── */}
      <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 10 }} />

      {/* ── DOCUMENT TITLE + DATE ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
            {docLabel}{doc.documentNumber ? ` N° ${doc.documentNumber}` : ''}
          </div>
          {doc.paymentMode && (
            <div style={{ fontSize: 9, color: C.muted }}>Mode de Paiement : {doc.paymentMode === 'cheque' ? 'Chèque' : doc.paymentMode === 'virement' ? 'Virement bancaire' : doc.paymentMode === 'especes' ? 'Espèces' : doc.paymentMode}</div>
          )}
          {doc.paymentDetails?.terms && (
            <div style={{ fontSize: 9, color: C.muted }}>Conditions : {doc.paymentDetails.terms}</div>
          )}
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, color: C.muted }}>
          <div><strong>Le :</strong> {doc.date}</div>
          {doc.validUntil && <div><strong>Validité :</strong> {doc.validUntil}</div>}
          {doc.deliveryDate && <div><strong>Livraison :</strong> {doc.deliveryDate}</div>}
          {doc.docCity && <div style={{ fontSize: 9 }}>{doc.docCity}</div>}
        </div>
      </div>

      {/* ── CLIENT BLOCK ── */}
      {vb('client') && bv('clientName', 'clientAddress', 'clientPhone', 'clientEmail') && (
        <div
          onClick={onZoneClick ? () => onZoneClick('client') : undefined}
          className={`transition-all duration-700 print:transition-none ${onZoneClick ? 'cursor-pointer' : ''} ${highlight === 'client' ? 'ring-1 ring-blue-400/50 bg-blue-50/30 rounded' : ''}`}
          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 16 }}
        >
          {/* DOIT block */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>DOIT</div>
            {sf('clientName') && cli.name && (
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{cli.name}</div>
            )}
            {sf('clientAddress') && cli.address && (
              <div style={{ fontSize: 9, color: C.muted, marginTop: 2, whiteSpace: 'pre-line' }}>{cli.address}</div>
            )}
            {sf('clientPhone') && cli.phone && (
              <div style={{ fontSize: 9, color: C.muted }}>Tél : {cli.phone}</div>
            )}
            {sf('clientEmail') && cli.email && (
              <div style={{ fontSize: 9, color: C.muted }}>{cli.email}</div>
            )}
          </div>

          {/* Client tax IDs */}
          {(cli.nif || cli.nis || cli.rc || cli.ai) && (
            <div style={{ textAlign: 'right', fontSize: 9, color: C.muted, lineHeight: 1.7 }}>
              {sf('clientNif') && cli.nif && <div><strong>IF :</strong> {cli.nif}</div>}
              {sf('clientNis') && cli.nis && <div><strong>NIS :</strong> {cli.nis}</div>}
              {sf('clientRc') && cli.rc && <div><strong>RC :</strong> {cli.rc}</div>}
              {sf('clientAi') && cli.ai && <div><strong>AI :</strong> {cli.ai}</div>}
            </div>
          )}
        </div>
      )}

      {/* ── REFERENCES ── */}
      {(doc.bcRef || doc.brRef || doc.reference || doc.deliveryRef) && (
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, lineHeight: 1.7 }}>
          {doc.bcRef && <div><strong>BON DE COMMANDE N° :</strong> {doc.bcRef}</div>}
          {doc.brRef && <div><strong>BON DE RÉCEPTION N° :</strong> {doc.brRef}</div>}
          {doc.reference && <div><strong>Réf. :</strong> {doc.reference}</div>}
          {doc.deliveryRef && <div><strong>BL N° :</strong> {doc.deliveryRef}</div>}
          {doc.deliveryDate && <div><strong>Date échéance :</strong> {doc.deliveryDate}</div>}
        </div>
      )}

      {/* ── OBJET ── */}
      {doc.objet && (
        <div style={{ marginBottom: 10, borderLeft: `3px solid ${C.border}`, paddingLeft: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>OBJET</div>
          <div style={{ fontSize: 10, color: C.text }}>{doc.objet}</div>
        </div>
      )}

      {/* ── CHANTIER (if applicable) ── */}
      {vb('chantier') && bv('chantierAddress', 'chantierType', 'chantierCondition', 'chantierSurface') && (
        doc.chantierAddress || doc.chantierType || doc.chantierSurface > 0
      ) && (
        <div style={{ marginBottom: 8, fontSize: 9, color: C.muted }}>
          {doc.chantierAddress && <span><strong>Chantier :</strong> {doc.chantierAddress} </span>}
          {doc.chantierType && <span>— {doc.chantierType} </span>}
          {doc.chantierSurface > 0 && <span>— {doc.chantierSurface} m²</span>}
        </div>
      )}

      {/* ── ITEMS TABLE ── */}
      {vb('table') && sf('itemsTable') && doc.items.length > 0 && (
        <div
          onClick={onZoneClick ? () => onZoneClick('items') : undefined}
          className={`transition-all duration-700 print:transition-none ${onZoneClick ? 'cursor-pointer' : ''} ${highlight === 'items' ? 'ring-1 ring-blue-400/50 bg-blue-50/30 rounded' : ''}`}
          style={{ marginBottom: 16 }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: C.thead, color: '#ffffff' }}>
                <th style={{ padding: '5px 4px', textAlign: 'left', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', width: 28 }}>N°</th>
                <th style={{ padding: '5px 4px', textAlign: 'left', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DÉSIGNATION</th>
                <th style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', width: 36 }}>UNITÉ</th>
                <th style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', width: 36 }}>QTÉ</th>
                <th style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', width: 64 }}>PU HT</th>
                {results.tvaRate > 0 && (
                  <th style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', width: 40 }}>TVA</th>
                )}
                <th style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', width: 72 }}>MONTANT HT</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let idx = 0;
                const rows: React.ReactNode[] = [];

                const renderItem = (item: (typeof doc.items)[0]) => {
                  idx++;
                  const amount = item.quantity * item.unitPrice;
                  const even = idx % 2 === 0;
                  rows.push(
                    <tr key={item.id} style={{ background: even ? '#f9f9f9' : '#ffffff', borderBottom: `0.5px solid ${C.rule}` }}>
                      <td style={{ padding: '4px', color: C.light, fontWeight: 600, fontSize: 9 }}>{String(idx).padStart(2, '0')}</td>
                      <td style={{ padding: '4px' }}>
                        <div style={{ fontWeight: 500, color: C.text }}>{item.designation}</div>
                        {item.description && <div style={{ fontSize: 8, color: C.light, fontStyle: 'italic' }}>{item.description}</div>}
                      </td>
                      <td style={{ padding: '4px', textAlign: 'center', color: C.muted }}>{UNIT_LABELS[item.unit] ?? item.unit}</td>
                      <td style={{ padding: '4px', textAlign: 'center', fontWeight: 600, color: C.text }}>{item.quantity}</td>
                      <td style={{ padding: '4px', textAlign: 'right', color: C.muted }}>{numFmt(item.unitPrice)}</td>
                      {results.tvaRate > 0 && (
                        <td style={{ padding: '4px', textAlign: 'right', color: C.muted }}>{results.tvaRate}%</td>
                      )}
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700, color: C.text }}>{numFmt(amount)}</td>
                    </tr>
                  );
                };

                for (const item of uncategorized) renderItem(item);

                for (const cat of allCats) {
                  const items = grouped[cat];
                  if (!items) continue;
                  const catLabel = CAT_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
                  rows.push(
                    <tr key={'h-' + cat}>
                      <td colSpan={results.tvaRate > 0 ? 7 : 6} style={{ padding: '5px 4px 2px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, borderBottom: `1px solid ${C.border}` }}>
                        {catLabel}
                      </td>
                    </tr>
                  );
                  for (const item of items) renderItem(item);
                }

                return rows;
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SPACER to push footer down ── */}
      <div style={{ flex: 1 }} />

      {/* ── TOTALS ── */}
      <div
        onClick={onZoneClick ? () => onZoneClick('totals') : undefined}
        className={`transition-all duration-700 print:transition-none ${onZoneClick ? 'cursor-pointer' : ''} ${highlight === 'totals' || highlight === 'payment' ? 'ring-1 ring-blue-400/50 bg-blue-50/30 rounded' : ''}`}
      >
        {/* Payment info left + totals right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div style={{ width: 260 }}>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
              <TotalRow label="Total HT" value={`${numFmt(results.subTotalHT)} ${currency}`} />
              {results.discountAmount > 0 && (
                <TotalRow label={`Remise${doc.discount.reason ? ` (${doc.discount.reason})` : ''}`} value={`- ${numFmt(results.discountAmount)} ${currency}`} />
              )}
              {results.tvaRate > 0 && (
                <TotalRow label={`TVA ${results.tvaRate}%`} value={`${numFmt(results.tvaAmount)} ${currency}`} />
              )}
              <TotalRow label="Timbre" value={`${numFmt(results.timbreFiscal)} ${currency}`} />
              {results.acompte > 0 && (
                <TotalRow label="Acompte versé" value={`- ${numFmt(results.acompte)} ${currency}`} />
              )}
              <div style={{ borderTop: `2px solid ${C.text}`, marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>NET À PAYER</span>
                <span style={{ fontSize: 13, fontWeight: 900 }}>{numFmt(results.netAPayer)} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        {vb('tafqit') && results.totalInWords && (
          <div style={{ borderTop: `1px solid ${C.rule}`, paddingTop: 6, marginBottom: 10, fontSize: 9, color: C.muted }}>
            <strong>Arrêtée la présente {doc.documentType === 'devis' ? 'offre' : 'facture'} à la somme de :</strong>
            <div style={{ fontWeight: 600, color: C.text, marginTop: 2 }}>{results.totalInWords}</div>
          </div>
        )}

        {/* Notes */}
        {vb('notes') && doc.notes && (
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 8, borderTop: `1px solid ${C.rule}`, paddingTop: 6 }}>
            <strong>Notes :</strong> {doc.notes}
          </div>
        )}

        {/* Garanties */}
        {vb('garanties') && bv('garantieLabor', 'garantieMaterials', 'garantieNotes') && (
          (doc.garantieMO || doc.garantieMateriaux || doc.garantieNotes) && (
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>
              {doc.garantieMO && <div>Garantie MO : {doc.garantieMO}</div>}
              {doc.garantieMateriaux && <div>Garantie Matériaux : {doc.garantieMateriaux}</div>}
              {doc.garantieNotes && <div style={{ fontStyle: 'italic' }}>{doc.garantieNotes}</div>}
            </div>
          )
        )}

        {/* Signature */}
        {vb('signature') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 8, borderTop: `1px solid ${C.rule}` }}>
            <div style={{ textAlign: 'center', minWidth: 140 }}>
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>
                {doc.signatoryTitle ? doc.signatoryTitle : 'Signature et cachet'}
              </div>
              <div style={{ width: 140, height: 60, border: `1px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {comp?.signature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={comp.signature} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="Signature" />
                ) : (
                  <span style={{ fontSize: 8, color: C.light }}>Signature / Cachet</span>
                )}
              </div>
              {doc.signatoryName && <div style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{doc.signatoryName}</div>}
            </div>
          </div>
        )}

        {/* Footer line */}
        <div style={{ textAlign: 'center', fontSize: 7, color: C.light, marginTop: 12, borderTop: `0.5px solid ${C.rule}`, paddingTop: 4 }}>
          Document généré par Rakmana
        </div>
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 3, fontSize: 10, color: C.muted }}>
      <span>{label}</span>
      <span style={{ color: C.text }}>{value}</span>
    </div>
  );
}
