import type { LineItem, DocumentState, CalculationResult } from '@/types';

/**
 * Single clean "Classique" HTML generator — black text on white paper.
 * Mirrors src/components/editor/preview/PreviewClassique.tsx 1:1 so the
 * downloaded/printed PDF matches exactly what the editor preview shows.
 *
 * Uses only system fonts (Arial/Helvetica, + Noto Naskh Arabic for AR) so
 * there is NO cross-origin Google-Fonts dependency → no blank-page risk.
 */

const UNIT_LABELS: Record<string, string> = {
  u: 'u', h: 'h', j: 'j', m2: 'm²', m3: 'm³', ml: 'ml', kg: 'kg', forfait: 'fft',
};

const CAT_LABELS: Record<string, string> = {
  preparation: 'Préparation', peinture: 'Peinture', finition: 'Finition',
  revetement: 'Revêtement', facade: 'Façade', enduit: 'Enduit',
  main_oeuvre: "Main-d'œuvre", materiaux: 'Matériaux', transport: 'Transport', divers: 'Divers',
};

const DOC_LABELS: Record<string, string> = {
  devis: 'DEVIS', facture: 'FACTURE', proforma: 'FACTURE PROFORMA',
  bc: 'BON DE COMMANDE', br: 'BON DE RÉCEPTION', bl: 'BON DE LIVRAISON',
  intervention: "RAPPORT D'INTERVENTION", attachement: "DÉCOMPTE D'ATTACHEMENT",
};

const CAT_ORDER = ['preparation', 'peinture', 'finition', 'revetement', 'facade', 'enduit', 'main_oeuvre', 'materiaux', 'transport', 'divers'];

function numFmt(n: number) {
  return n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateClassiqueHTML(params: {
  doc: DocumentState;
  results: CalculationResult;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  currency?: string;
  lang?: string;
}): string {
  const { doc, results, sf, bv, vb, lang = 'fr' } = params;
  const isAr = lang === 'ar';
  const dir = isAr ? ' dir="rtl"' : '';
  const arFont = isAr ? "'Noto Naskh Arabic'," : '';

  const e = (s: unknown) =>
    String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const isEnt = doc.mode === 'entreprise';
  const comp = doc.companyInfo;
  const art = doc.artisanInfo;
  const cli = doc.clientInfo;
  const currency = 'DA';

  const logoUrl = comp?.logo ?? '';
  const logoPos = doc.logoPosition ?? 'right';
  const logoSize = doc.logoSize ?? 'md';
  const logoMax = logoSize === 'sm' ? 'max-width:60px;max-height:40px' : logoSize === 'lg' ? 'max-width:200px;max-height:100px' : 'max-width:120px;max-height:70px';
  const logoImg = logoUrl ? `<img src="${logoUrl}" alt="Logo" style="object-fit:contain;${logoMax}" />` : '';

  const docLabel = DOC_LABELS[doc.documentType] ?? doc.documentType.toUpperCase();

  const companyName = isEnt && comp ? comp.name : art?.name ?? '';
  const companyAddr = isEnt && comp ? comp.address : art?.address ?? '';
  const companyPhone = doc.companyPhone ?? (art?.phone ?? '');
  const taxIds = isEnt && comp ? comp.taxIds : null;

  // Group items
  const grouped: Record<string, LineItem[]> = {};
  const uncategorized: LineItem[] = [];
  for (const item of doc.items) {
    if (item.category) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    } else {
      uncategorized.push(item);
    }
  }
  const allCats = [...CAT_ORDER, ...Object.keys(grouped).filter(c => !CAT_ORDER.includes(c))];
  const hasTva = results.tvaRate > 0;
  const colCount = hasTva ? 7 : 6;

  /* ── Item rows ── */
  let rowIdx = 0;
  function itemRow(item: LineItem): string {
    rowIdx++;
    const amount = item.quantity * item.unitPrice;
    const even = rowIdx % 2 === 0;
    return `<tr style="background:${even ? '#f9f9f9' : '#ffffff'};border-bottom:0.5px solid #cccccc">
      <td style="padding:4px;color:#888;font-weight:600;font-size:9px">${String(rowIdx).padStart(2, '0')}</td>
      <td style="padding:4px">
        <div style="font-weight:500;color:#111">${e(item.designation)}</div>
        ${item.description ? `<div style="font-size:8px;color:#888;font-style:italic">${e(item.description)}</div>` : ''}
      </td>
      <td style="padding:4px;text-align:center;color:#555">${e(UNIT_LABELS[item.unit] ?? item.unit)}</td>
      <td style="padding:4px;text-align:center;font-weight:600;color:#111">${item.quantity}</td>
      <td style="padding:4px;text-align:right;color:#555">${numFmt(item.unitPrice)}</td>
      ${hasTva ? `<td style="padding:4px;text-align:right;color:#555">${results.tvaRate}%</td>` : ''}
      <td style="padding:4px;text-align:right;font-weight:700;color:#111">${numFmt(amount)}</td>
    </tr>`;
  }

  let itemsRows = '';
  for (const item of uncategorized) itemsRows += itemRow(item);
  for (const cat of allCats) {
    const items = grouped[cat];
    if (!items) continue;
    const catLabel = CAT_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
    itemsRows += `<tr><td colspan="${colCount}" style="padding:5px 4px 2px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#555;border-bottom:1px solid #aaa">${e(catLabel)}</td></tr>`;
    for (const item of items) itemsRows += itemRow(item);
  }

  /* ── Total rows ── */
  const totalRow = (label: string, value: string) =>
    `<div style="display:flex;justify-content:space-between;padding-bottom:3px;font-size:10px;color:#555"><span>${e(label)}</span><span style="color:#111">${value}</span></div>`;

  /* ── Payment mode label ── */
  const payLabel = doc.paymentMode === 'cheque' ? 'Chèque'
    : doc.paymentMode === 'virement' ? 'Virement bancaire'
    : doc.paymentMode === 'especes' ? 'Espèces'
    : doc.paymentMode === 'cb' ? 'Carte bancaire'
    : doc.paymentMode;

  const showClient = vb('client') && bv('clientName', 'clientAddress', 'clientPhone', 'clientEmail');
  const hasClientTax = cli.nif || cli.nis || cli.rc || cli.ai;
  const hasRefs = doc.bcRef || doc.brRef || doc.reference || doc.deliveryRef;
  const showChantier = vb('chantier') && bv('chantierAddress', 'chantierType', 'chantierCondition', 'chantierSurface') && (doc.chantierAddress || doc.chantierType || doc.chantierSurface > 0);
  const showItems = vb('table') && sf('itemsTable') && doc.items.length > 0;
  const showGaranties = vb('garanties') && bv('garantieLabor', 'garantieMaterials', 'garantieNotes') && (doc.garantieMO || doc.garantieMateriaux || doc.garantieNotes);

  return `<!DOCTYPE html>
<html lang="${lang}"${dir}><head><meta charset="utf-8"><title>${e(docLabel)} - ${e(doc.documentNumber)}</title>
${isAr ? '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">' : ''}
<style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:${arFont}Arial,Helvetica,sans-serif;color:#111;font-size:11px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;margin:0 auto;padding:1.2cm 1.5cm;display:flex;flex-direction:column;background:#fff}
table{width:100%;border-collapse:collapse}
</style></head>
<body>
<div class="page">

  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:12px">
    <div style="flex:1">
      ${logoPos === 'left' && logoImg ? `<div style="margin-bottom:8px">${logoImg}</div>` : ''}
      ${companyName ? `<div style="font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;color:#111;line-height:1.2;margin-bottom:4px">${e(companyName)}</div>` : ''}
      ${doc.companyTagline ? `<div style="font-size:9px;color:#555;margin-bottom:4px;letter-spacing:0.04em">${e(doc.companyTagline)}</div>` : ''}
      ${companyAddr ? `<div style="font-size:9px;color:#555;margin-bottom:2px;white-space:pre-line">${e(companyAddr)}</div>` : ''}
      ${companyPhone ? `<div style="font-size:9px;color:#555">Tél : ${e(companyPhone)}</div>` : ''}
      ${isEnt && comp?.taxIds?.nif ? `<div style="font-size:9px;color:#555">Id Fiscal : ${e(comp.taxIds.nif)}</div>` : ''}
      ${doc.rib ? `<div style="font-size:9px;color:#555;margin-top:2px">RIB : ${e(doc.rib)}${doc.bankName ? ` — ${e(doc.bankName)}` : ''}${doc.bankAgency ? ` (${e(doc.bankAgency)})` : ''}</div>` : ''}
      ${doc.ccpNumber ? `<div style="font-size:9px;color:#555">CCP : ${e(doc.ccpNumber)}</div>` : ''}
    </div>
    <div style="text-align:right;flex-shrink:0">
      ${logoPos !== 'left' && logoImg ? `<div style="margin-bottom:8px;display:flex;justify-content:${logoPos === 'center' ? 'center' : 'flex-end'}">${logoImg}</div>` : ''}
      ${taxIds ? `<div style="font-size:9px;color:#555;line-height:1.7;text-align:right">
        ${taxIds.rc ? `<div><strong>RC :</strong> ${e(taxIds.rc)}</div>` : ''}
        ${taxIds.ai ? `<div><strong>AI :</strong> ${e(taxIds.ai)}</div>` : ''}
        ${taxIds.nis ? `<div><strong>NIS :</strong> ${e(taxIds.nis)}</div>` : ''}
        ${comp?.capital ? `<div><strong>Capital :</strong> ${e(comp.capital)}</div>` : ''}
      </div>` : ''}
      ${art?.phone && !isEnt ? `<div style="font-size:9px;color:#555">Tél : ${e(art.phone)}</div>` : ''}
    </div>
  </div>

  <!-- RULE -->
  <div style="border-top:1px solid #aaa;margin-bottom:10px"></div>

  <!-- TITLE + DATE -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
    <div>
      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:2px">${e(docLabel)}${doc.documentNumber ? ` N° ${e(doc.documentNumber)}` : ''}</div>
      ${doc.paymentMode ? `<div style="font-size:9px;color:#555">Mode de Paiement : ${e(payLabel)}</div>` : ''}
      ${doc.paymentDetails?.terms ? `<div style="font-size:9px;color:#555">Conditions : ${e(doc.paymentDetails.terms)}</div>` : ''}
    </div>
    <div style="text-align:right;font-size:10px;color:#555">
      <div><strong>Le :</strong> ${e(doc.date)}</div>
      ${doc.validUntil ? `<div><strong>Validité :</strong> ${e(doc.validUntil)}</div>` : ''}
      ${doc.deliveryDate ? `<div><strong>Livraison :</strong> ${e(doc.deliveryDate)}</div>` : ''}
      ${doc.docCity ? `<div style="font-size:9px">${e(doc.docCity)}</div>` : ''}
    </div>
  </div>

  <!-- CLIENT -->
  ${showClient ? `<div style="display:flex;justify-content:space-between;margin-bottom:10px;gap:16px">
    <div style="flex:1">
      <div style="font-size:9px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">DOIT</div>
      ${sf('clientName') && cli.name ? `<div style="font-size:12px;font-weight:700;color:#111">${e(cli.name)}</div>` : ''}
      ${sf('clientAddress') && cli.address ? `<div style="font-size:9px;color:#555;margin-top:2px;white-space:pre-line">${e(cli.address)}</div>` : ''}
      ${sf('clientPhone') && cli.phone ? `<div style="font-size:9px;color:#555">Tél : ${e(cli.phone)}</div>` : ''}
      ${sf('clientEmail') && cli.email ? `<div style="font-size:9px;color:#555">${e(cli.email)}</div>` : ''}
    </div>
    ${hasClientTax ? `<div style="text-align:right;font-size:9px;color:#555;line-height:1.7">
      ${sf('clientNif') && cli.nif ? `<div><strong>IF :</strong> ${e(cli.nif)}</div>` : ''}
      ${sf('clientNis') && cli.nis ? `<div><strong>NIS :</strong> ${e(cli.nis)}</div>` : ''}
      ${sf('clientRc') && cli.rc ? `<div><strong>RC :</strong> ${e(cli.rc)}</div>` : ''}
      ${sf('clientAi') && cli.ai ? `<div><strong>AI :</strong> ${e(cli.ai)}</div>` : ''}
    </div>` : ''}
  </div>` : ''}

  <!-- REFERENCES -->
  ${hasRefs ? `<div style="font-size:9px;color:#555;margin-bottom:6px;line-height:1.7">
    ${doc.bcRef ? `<div><strong>BON DE COMMANDE N° :</strong> ${e(doc.bcRef)}</div>` : ''}
    ${doc.brRef ? `<div><strong>BON DE RÉCEPTION N° :</strong> ${e(doc.brRef)}</div>` : ''}
    ${doc.reference ? `<div><strong>Réf. :</strong> ${e(doc.reference)}</div>` : ''}
    ${doc.deliveryRef ? `<div><strong>BL N° :</strong> ${e(doc.deliveryRef)}</div>` : ''}
    ${doc.deliveryDate ? `<div><strong>Date échéance :</strong> ${e(doc.deliveryDate)}</div>` : ''}
  </div>` : ''}

  <!-- OBJET -->
  ${doc.objet ? `<div style="margin-bottom:10px;border-left:3px solid #aaa;padding-left:8px">
    <div style="font-size:9px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">OBJET</div>
    <div style="font-size:10px;color:#111">${e(doc.objet)}</div>
  </div>` : ''}

  <!-- CHANTIER -->
  ${showChantier ? `<div style="margin-bottom:8px;font-size:9px;color:#555">
    ${doc.chantierAddress ? `<span><strong>Chantier :</strong> ${e(doc.chantierAddress)} </span>` : ''}
    ${doc.chantierType ? `<span>— ${e(doc.chantierType)} </span>` : ''}
    ${doc.chantierSurface > 0 ? `<span>— ${doc.chantierSurface} m²</span>` : ''}
  </div>` : ''}

  <!-- ITEMS TABLE -->
  ${showItems ? `<div style="margin-bottom:16px">
    <table style="font-size:10px">
      <thead>
        <tr style="background:#1c1c1c;color:#fff">
          <th style="padding:5px 4px;text-align:left;font-weight:700;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;width:28px">N°</th>
          <th style="padding:5px 4px;text-align:left;font-weight:700;font-size:8px;text-transform:uppercase;letter-spacing:0.05em">DÉSIGNATION</th>
          <th style="padding:5px 4px;text-align:center;font-weight:700;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;width:36px">UNITÉ</th>
          <th style="padding:5px 4px;text-align:center;font-weight:700;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;width:36px">QTÉ</th>
          <th style="padding:5px 4px;text-align:right;font-weight:700;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;width:64px">PU HT</th>
          ${hasTva ? `<th style="padding:5px 4px;text-align:right;font-weight:700;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;width:40px">TVA</th>` : ''}
          <th style="padding:5px 4px;text-align:right;font-weight:700;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;width:72px">MONTANT HT</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
  </div>` : ''}

  <!-- SPACER -->
  <div style="flex:1"></div>

  <!-- TOTALS -->
  <div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
      <div style="width:260px">
        <div style="border-top:1px solid #aaa;padding-top:8px">
          ${totalRow('Total HT', `${numFmt(results.subTotalHT)} ${currency}`)}
          ${results.discountAmount > 0 ? totalRow(`Remise${doc.discount.reason ? ` (${doc.discount.reason})` : ''}`, `- ${numFmt(results.discountAmount)} ${currency}`) : ''}
          ${hasTva ? totalRow(`TVA ${results.tvaRate}%`, `${numFmt(results.tvaAmount)} ${currency}`) : ''}
          ${totalRow('Timbre', `${numFmt(results.timbreFiscal)} ${currency}`)}
          ${results.acompte > 0 ? totalRow('Acompte versé', `- ${numFmt(results.acompte)} ${currency}`) : ''}
          <div style="border-top:2px solid #111;margin-top:4px;padding-top:4px;display:flex;justify-content:space-between">
            <span style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.04em">NET À PAYER</span>
            <span style="font-size:13px;font-weight:900">${numFmt(results.netAPayer)} ${currency}</span>
          </div>
        </div>
      </div>
    </div>

    ${vb('tafqit') && results.totalInWords ? `<div style="border-top:1px solid #ccc;padding-top:6px;margin-bottom:10px;font-size:9px;color:#555">
      <strong>Arrêtée la présente ${doc.documentType === 'devis' ? 'offre' : 'facture'} à la somme de :</strong>
      <div style="font-weight:600;color:#111;margin-top:2px">${e(results.totalInWords)}</div>
    </div>` : ''}

    ${vb('notes') && doc.notes ? `<div style="font-size:9px;color:#555;margin-bottom:8px;border-top:1px solid #ccc;padding-top:6px"><strong>Notes :</strong> ${e(doc.notes)}</div>` : ''}

    ${showGaranties ? `<div style="font-size:9px;color:#555;margin-bottom:8px">
      ${doc.garantieMO ? `<div>Garantie MO : ${e(doc.garantieMO)}</div>` : ''}
      ${doc.garantieMateriaux ? `<div>Garantie Matériaux : ${e(doc.garantieMateriaux)}</div>` : ''}
      ${doc.garantieNotes ? `<div style="font-style:italic">${e(doc.garantieNotes)}</div>` : ''}
    </div>` : ''}

    ${vb('signature') ? `<div style="display:flex;justify-content:flex-end;margin-top:16px;padding-top:8px;border-top:1px solid #ccc">
      <div style="text-align:center;min-width:140px">
        <div style="font-size:9px;color:#555;margin-bottom:4px">${e(doc.signatoryTitle || 'Signature et cachet')}</div>
        <div style="width:140px;height:60px;border:1px dashed #aaa;display:flex;align-items:center;justify-content:center">
          ${comp?.signature ? `<img src="${comp.signature}" style="max-width:100%;max-height:100%" alt="Signature" />` : `<span style="font-size:8px;color:#888">Signature / Cachet</span>`}
        </div>
        ${doc.signatoryName ? `<div style="font-size:8px;color:#555;margin-top:2px">${e(doc.signatoryName)}</div>` : ''}
      </div>
    </div>` : ''}

    <div style="text-align:center;font-size:7px;color:#888;margin-top:12px;border-top:0.5px solid #ccc;padding-top:4px">Document généré par CloudDevis</div>
  </div>

</div>
<script>
(function(){
  // Print only AFTER the page is fully loaded AND painted. With system fonts only,
  // document.fonts.ready resolves in ~0ms (no web fonts to await), which can fire
  // window.print() before the browser paints → a blank sheet. Waiting for 'load'
  // plus a double rAF + small timeout guarantees a painted page before printing.
  function doPrint(){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        setTimeout(function(){ try{ window.focus(); }catch(e){} window.print(); }, 250);
      });
    });
  }
  if (document.readyState === 'complete') doPrint();
  else window.addEventListener('load', doPrint);
})();
</script>
</body></html>`;
}
