import type { LineItem, DocumentState, CalculationResult, CustomSectionDef } from '@/types';

export function generateDocumentHTML(params: {
  isEnt: boolean;
  docTypeLabel: string;
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
}) {
  const { isEnt, docTypeLabel, vb, sf, bv, catLabels, paymentLabels, unitLabels, grouped, uncategorized, catOrder, doc, results, tc, tp, te, tu, customSections, currency } = params;

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
    ${S('.header .brand h1','font-size:26px;font-weight:900;color:#1e3a5f;letter-spacing:-0.5px;margin:0;text-transform:uppercase')}
    ${S('.header .brand .sub','font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-top:1px')}
    ${S('.header .meta-logo','text-align:right;margin-bottom:6px')}
    ${S('.header .meta-logo img','max-width:120px;max-height:60px;object-fit:contain')}
    ${S('.header .meta','text-align:right')}
    ${S('.header .meta .num','font-size:18px;font-weight:900;color:#1e3a5f;margin-bottom:4px')}
    ${S('.header .meta .line','font-size:10px;color:#64748b;margin:1px 0')}
    ${S('.hr','height:2px;background:linear-gradient(to right,#1e3a5f,#e2e8f0);margin-bottom:24px;border:none')}
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
    ${S('table.items thead th','padding:6px 4px;font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;background:#f8fafc;border-bottom:2px solid #1e3a5f')}
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
    ${S('.totals-table .grand td','padding-top:8px;border-top:2px solid #1e3a5f')}
    ${S('.totals-table .grand .lbl','font-size:11px;font-weight:800;color:#1e3a5f;text-transform:uppercase')}
    ${S('.totals-table .grand .val','font-size:16px;font-weight:900;color:#1e3a5f')}
    ${S('.totals-table .inwords','font-size:8px;font-style:italic;color:#94a3b8;text-align:right;padding-top:3px')}
    ${S('.signature','margin-top:20px;padding-top:14px;border-top:1.5px solid #1e293b;display:flex;justify-content:space-between;align-items:flex-end')}
    ${S('.signature .loc','font-size:9px;color:#64748b;font-weight:500')}
    ${S('.signature .stamp','text-align:right')}
    ${S('.signature .stamp .lbl2','font-size:8px;color:#94a3b8;margin-bottom:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px')}
    ${S('.signature .stamp .box','width:110px;height:52px;border:2px solid #cbd5e1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#cbd5e1;background:#f8fafc')}
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
    tbody.push(`<tr><td colspan="6" style="padding:10px 4px 3px;border:none"><div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#1e3a5f">` + label + `</div></td></tr>`);
    for (const item of items) { idx++; tbody.push(itemRow(item, idx)); }
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>` + docTypeLabel + ` - ` + s(doc.documentNumber) + `</title>
<style>` + css + `</style></head><body>
<div class="page">

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
          ` + (doc.companyInfo.address ? `<span class="muted">` + s(doc.companyInfo.address) + `</span><br>` : '') + `
          ` + (doc.companyInfo.taxIds.nif ? `<span class="muted">${te('client.companyNif')} : ` + s(doc.companyInfo.taxIds.nif) + `</span><br>` : '') + `
          ` + (doc.companyInfo.taxIds.rc ? `<span class="muted">${te('client.companyRc')} : ` + s(doc.companyInfo.taxIds.rc) + `</span><br>` : '') + `
          ` + (doc.companyInfo.taxIds.nis ? `<span class="muted">${te('client.companyNis')} : ` + s(doc.companyInfo.taxIds.nis) + `</span><br>` : '') + `
          ` + (doc.companyInfo.taxIds.ai ? `<span class="muted">${te('client.companyAi')} : ` + s(doc.companyInfo.taxIds.ai) + `</span>` : '') + `
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
