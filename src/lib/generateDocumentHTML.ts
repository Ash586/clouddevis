import type { LineItem, DocumentState, CalculationResult, CustomSectionDef } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';

export function generateDocumentHTML(params: {
  isEnt: boolean;
  docTypeLabel: string;
  design: DocTypeDesign;
  vb: (block: string) => boolean;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  catLabels: Record<string, string>;
  paymentLabels: Record<string, string>;
  unitLabels: Record<string, string>;
  grouped: Record<string, LineItem[]>;
  uncategorized: LineItem[];
  catOrder: string[];
  doc: DocumentState;
  results: CalculationResult;
  tc: (key: string) => string;
  tp: (key: string, vars?: Record<string, string | number>) => string;
  te: (key: string) => string;
  tu: (key: string) => string;
  customSections: CustomSectionDef[];
  currency: string;
  companyTagline?: string;
  companyCapital?: string;
  rcNumber?: string;
  nisNumber?: string;
  aiNumber?: string;
  rib?: string;
  bankName?: string;
  bankAgency?: string;
  ccpNumber?: string;
  validityDays?: number;
  reference?: string;
}) {
  const { isEnt, docTypeLabel, design, vb, sf, bv, catLabels, paymentLabels, unitLabels, grouped, uncategorized, catOrder, doc, results, tc, tp, te, tu, customSections, currency, companyTagline, companyCapital, rcNumber, nisNumber, aiNumber, rib, bankName, bankAgency, ccpNumber, validityDays, reference } = params;

  const escHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

  function itemRow(item: LineItem, idx: number): string {
    return `<tr>
      <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:9px;text-align:center;color:#94a3b8;font-weight:700;width:22px">${idx}</td>
      <td style="padding:5px 6px;border-bottom:1px solid #e2e8f0;font-size:10px">${escHtml(item.designation)}</td>
      <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:center;white-space:nowrap">${item.quantity}</td>
      <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:9px;text-align:center;color:#64748b;white-space:nowrap">${unitLabels[item.unit]||item.unit}</td>
      <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:right;white-space:nowrap">${item.unitPrice.toLocaleString('fr-DZ')}</td>
      <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:right;font-weight:600;white-space:nowrap">${(item.quantity*item.unitPrice).toLocaleString('fr-DZ')} ${currency}</td>
    </tr>`;
  }

  const S = (sel: string, rules: string) => `${sel}{${rules}}`;
  const css = `
    ${S('@page','size:A4;margin:0')}
    ${S('*','margin:0;padding:0;box-sizing:border-box')}
    ${S('body','font-family:Helvetica,Arial,sans-serif;color:#1e293b;font-size:11px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact')}
    ${S('.page','width:190mm;margin:0 auto;padding:45px 50px 30px;min-height:100vh;display:flex;flex-direction:column')}
    ${S('.top-section','flex:1')}
    ${S('.header','display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px')}
    ${S('.header .brand','display:flex;align-items:flex-start;gap:12px')}
    ${S('.header .brand .logo','max-width:120px;max-height:60px;object-fit:contain')}
    ${S('.header .brand h1','font-size:26px;font-weight:900;color:'+design.primaryDark+';letter-spacing:-0.5px;margin:0;text-transform:uppercase')}
    ${S('.header .brand .sub','font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-top:1px')}
    ${S('.header .meta-logo','text-align:right;margin-bottom:6px')}
    ${S('.header .meta-logo img','max-width:120px;max-height:60px;object-fit:contain')}
    ${S('.header .meta','text-align:right')}
    ${S('.header .meta .num','font-size:18px;font-weight:900;color:'+design.primaryDark+';margin-bottom:4px')}
    ${S('.header .meta .line','font-size:10px;color:#64748b;margin:1px 0')}
    ${S('.hr','height:2px;background:linear-gradient(to right,'+design.primaryHex+',#e2e8f0);margin-bottom:24px;border:none')}
    ${S('.info-grid','display:flex;gap:30px;margin-bottom:24px')}
    ${S('.info-grid .col','flex:1')}
    ${S('.info-grid .col .ttl','font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px')}
    ${S('.info-grid .col .val','font-size:11px;color:#1e293b;line-height:1.5')}
    ${S('.info-grid .col .val strong','font-size:12px')}
    ${S('.info-grid .col .val .muted','font-size:10px;color:#64748b')}
    ${S('.section-box','margin-bottom:18px;padding:12px 14px;border-radius:8px;max-width:420px')}
    ${S('.section-box .ttl','font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px')}
    ${S('.section-box p','font-size:10px;margin:1px 0;line-height:1.5')}
    ${S('.section-box p .lb','font-weight:600;color:#475569')}
    ${S('table.items','width:100%;border-collapse:collapse;margin:18px 0 20px')}
    ${S('table.items thead th','padding:6px 4px;font-size:8px;font-weight:800;color:'+design.primaryHex+';text-transform:uppercase;letter-spacing:1px;background:'+design.primaryLight+';border-bottom:2px solid '+design.primaryHex)}
    ${S('table.items thead th:first-child','text-align:center;width:22px')}
    ${S('table.items thead th:nth-child(2)','text-align:left')}
    ${S('table.items thead th:nth-child(3)','text-align:center;width:32px')}
    ${S('table.items thead th:nth-child(4)','text-align:center;width:28px')}
    ${S('table.items thead th:nth-child(5)','text-align:right;width:62px')}
    ${S('table.items thead th:nth-child(6)','text-align:right;width:72px')}
    ${S('.bottom-section','margin-top:auto;padding-top:20px;border-top:1px solid #e2e8f0')}
    ${S('.bottom-section .inner','display:flex;justify-content:space-between;align-items:flex-start;gap:30px')}
    ${S('.bottom-section .left','flex:1;max-width:320px;font-size:8px;color:#94a3b8;line-height:1.6')}
    ${S('.bottom-section .left .card','padding:8px 10px;border-radius:6px;margin-bottom:6px;border:1px solid #e2e8f0')}
    ${S('.bottom-section .right','width:250px;flex-shrink:0')}
    ${S('.totals-table','width:100%;font-size:10px')}
    ${S('.totals-table td','padding:3px 0')}
    ${S('.totals-table .lbl','color:#64748b')}
    ${S('.totals-table .val','text-align:right;font-weight:600;color:#1e293b')}
    ${S('.totals-table .ttr td','padding:4px 0 1px;font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px')}
    ${S('.totals-table .sep td','padding:0;height:1px;background:#e2e8f0')}
    ${S('.totals-table .disc td.val','color:#ef4444')}
    ${S('.totals-table .grand td','padding-top:8px;border-top:2px solid '+design.primaryHex)}
    ${S('.totals-table .grand .lbl','font-size:11px;font-weight:800;color:'+design.primaryDark+';text-transform:uppercase')}
    ${S('.totals-table .grand .val','font-size:16px;font-weight:900;color:'+design.primaryDark)}
    ${S('.totals-table .inwords','font-size:8px;font-style:italic;color:#94a3b8;text-align:right;padding-top:3px')}
    ${S('.top-bar','height:12px;background:'+design.primaryHex+';margin-bottom:0')}
    ${S('.signature','margin-top:20px;padding-top:14px;border-top:1.5px solid '+design.primaryHex+';display:flex;justify-content:space-between;align-items:flex-end')}
    ${S('.signature .loc','font-size:9px;color:#64748b;font-weight:500')}
    ${S('.signature .stamp','text-align:right')}
    ${S('.signature .stamp .lbl2','font-size:8px;color:#94a3b8;margin-bottom:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px')}
    ${S('.signature .stamp .box','width:110px;height:52px;border:2px solid #cbd5e1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#cbd5e1;background:#f8fafc')}
    ${S('.rib-block','padding:8px 10px;border-radius:6px;margin-bottom:6px;border:1px solid #fde68a;background:#fffbeb')}
    ${S('.rib-block strong','font-size:9px;color:#d97706')}
    ${S('.rib-block span','display:block;font-size:8px;color:#475569;line-height:1.5')}
    ${S('.validity-banner','padding:8px 10px;border-radius:6px;margin-bottom:6px;border:1px solid #fde68a;background:#FEF3C7')}
    ${S('.validity-banner span','font-size:9px;color:#92400e;font-weight:700')}
    ${S('.print-footer','text-align:center;font-size:7px;color:#94a3b8;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:8px;letter-spacing:0.3px')}
    ${S('@media print','.page{padding:30px 40px 20px;box-shadow:none}')}
  `;

  const s = (v: string) => escHtml(v);
  const fmt = (n: number) => n.toLocaleString('fr-DZ');
  const logoUrl = isEnt && doc.companyInfo?.logo ? doc.companyInfo.logo : null;
  const logoPos = doc.logoPosition ?? 'right';

  let idx = 0;
  const tbody: string[] = [];
  for (const item of uncategorized) { idx++; tbody.push(itemRow(item, idx)); }
  for (const cat of catOrder) {
    const items = grouped[cat]; if (!items) continue;
    const label = catLabels[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
    tbody.push(`<tr><td colspan="6" style="padding:10px 4px 3px;border:none"><div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:` + design.accent + `">` + label + `</div></td></tr>`);
    for (const item of items) { idx++; tbody.push(itemRow(item, idx)); }
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>` + docTypeLabel + ` - ` + s(doc.documentNumber) + `</title>
<style>` + css + `</style></head><body>
<div class="page">

<div class="top-bar"></div>

<div class="top-section">
  <div class="header">
    <div class="brand">
      ` + (logoUrl && logoPos === 'left' ? `<img class="logo" src="` + s(logoUrl) + `" alt="Logo" />` : '') + `
      <div>
        <h1>` + docTypeLabel + `</h1>
        <div class="sub">${tc('appName')}</div>
      </div>
    </div>
    <div>
      ` + (logoUrl && logoPos === 'right' ? `<div class="meta-logo"><img src="` + s(logoUrl) + `" alt="Logo" /></div>` : '') + `
      <div class="meta">
        ` + (sf('docNumber') ? `<div class="num">` + s(doc.documentNumber) + `</div>` : '') + `
        ` + (reference ? `<div class="line">Réf: ` + s(reference) + `</div>` : '') + `
        ` + (sf('issueDate') ? `<div class="line">${tp('issueDate')} ` + doc.date + `</div>` : '') + `
        ` + (sf('validUntil') && doc.validUntil ? `<div class="line">${tp('validUntil')} ` + doc.validUntil + `</div>` : '') + `
        ` + (sf('orderRef') && doc.bcRef ? `<div class="line">${tp('orderRef')} ` + s(doc.bcRef) + `</div>` : '') + `
      </div>
    </div>
  </div>
  <div class="hr"></div>

  <div class="info-grid">
    <div class="col">
      <div class="ttl">${tc('company')}</div>
      <div class="val">
        ` + (isEnt && doc.companyInfo ? `
          <strong>` + s(doc.companyInfo.name) + `</strong><br>
          ` + (companyTagline ? `<span class="muted" style="font-style:italic">` + s(companyTagline) + `</span><br>` : '') + `
          ` + (doc.companyInfo.address ? `<span class="muted">` + s(doc.companyInfo.address) + `</span><br>` : '') + `
          ` + (companyCapital ? `<span class="muted">Au Capital Social de ` + s(companyCapital) + `</span><br>` : '') + `
          ` + (doc.companyInfo.taxIds.nif ? `<span class="muted">${te('client.companyNif')} : ` + s(doc.companyInfo.taxIds.nif) + `</span><br>` : '') + `
          ` + (doc.companyInfo.taxIds.rc ? `<span class="muted">${te('client.companyRc')} : ` + s(doc.companyInfo.taxIds.rc) + `</span><br>` : '') + `
          ` + (doc.companyInfo.taxIds.nis ? `<span class="muted">${te('client.companyNis')} : ` + s(doc.companyInfo.taxIds.nis) + `</span><br>` : '') + `
          ` + (doc.companyInfo.taxIds.ai ? `<span class="muted">${te('client.companyAi')} : ` + s(doc.companyInfo.taxIds.ai) + `</span>` : '') + `
          ` + (rcNumber ? `<span class="muted">R.C. : ` + s(rcNumber) + `</span><br>` : '') + `
          ` + (nisNumber ? `<span class="muted">NIS : ` + s(nisNumber) + `</span><br>` : '') + `
          ` + (aiNumber ? `<span class="muted">N°AI : ` + s(aiNumber) + `</span>` : '') + `
        ` : doc.artisanInfo ? `
          <strong>` + s(doc.artisanInfo.name) + `</strong><br>
          ` + (doc.artisanInfo.address ? `<span class="muted">` + s(doc.artisanInfo.address) + `</span><br>` : '') + `
          ` + (doc.artisanInfo.phone ? `<span class="muted">${tc('phone')} : ` + s(doc.artisanInfo.phone) + `</span>` : '') + `
        ` : `<strong>CloudDevis</strong>`) + `
      </div>
    </div>
    <div class="col">
      <div class="ttl">${tc('client')}</div>
      <div class="val">
        ` + (sf('clientName') ? `<strong>` + s(doc.clientInfo.name) + `</strong><br>` : '') + `
        ` + (sf('clientAddress') && doc.clientInfo.address ? `<span class="muted">` + s(doc.clientInfo.address) + `</span><br>` : '') + `
        ` + (doc.clientInfo.nif ? `<span class="muted">${te('client.companyNif')} : ` + s(doc.clientInfo.nif) + `</span><br>` : '') + `
        ` + (sf('clientPhone') && doc.clientInfo.phone ? `<span class="muted">` + s(doc.clientInfo.phone) + `</span><br>` : '') + `
        ` + (sf('clientEmail') && doc.clientInfo.email ? `<span class="muted">` + s(doc.clientInfo.email) + `</span>` : '') + `
      </div>
    </div>
  </div>

  ` + (vb('chantier') && bv('chantierAddress','chantierType','chantierCondition','chantierSurface','chantierProtection') ? `
  <div class="section-box" style="background:#fffbeb;border:1px solid #fde68a">
    <div class="ttl" style="color:#d97706">${tp('chantier')}</div>
    ` + (sf('chantierAddress') && doc.chantierAddress ? `<p><span class="lb">${tp('chantierAddress')}</span> ` + s(doc.chantierAddress) + `</p>` : '') + `
    ` + (sf('chantierType') && doc.chantierType ? `<p><span class="lb">${tp('chantierType')}</span> ` + s(doc.chantierType) + `</p>` : '') + `
    ` + (sf('chantierSurface') && doc.chantierSurface > 0 ? `<p><span class="lb">${tp('chantierSurface')}</span> ` + doc.chantierSurface + ` m²</p>` : '') + `
    ` + (sf('chantierCondition') && doc.chantierEtat ? `<p><span class="lb">${tp('chantierCondition')}</span> ` + s(doc.chantierEtat) + `</p>` : '') + `
    ` + (sf('chantierProtection') && doc.chantierProtection ? `<p><span class="lb">${tp('chantierProtection')}</span> ` + s(doc.chantierProtection) + `</p>` : '') + `
  </div>` : '') + `

  ` + (vb('materiaux') && bv('materiauxBrand','materiauxType','materiauxColor','materiauxQte') ? `
  <div class="section-box" style="background:#f0f9ff;border:1px solid #bae6fd">
    <div class="ttl" style="color:#0284c7">${tp('materiaux')}</div>
    ` + (sf('materiauxBrand') && doc.materiauxMarque ? `<p><span class="lb">${tp('materiauxBrand')}</span> ` + s(doc.materiauxMarque) + `</p>` : '') + `
    ` + (sf('materiauxType') && doc.materiauxType ? `<p><span class="lb">${tp('materiauxType')}</span> ` + s(doc.materiauxType) + `</p>` : '') + `
    ` + (sf('materiauxColor') && doc.materiauxCouleur ? `<p><span class="lb">${tp('materiauxColor')}</span> ` + s(doc.materiauxCouleur) + `</p>` : '') + `
    ` + (sf('materiauxQte') && doc.materiauxQte > 0 ? `<p><span class="lb">${tp('materiauxQuantity')}</span> ` + doc.materiauxQte + ` L / m²</p>` : '') + `
  </div>` : '') + `

  ` + (vb('table') && sf('itemsTable') && doc.items.length ? `
  <table class="items">
    <thead><tr>
      <th>${tp('tableHash')}</th><th>${tp('tableDescription')}</th><th>${tp('tableQty')}</th><th>${tu('u')}</th><th>${tp('tableUnitPrice')}</th><th>${tp('tableTotalHT')}</th>
    </tr></thead>
    <tbody>` + tbody.join('') + `</tbody>
  </table>` : '') + `
</div>

<div class="bottom-section">
  <div class="inner">
    <div class="left">
      ` + (rib ? `
      <div class="card" style="background:#fffbeb;border-color:#fde68a">
        <strong style="font-size:9px;color:#d97706">RIB</strong><br>
        <span style="color:#475569">RIB: ` + s(rib) + `</span><br>
        ` + (bankName ? `<span style="color:#475569">Banque: ` + s(bankName) + `</span><br>` : '') + `
        ` + (bankAgency ? `<span style="color:#475569">Agence: ` + s(bankAgency) + `</span><br>` : '') + `
        ` + (ccpNumber ? `<span style="color:#475569">CCP: ` + s(ccpNumber) + `</span>` : '') + `
      </div>` : '') + `
      ` + (validityDays ? `
      <div class="card" style="background:#FEF3C7;border-color:#fde68a">
        <span style="color:#92400e;font-weight:700">Ce devis est valable ` + validityDays + ` jours à compter de la date d'émission.</span>
      </div>` : '') + `
      ` + (vb('garanties') && bv('garantieLabor','garantieMaterials','garantieNotes') ? `
      <div class="card" style="background:#f0fdf4;border-color:#bbf7d0">
        <strong style="font-size:9px;color:#15803d">${tp('garanties')}</strong><br>
        ` + (sf('garantieLabor') && doc.garantieMO ? `<span style="color:#166534">${tp('garantiesMO')} ` + s(doc.garantieMO) + `</span><br>` : '') + `
        ` + (sf('garantieMaterials') && doc.garantieMateriaux ? `<span style="color:#166534">${tp('garantiesMaterials')} ` + s(doc.garantieMateriaux) + `</span><br>` : '') + `
        ` + (sf('garantieNotes') && doc.garantieNotes ? `<span style="color:#15803d;font-style:italic">` + s(doc.garantieNotes) + `</span>` : '') + `
      </div>` : '') + `
      ` + (vb('payment') && bv('paymentMethod','paymentDeposit','paymentConditions','paymentIban') ? `
      <div class="card" style="background:#f8fafc">
        ` + (sf('paymentMethod') && doc.paymentMode ? `<span style="color:#475569"><strong>${te('paiement.method')} :</strong> ` + (paymentLabels[doc.paymentMode] ?? doc.paymentMode) + `</span><br>` : '') + `
        ` + (sf('paymentConditions') && doc.paymentDetails.terms ? `<span style="color:#475569"><strong>${tp('paymentLabel')}</strong> ` + s(doc.paymentDetails.terms) + `</span><br>` : '') + `
        ` + (sf('paymentIban') && doc.paymentDetails.iban ? `<span style="color:#64748b"><strong>${tp('ibanLabel')}</strong> ` + s(doc.paymentDetails.iban) + `</span>` : '') + `
      </div>` : '') + `
      ` + (vb('legal') ? `
      <div class="card" style="background:#f8fafc">
        <span style="color:#475569">${tp('legalRecovery')}</span><br>
        <span style="color:#64748b">${tp('legalRetention')}</span>
      </div>` : '') + `
      ` + customSections.map((cs) => {
        const sectionData = doc.customFields?.[cs.id] as Record<string, unknown> | undefined;
        const visibleFields = cs.fields.filter((f) => sf(`custom_${cs.id}_${f.id}`));
        const hasVisibleData = sectionData && visibleFields.some((f) => { const v = sectionData[f.id]; return v !== undefined && v !== null && v !== ''; });
        if (vb(cs.id) && hasVisibleData) {
          return `<div class="card" style="background:#f8fafc">
            <strong style="font-size:9px;color:#475569">${ s(cs.label) }</strong><br>
            ` + visibleFields.filter((f) => { const v = sectionData[f.id]; return v !== undefined && v !== null && v !== ''; }).map((f) => `<span style="color:#64748b"><strong>${ s(f.label) } :</strong> ${ s(sectionData[f.id] as string) }</span><br>`).join('') + `
          </div>`;
        }
        return '';
      }).join('') + `
    </div>

    <div class="right">
      <table class="totals-table">
        <tr><td class="lbl">${tp('totalHT')}</td><td class="val">` + fmt(results.subTotalHT) + ` ${currency}</td></tr>
        ` + (vb('remise') && bv('remiseType','remiseValue','remiseReason') && results.discountAmount > 0 ? `<tr class="disc"><td class="lbl">${tp('remise')}` + (doc.discount.reason ? ' (' + s(doc.discount.reason) + ')' : '') + `</td><td class="val">-` + fmt(results.discountAmount) + ` ${currency}</td></tr>` : '') + `
        ` + (results.tvaRate > 0 ? `<tr class="ttr"><td colspan="2">${tp('vatLine', { rate: results.tvaRate })}</td></tr>
        <tr><td class="lbl">${tp('taxTableBase')}</td><td class="val">` + fmt(results.subTotalHT) + ` ${currency}</td></tr>
        <tr><td class="lbl">${tp('taxTableAmount')}</td><td class="val">` + fmt(results.tvaAmount) + ` ${currency}</td></tr>` : '') + `
        ` + (results.timbreFiscal > 0 ? `<tr class="sep"><td colspan="2"></td></tr>
        <tr><td class="lbl">${tp('stampDuty')}</td><td class="val">` + fmt(results.timbreFiscal) + ` ${currency}</td></tr>` : '') + `
        ` + (results.acompte > 0 ? `<tr class="disc"><td class="lbl">${tp('depositPaid')}</td><td class="val">-` + fmt(results.acompte) + ` ${currency}</td></tr>` : '') + `
        <tr class="grand"><td class="lbl">${tp('netToPay')}</td><td class="val">` + fmt(results.netAPayer) + ` ${currency}</td></tr>
      </table>
      <div class="inwords">` + results.totalInWords + `</div>
    </div>
  </div>

  ` + (vb('signature') ? `
  <div class="signature">
    <div class="loc">${tp('signatureLine', { city: doc.companyInfo?.address?.split(',')[0] ?? '________', date: doc.date })}</div>
    <div class="stamp">
      <div class="lbl2">${tp('signatureLabel')}</div>
      <div class="box">` + (doc.companyInfo?.signature ? `<img src="` + s(doc.companyInfo.signature) + `" style="max-width:100%;max-height:100%"/>` : tp('signatureStamp')) + `</div>
    </div>
  </div>` : '') + `

  <div class="print-footer">${tp('footer')}` + (doc.paymentDetails?.iban ? `<span style="margin:0 8px">|</span>IBAN: ${s(doc.paymentDetails.iban)}` : '') + `</div>
</div>

</div>
<script>
window.onload=function(){setTimeout(function(){window.print();},300);};
</script>
</body></html>`;
}

const catLabelsMap: Record<string, string> = {
  preparation: 'Préparation', peinture: 'Peinture', finition: 'Finition',
  revetement: 'Revêtement', facade: 'Façade', enduit: 'Enduit',
  main_oeuvre: 'Main d\'Œuvre', materiaux: 'Matériaux', transport: 'Transport',
  divers: 'Divers',
};
const unitLabelsMap: Record<string, string> = { u:'U', h:'H', j:'J', m2:'M²', m3:'M³', ml:'ML', kg:'KG', forfait:'Forfait' };

export function generateAttachementHTML(params: {
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
  const { doc, sf, bv, vb, tc, tp, design } = params;
  const escHtml = (x: string) => x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const e = (v: string) => escHtml(v);
  const A = { navy:'#1A3A6B', navyLight:'#EEF3FB', navyMid:'#2E60B0', gold:'#C4A35A', green:'#0B3D2E', beige:'#C8C3BA', paperBg:'#F9F8F5', border:'#E4DED5', dark:'#1A1A1A' };
  const isEnt = doc.mode === 'entreprise';
  const catOrder = ['preparation','peinture','finition','revetement','facade','enduit','main_oeuvre','materiaux','transport','divers'];

  const grouped: Record<string, typeof doc.items> = {};
  const uncategorized: typeof doc.items = [];
  for (const item of doc.items) {
    if (item.category) { if (!grouped[item.category]) grouped[item.category] = []; grouped[item.category].push(item); }
    else { uncategorized.push(item); }
  }

  let rowIdx = 0;
  const tbody: string[] = [];
  for (const item of uncategorized) {
    rowIdx++;
    const isEven = rowIdx % 2 === 0;
    tbody.push(`<tr style="border-bottom:0.5px solid #EDEAE4;background:${isEven?'#FAFAF8':'transparent'}">
      <td style="padding:9px 10px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#AAA;width:36px;text-align:center">${String(rowIdx).padStart(2,'0')}</td>
      <td style="padding:9px 10px;font-weight:500;color:#1A1A1A;font-size:12.5px;line-height:1.35">${e(item.designation)}</td>
      <td style="padding:9px 10px;width:52px;text-align:center"><span style="display:inline-block;background:${A.navyLight};color:${A.navy};font-size:10px;font-weight:600;padding:2px 10px;border-radius:3px;letter-spacing:0.04em">${unitLabelsMap[item.unit]??item.unit}</span></td>
      <td style="padding:9px 10px;width:80px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:500;color:#1A1A1A">${item.quantity > 0 ? item.quantity.toLocaleString('fr-DZ',{minimumFractionDigits:2,maximumFractionDigits:2}) : '<span style="color:#CCC;font-style:italic;font-size:10px">&mdash;</span>'}</td>
    </tr>`);
  }
  for (const cat of catOrder) {
    const items = grouped[cat]; if (!items) continue;
    const label = catLabelsMap[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
    tbody.push(`<tr style="background:${A.navyLight}"><td colspan="4" style="padding:6px 10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${A.navy}">${e(label)}</td></tr>`);
    for (const item of items) {
      rowIdx++;
      const isEven = rowIdx % 2 === 0;
      tbody.push(`<tr style="border-bottom:0.5px solid #EDEAE4;background:${isEven?'#FAFAF8':'transparent'}">
        <td style="padding:9px 10px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#AAA;width:36px;text-align:center">${String(rowIdx).padStart(2,'0')}</td>
        <td style="padding:9px 10px;font-weight:500;color:#1A1A1A;font-size:12.5px;line-height:1.35">${e(item.designation)}</td>
        <td style="padding:9px 10px;width:52px;text-align:center"><span style="display:inline-block;background:${A.navyLight};color:${A.navy};font-size:10px;font-weight:600;padding:2px 10px;border-radius:3px;letter-spacing:0.04em">${unitLabelsMap[item.unit]??item.unit}</span></td>
        <td style="padding:9px 10px;width:80px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:500;color:#1A1A1A">${item.quantity > 0 ? item.quantity.toLocaleString('fr-DZ',{minimumFractionDigits:2,maximumFractionDigits:2}) : '<span style="color:#CCC;font-style:italic;font-size:10px">&mdash;</span>'}</td>
      </tr>`);
    }
  }

  const clientNameFr = e(doc.sigClientNameFr || doc.clientInfo.name || '—');
  const clientNameAr = e(doc.sigClientNameAr || '');
  const clientRole = e(doc.sigClientRole || '');
  const companyNameFr = e(doc.sigCompanyNameFr || (isEnt && doc.companyInfo ? doc.companyInfo.name : '—'));
  const directionNameFr = e(doc.sigDirectionNameFr || (isEnt && doc.companyInfo ? doc.companyInfo.name : 'Validation Direction'));
  const directionRole = e(doc.sigDirectionRole || '');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Attachement des Travaux - ${e(doc.documentNumber)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+4:wght@600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Helvetica,Arial,sans-serif;color:#1A1A1A;font-size:12px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:190mm;margin:0 auto;min-height:100vh;background:#fff;display:flex;flex-direction:column}
.accent-bar{height:4px;background:linear-gradient(90deg,${A.navy} 0%,${A.navyMid} 60%,${A.gold} 100%)}
.body{padding:28px 44px;flex:1}
.co-frame{border:2px solid #1A1A1A;padding:14px 20px;text-align:center;margin-bottom:14px}
.co-frame .nm{font-family:'Source Serif 4',Georgia,serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;line-height:1.35;color:#1A1A1A}
.co-frame .ad{font-size:12px;color:#444;margin-top:4px}
.co-frame .mr{display:flex;justify-content:center;gap:24px;font-size:11px;color:#666;font-family:'JetBrains Mono',monospace;margin-top:6px;flex-wrap:wrap}
.co-frame .mr b{font-family:'Inter',sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${A.navy}}
.doc-title{text-align:center;padding:14px 0 6px}
.doc-title h1{font-family:'Source Serif 4',Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:0.1em;text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px;display:inline-block;margin-bottom:10px}
.doc-title .dr{display:flex;justify-content:center;align-items:center;gap:20px;font-size:11px;color:#666;font-family:'JetBrains Mono',monospace;margin-bottom:6px}
.doc-title .dr b{font-family:'Inter',sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${A.navy}}
.doc-title .dr .s{color:#CCC}
.doc-title .lo{font-size:12px;color:#555;font-style:italic;padding:8px 20px;border:0.5px solid #E4DED5;border-radius:4px;background:#F9F8F5;display:inline-block;margin-bottom:4px}
.items-wrap{border-bottom:1px solid #E4DED5;margin-top:14px}
table.items{width:100%;border-collapse:collapse;font-size:12.5px;font-family:'Inter',sans-serif}
table.items thead tr{background:${A.navy}}
table.items thead th{padding:9px 10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#EEF3FB;white-space:nowrap}
table.items thead th:nth-child(1){text-align:center;width:36px}
table.items thead th:nth-child(2){text-align:left}
table.items thead th:nth-child(3){text-align:center;width:52px}
table.items thead th:nth-child(4){text-align:center;width:80px}
table.items tbody tr.cat-row td{padding:6px 10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${A.navy}}
.obs-section{padding:14px 0;border-bottom:1px solid #E4DED5}
.obs-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#888;margin-bottom:6px}
.obs-box{background:#F9F8F5;border:0.5px solid #E4DED5;border-left:2px solid ${A.navy};border-radius:0 4px 4px 0;padding:10px 14px;font-size:12px;color:#444;font-style:italic;line-height:1.6;min-height:40px}
.cert-band{margin:16px 0;background:${A.navyLight};border:0.5px solid #B5D4F4;border-radius:4px;padding:10px 16px;font-size:12px;color:${A.navy};display:flex;align-items:center;gap:10px}
.cert-band .ct{line-height:1.55}
.cert-band .ct b{font-weight:600}
.sig-grid{display:grid;grid-template-columns:1fr 1fr;padding:20px 0 0;gap:0}
.sig-col-l{border-right:0.5px dashed #C8C2B5;padding-right:28px;padding-bottom:16px}
.sig-col-r{padding-left:28px;padding-bottom:16px;text-align:right}
.sig-ey{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${A.navy};margin-bottom:2px}
.sig-sub{font-size:11px;color:#888;margin-bottom:10px}
.sig-detail{font-size:12px;color:#555;font-style:italic;margin-bottom:4px;line-height:1.5}
.sig-space{height:56px;border-bottom:0.5px solid #C8C2B5;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#DDD;font-size:11px;font-style:italic}
.sig-name{font-size:12px;color:#333;font-weight:500;margin-top:6px}
.sig-role{font-size:10px;color:#888;margin-top:2px;line-height:1.4}
.sig-bot{border-top:0.5px dashed #C8C2B5;margin:0 44px;padding:18px 0 24px;text-align:center}
.sig-bot .sig-ey{color:${A.navy}}
.doc-foot{background:#F9F8F5;border-top:1px solid #E4DED5;padding:10px 44px;font-size:10px;color:#999;text-align:center;font-family:'JetBrains Mono',monospace;line-height:1.8}
.doc-foot strong{font-family:'Inter',sans-serif;color:#777}
@media print{.page{box-shadow:none}}
</style></head><body>
<div class="page">
<div class="accent-bar"></div>
<div class="body">
  ${isEnt && doc.companyInfo ? `
  <div class="co-frame">
    <div class="nm">${e(doc.companyInfo.name)}</div>
    ${doc.companyInfo.address ? `<div class="ad">${e(doc.companyInfo.address)}</div>` : ''}
    <div class="mr">
      ${doc.companyInfo.taxIds.rc ? `<span><b>RC</b> ${e(doc.companyInfo.taxIds.rc)}</span>` : ''}
      ${doc.companyInfo.taxIds.nif ? `<span><b>N.I.F.</b> ${e(doc.companyInfo.taxIds.nif)}</span>` : ''}
      ${doc.companyInfo.taxIds.nis ? `<span><b>N.I.S.</b> ${e(doc.companyInfo.taxIds.nis)}</span>` : ''}
    </div>
  </div>` : ''}

  <div class="doc-title">
    <h1>Attachement des Travaux</h1>
    <div class="dr">
      ${sf('docNumber') ? `<b>Réf.</b> ${e(doc.documentNumber)}` : ''}
      ${sf('docNumber') && sf('issueDate') ? `<span class="s">·</span>` : ''}
      ${sf('issueDate') ? `<b>Date</b> ${doc.date}` : ''}
      ${doc.bcRef ? `<span class="s">·</span><b>BC lié</b> ${e(doc.bcRef)}` : ''}
    </div>
    ${doc.chantierAddress ? `<div class="lo">Réalisé au niveau ${e(doc.chantierAddress)}</div>` : ''}
  </div>

  ${doc.items.length ? `
  <div class="items-wrap">
    <table class="items">
      <thead><tr>
        <th style="width:36px">N°</th>
        <th>Désignation des ouvrages</th>
        <th style="width:52px">Unité</th>
        <th style="width:80px">Quantité</th>
      </tr></thead>
      <tbody>${tbody.join('')}</tbody>
    </table>
  </div>` : ''}

  ${sf('notes') && doc.notes ? `
  <div class="obs-section">
    <div class="obs-label">Observations / Réserves</div>
    <div class="obs-box">${e(doc.notes)}</div>
  </div>` : ''}

  <div class="cert-band">
    <span style="font-size:16px;flex-shrink:0">&#10003;</span>
    <div class="ct"><b>Attestation :</b> Le soussigné certifie que les travaux ci-dessus ont été réalisés et réceptionnés conformément aux quantités indiquées${doc.chantierAddress ? ` au niveau ${e(doc.chantierAddress)}` : ''}.</div>
  </div>
</div>

<div style="padding:0 44px">
  <div class="sig-grid">
    <div class="sig-col-l">
      <div class="sig-ey">Le maître d'ouvrage</div>
      <div class="sig-sub">${e(doc.clientInfo.name || '—')}</div>
      ${clientNameAr || clientRole ? `<div class="sig-detail">${clientNameAr ? clientNameAr+'<br>' : ''}${clientRole}</div>` : ''}
      <div class="sig-space">Signature</div>
      <div class="sig-name">${clientNameFr}</div>
      ${clientRole ? `<div class="sig-role">${clientRole}</div>` : ''}
    </div>
    <div class="sig-col-r">
      <div class="sig-ey" style="color:${A.green}">L'Entreprise</div>
      <div class="sig-sub">${isEnt && doc.companyInfo ? e(doc.companyInfo.name) : '—'}</div>
      ${companyNameFr !== e(doc.companyInfo?.name || '') ? `<div class="sig-detail">${companyNameFr}</div>` : ''}
      <div class="sig-space">Signature</div>
      <div class="sig-name">${companyNameFr}</div>
    </div>
  </div>
  <div class="sig-bot">
    <div class="sig-ey" style="color:${A.green}">${isEnt && doc.companyInfo ? e(doc.companyInfo.name) : 'Validation Direction'}</div>
    ${directionRole ? `<div style="font-size:10px;color:#888;margin-top:3px;margin-bottom:12px;line-height:1.4">${directionRole}</div>` : ''}
    <div style="display:inline-block;text-align:center">
      <div class="sig-space" style="width:200px;margin:0 auto 8px">Signature &amp; cachet officiel</div>
      <div class="sig-name">${directionNameFr}</div>
      ${directionRole ? `<div class="sig-role">${directionRole}</div>` : ''}
    </div>
  </div>
  <div class="doc-foot">
    <strong>Réf. :</strong> ${e(doc.documentNumber)}
    ${doc.bcRef ? `<span style="margin:0 6px">·</span><strong>BC lié :</strong> ${e(doc.bcRef)}` : ''}
    <span style="margin:0 6px">·</span><strong>Date :</strong> ${doc.date}
    ${doc.companyInfo?.taxIds?.rc ? `<span style="margin:0 6px">·</span><strong>RC :</strong> ${e(doc.companyInfo.taxIds.rc)}` : ''}
    <br>Document généré par <strong>CloudDevis</strong>
  </div>
</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>
</body></html>`;
}
