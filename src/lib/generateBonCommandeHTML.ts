import type { DocumentState, CalculationResult } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { numberToFrenchWords } from '@/lib/calculations';

// PDF/print HTML for the Algerian public-procurement "Bon de Commande".
// Mirrors PreviewBonCommande (republic header, contrôle financier panel,
// service contractant / fournisseur blocks, nature & type de dépense, priced table).

const UNIT: Record<string, string> = { u: 'U', h: 'H', j: 'J', m2: 'M²', m3: 'M³', ml: 'ML', kg: 'KG', forfait: 'Forfait' };

export function generateBonCommandeHTML(params: {
  doc: DocumentState;
  results: CalculationResult;
  sf: (id: string) => boolean;
  bv: (...ids: string[]) => boolean;
  vb: (block: string) => boolean;
  tc: (key: string) => string;
  tp: (key: string, vars?: Record<string, string | number>) => string;
  currency: string;
  design: DocTypeDesign;
}) {
  const { doc, results, sf, vb, currency } = params;
  const e = (x: string) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const money = (n: number) => (n || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const C = { green: '#0B3D2E', gold: '#C4A35A', dark: '#1A1A1A', paper: '#F9F7F3', border: '#E4DED5' };
  const isEnt = doc.mode === 'entreprise';
  const co = doc.companyInfo;
  const tax: { nif?: string; nis?: string; rc?: string; ai?: string } = co?.taxIds ?? {};
  const bc = (doc.customFields?.bc ?? {}) as Record<string, unknown>;
  const financement = String(bc.financementSource ?? '');
  const nature = String(bc.naturePrestation ?? '');
  const depense = String(bc.typeDepense ?? '');
  const codeG = String(bc.codeGestionnaire ?? '');

  const chk = (on: boolean) => `<span style="width:16px;height:16px;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;${on ? `border:1.5px solid ${C.green};background:#EAF3DE;color:${C.green}` : 'border:1.5px solid #C8C2B5;color:transparent'}">${on ? '&#10003;' : ''}</span>`;
  const optRow = (selected: string, opts: [string, string][]) => opts.map(([v, l]) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">${chk(selected === v)}<span style="font-size:13px;color:${selected === v ? C.green : '#333'};font-weight:${selected === v ? 500 : 400}">${l}</span></div>`).join('');
  const natureRow = optRow(nature, [['travaux', 'Travaux'], ['fournitures', 'Fournitures'], ['services', 'Services']]);
  const depenseRow = optRow(depense, [['fonctionnement', 'D&eacute;penses de fonctionnement'], ['equipement', 'D&eacute;penses d&#39;&eacute;quipement'], ['autre', 'Autre']]);

  const rows = (sf('itemsTable') && vb('table')) ? doc.items.map((item, i) => `
    <tr style="border-bottom:1px solid #EDEAE4;background:${i % 2 === 1 ? '#FAFAF8' : 'transparent'}">
      <td style="padding:10px 12px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;color:#888">${String(i + 1).padStart(2, '0')}</td>
      <td style="padding:10px 12px;color:#1A1A1A;line-height:1.4"><span style="font-weight:500">${e(item.designation)}</span></td>
      <td style="padding:10px 12px;text-align:center">${UNIT[item.unit] ?? item.unit}</td>
      <td style="padding:10px 12px;text-align:center">${item.quantity}</td>
      <td style="padding:10px 12px;text-align:right;font-family:'JetBrains Mono',monospace">${money(item.unitPrice)}</td>
      <td style="padding:10px 12px;text-align:right;font-family:'JetBrains Mono',monospace">${money(item.quantity * item.unitPrice)}</td>
    </tr>`).join('') : '';

  const idK = `font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#888;margin-bottom:3px`;
  const idV = `font-size:13px;color:${C.dark};line-height:1.35`;
  const idHead = (n: string, title: string) => `<div style="display:flex;align-items:center;gap:10px;padding:8px 20px;background:${C.paper};border-bottom:1px solid ${C.border}"><span style="width:20px;height:20px;border-radius:50%;background:${C.green};color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600">${n}</span><span style="font-size:10px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:0.07em">${title}</span></div>`;
  const metaCell = (k: string, v: string, last: boolean) => `<div style="padding:10px 20px;${last ? '' : `border-right:1px solid ${C.border};`}display:flex;flex-direction:column;gap:3px"><span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#888">${k}</span><span style="font-size:13px;font-weight:500;color:${C.green};font-family:'JetBrains Mono',monospace">${v}</span></div>`;
  const taxCell = (k: string, v: string, border: string) => `<div style="padding:8px 20px;display:flex;align-items:baseline;gap:8px;${border}"><span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#888">${k}</span><span style="font-size:12px;font-family:'JetBrains Mono',monospace;color:${C.green}">${v}</span></div>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Bon de Commande - ${e(doc.documentNumber)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Helvetica,Arial,sans-serif;color:#1A1A1A;font-size:12px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:190mm;margin:0 auto;min-height:100vh;background:#fff;display:flex;flex-direction:column}
table.items{width:100%;border-collapse:collapse;font-size:12px}
table.items thead tr{background:${C.dark}}
table.items thead th{padding:9px 12px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#F5F1E8;white-space:nowrap}
@media print{.page{width:auto}}
</style></head><body><div class="page">
<div style="height:4px;background:linear-gradient(90deg,${C.green} 60%,${C.gold} 100%)"></div>
<div style="display:flex;align-items:center;justify-content:center;gap:16px;padding:14px 44px 12px;border-bottom:1px solid ${C.border}">
  <div style="width:46px;height:46px;border-radius:50%;border:1.5px solid #C8C2B5;display:flex;align-items:center;justify-content:center;font-size:20px;color:#666">&#9789;</div>
  <div><div style="font-size:13px;font-weight:600;color:${C.dark};direction:rtl;margin-bottom:2px">&#1575;&#1604;&#1580;&#1605;&#1607;&#1608;&#1585;&#1610;&#1577; &#1575;&#1604;&#1580;&#1586;&#1575;&#1574;&#1585;&#1610;&#1577; &#1575;&#1604;&#1583;&#1610;&#1605;&#1602;&#1585;&#1575;&#1591;&#1610;&#1577; &#1575;&#1604;&#1588;&#1593;&#1576;&#1610;&#1577;</div><div style="font-size:11px;color:#666;letter-spacing:0.04em">R&#233;publique Alg&#233;rienne D&#233;mocratique et Populaire</div></div>
</div>
<div style="background:${C.dark};padding:11px 44px;display:flex;align-items:center;justify-content:space-between">
  <h1 style="font-size:14px;font-weight:600;color:#F5F1E8;letter-spacing:0.14em;text-transform:uppercase">Bon de Commande</h1>
  <span style="font-size:11px;color:rgba(245,241,232,.55);font-family:'JetBrains Mono',monospace">${e(doc.documentNumber)}${doc.date ? ` &middot; ${e(doc.date)}` : ''}</span>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid ${C.border}">
  ${metaCell('Num&#233;ro', e(doc.documentNumber), false)}${metaCell("Date d'&#233;mission", e(doc.date), false)}${metaCell('Source de financement', financement ? e(financement) : '&mdash;', true)}
</div>
<div style="display:grid;grid-template-columns:155px 1fr;border-bottom:1px solid ${C.border}">
  <div style="border-right:1px solid ${C.border};padding:16px 14px;background:${C.paper}">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin-bottom:12px;text-align:center;padding-bottom:8px;border-bottom:1px solid ${C.border}">Contr&#244;le financier</div>
    ${['Au service du', 'Le', '&#192;'].map(l => `<div style="margin-bottom:10px"><span style="font-size:10px;color:#888;margin-bottom:4px;display:block">${l}</span><div style="height:24px;border-bottom:1px solid #DDD8CF"></div></div>`).join('')}
    <div style="margin-top:14px;border:1px dashed #C8C2B5;border-radius:6px;padding:14px 8px;text-align:center;color:#AAA;font-size:11px;font-style:italic;line-height:1.4">Espace visa<br>contr&#244;le financier</div>
  </div>
  <div>
    <div style="border-bottom:1px solid ${C.border}">${idHead('1', 'Service Contractant &mdash; Donneur d&#39;ordre')}
      <div style="padding:14px 20px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px">
        <div><div style="${idK}">D&#233;nomination</div><div style="${idV};font-weight:600;color:${C.green}">${e(doc.clientInfo.name) || '&mdash;'}</div></div>
        ${codeG ? `<div><div style="${idK}">Code gestionnaire</div><div style="${idV};font-family:'JetBrains Mono',monospace">${e(codeG)}</div></div>` : ''}
        ${doc.clientInfo.address ? `<div><div style="${idK}">Adresse</div><div style="${idV}">${e(doc.clientInfo.address)}</div></div>` : ''}
        ${doc.clientInfo.phone ? `<div><div style="${idK}">T&#233;l&#233;phone / Fax</div><div style="${idV};font-family:'JetBrains Mono',monospace">${e(doc.clientInfo.phone)}</div></div>` : ''}
      </div></div>
    </div>
    <div style="border-bottom:1px solid ${C.border}">${idHead('2', 'Prestataire / Fournisseur')}
      <div style="padding:14px 20px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px">
        <div><div style="${idK}">Raison sociale</div><div style="${idV};font-weight:600;color:${C.green}">${e((isEnt && co?.name) || doc.clientInfo.name) || '&mdash;'}</div></div>
        ${co?.address ? `<div><div style="${idK}">Adresse</div><div style="${idV}">${e(co.address)}</div></div>` : ''}
        ${doc.companyPhone ? `<div><div style="${idK}">T&#233;l&#233;phone / Fax</div><div style="${idV};font-family:'JetBrains Mono',monospace">${e(doc.companyPhone)}</div></div>` : ''}
        ${co?.capital ? `<div><div style="${idK}">Capital</div><div style="${idV}">${e(co.capital)}</div></div>` : ''}
      </div></div>
      ${(tax.nif || tax.nis || tax.rc || doc.rib) ? `<div style="display:grid;grid-template-columns:1fr 1fr;background:${C.paper};border-top:1px solid ${C.border}">
        ${tax.nif ? taxCell('N.I.F.', e(tax.nif), `border-right:1px solid ${C.border}`) : ''}
        ${tax.nis ? taxCell('N.I.S.', e(tax.nis), '') : ''}
        ${tax.rc ? taxCell('N&#176; RC', e(tax.rc), `border-right:1px solid ${C.border};border-top:1px solid ${C.border}`) : ''}
        ${doc.rib ? taxCell('RIB', e(doc.rib), `border-top:1px solid ${C.border}`) : ''}
      </div>` : ''}
    </div>
    <div>${idHead('3', 'Caract&#233;ristiques &amp; Objet de la commande')}
      <div style="display:grid;grid-template-columns:1fr 1fr">
        <div style="padding:14px 20px;border-right:1px solid ${C.border}"><div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#888;margin-bottom:10px">Nature de prestation</div>${natureRow}</div>
        <div style="padding:14px 20px"><div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#888;margin-bottom:10px">Type de d&#233;pense</div>${depenseRow}</div>
        ${doc.objet ? `<div style="grid-column:1/-1;border-top:1px solid ${C.border};padding:14px 20px"><div style="background:#FDFAF4;border-left:3px solid ${C.gold};border-radius:0 5px 5px 0;padding:10px 14px;font-size:13px;color:#333;line-height:1.6"><span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${C.gold};display:block;margin-bottom:4px">Objet d&#233;taill&#233;</span>${e(doc.objet)}</div></div>` : ''}
      </div>
    </div>
  </div>
</div>
${rows ? `<table class="items"><thead><tr><th style="width:38px;text-align:left">N&#176;</th><th style="text-align:left">D&#233;signation</th><th style="width:46px;text-align:center">Unit&#233;</th><th style="width:58px;text-align:center">Quantit&#233;</th><th style="width:130px;text-align:right">Prix unitaire</th><th style="width:130px;text-align:right">Montant HT</th></tr></thead><tbody>${rows}</tbody></table>` : ''}
<div style="display:grid;grid-template-columns:1fr 240px;border-top:1px solid ${C.border}">
  <div style="padding:18px 20px;border-right:1px solid ${C.border}">
    <div style="background:#FDFAF4;border-left:3px solid ${C.gold};border-radius:0 5px 5px 0;padding:11px 14px;margin-bottom:14px"><span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#888;display:block;margin-bottom:4px">Arr&#234;t&#233;e la pr&#233;sente commande &#224; la somme de</span><div style="font-size:12px;font-style:italic;color:#333;line-height:1.55">${e(numberToFrenchWords(results.totalTTC))} (${money(results.totalTTC)} ${currency})</div></div>
    ${(sf('notes') && doc.notes) ? `<div style="font-size:11px;color:#666;line-height:1.7"><span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${C.green};display:block;margin-bottom:5px">Conditions &amp; engagements</span>${e(doc.notes)}</div>` : ''}
  </div>
  <div style="padding:18px 20px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;border-bottom:1px solid #EDEAE4;font-size:13px"><span style="color:#666">Montant HT</span><span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:500">${money(results.subTotalHT)} ${currency}</span></div>
    ${results.tvaRate > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;border-bottom:2px solid ${C.dark};font-size:13px"><span style="color:#666">TVA (${results.tvaRate}%)</span><span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:500">${money(results.tvaAmount)} ${currency}</span></div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:baseline;padding:10px 0 0;margin-top:2px"><span style="font-weight:600;font-size:14px;color:${C.green}">Montant TTC</span><span style="font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:${C.green}">${money(results.totalTTC)} ${currency}</span></div>
  </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;border-top:1px solid ${C.border};padding:22px 44px 28px">
  <div style="text-align:center;border-right:1px dashed #C8C2B5;padding-right:32px">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${C.green};margin-bottom:2px">Le service co-contractant</div>
    <div style="font-size:11px;color:#888;margin-bottom:12px">Signature &amp; cachet du prestataire</div>
    <div style="height:66px;border-bottom:1px solid #C8C2B5;margin-bottom:10px"></div>
    <div style="font-size:12px;color:#333;font-weight:500">${e((isEnt && co?.name) || 'Le G&#233;rant')}</div>
  </div>
  <div style="text-align:center;padding-left:32px">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${C.green};margin-bottom:2px">Le service contractant</div>
    <div style="font-size:11px;color:#888;margin-bottom:12px">${doc.docCity ? `&#192; ${e(doc.docCity)}, le ................` : 'Signature &amp; cachet'}</div>
    <div style="height:66px;border-bottom:1px solid #C8C2B5;margin-bottom:10px"></div>
    <div style="font-size:12px;color:#333;font-weight:500">${e(doc.clientInfo.name) || 'Le Directeur'}</div>
  </div>
</div>
<div style="background:${C.paper};border-top:1px solid ${C.border};padding:11px 44px;font-size:11px;color:#999;text-align:center;font-family:'JetBrains Mono',monospace;line-height:1.8">
  <strong style="font-family:'Inter',sans-serif;color:#777">R&#233;f. :</strong> ${e(doc.documentNumber)}${tax.nif ? ` &middot; <strong style="font-family:'Inter',sans-serif;color:#777">N.I.F. :</strong> ${e(tax.nif)}` : ''}${tax.rc ? ` &middot; <strong style="font-family:'Inter',sans-serif;color:#777">RC :</strong> ${e(tax.rc)}` : ''}<br>Document g&#233;n&#233;r&#233; par <strong style="font-family:'Inter',sans-serif;color:#777">CloudDevis</strong>
</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>
</body></html>`;
}
