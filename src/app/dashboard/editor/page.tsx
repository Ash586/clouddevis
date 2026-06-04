'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Button } from '@/components/ui/button';
import { DocumentPreview } from '@/components/editor/DocumentPreview';
import { useEditor } from '@/hooks/useEditor';
import { formatCurrency } from '@/lib/calculations';
import { UNIT_OPTIONS, CATEGORY_OPTIONS, DEFAULT_SECTION_ORDER, SECTION_FIELDS } from '@/types';
import type { UserMode, BlockId, SectionId, CustomSectionDef, CustomFieldDef, CustomFieldType } from '@/types';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  sectionId: SectionId;
  blockId?: BlockId;
  visible: boolean;
  onToggle: (b: BlockId) => void;
  sectionOrder: SectionId[];
  moveSection: (id: SectionId, dir: 'up' | 'down') => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, sectionId, blockId, visible, onToggle, sectionOrder, moveSection, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const te = useTranslations('editor');
  const idx = sectionOrder.indexOf(sectionId);
  const canUp = idx > 0;
  const canDown = idx >= 0 && idx < sectionOrder.length - 1;
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-0.5">
          <button onClick={() => moveSection(sectionId, 'up')} disabled={!canUp}
            className={cn('text-[9px] leading-none p-0.5 rounded', canUp ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-200 cursor-default')}>▲</button>
          <button onClick={() => moveSection(sectionId, 'down')} disabled={!canDown}
            className={cn('text-[9px] leading-none p-0.5 rounded', canDown ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-200 cursor-default')}>▼</button>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider hover:text-slate-900 ml-1">
            <span className="text-[10px] text-slate-400 transition-transform" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            {title}
          </button>
        </div>
        {blockId && (
          <button onClick={() => onToggle(blockId)}
            className={cn('text-[13px] px-1.5 py-0.5 rounded-md transition', visible ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200' : 'text-red-400 bg-red-50 hover:bg-red-100')}
            title={visible ? te('hideBlock') : te('showBlock')}>
            {visible ? '👁' : '👁‍🗨'}
          </button>
        )}
      </div>
      {open && <div className="p-3 space-y-2">{children}</div>}
    </section>
  );
}

function EditorContent() {
  const sp = useSearchParams();
  const modeParam = sp.get('mode') as UserMode | null;
  const docIdParam = sp.get('id');
  const {
    doc, setDoc, mode, setMode,
    addingItem, setAddingItem, newItem, setNewItem,
    saving, results,
    updateDoc, updateClientInfo,
    updateCompanyInfo, updateTaxIds, updateArtisanInfo,
    updateDiscount, updateStampDuty, updatePaymentDetails,
    setChantierField, setMateriauxField, setGarantieField,
    toggleBlock, isBlockVisible,
    handleAddItem, handleRemoveItem, moveItem, moveSection, startNewItem, resetDoc, saveDoc,
    updateCustomField,
  } = useEditor(modeParam ?? 'artisan', docIdParam ?? undefined);

  const te = useTranslations('editor');
  const tu = useTranslations('preview.units');
  const tp = useTranslations('preview');
  const tc = useTranslations('common');

  const [fieldPrefs, setFieldPrefs] = useState<Record<string, string[]> | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [customSections, setCustomSections] = useState<CustomSectionDef[]>([]);
  const [showSectionCreator, setShowSectionCreator] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSectionDef | null>(null);
  const ALL_SECTIONS: string[] = [...DEFAULT_SECTION_ORDER, ...customSections.map(s => s.id)];
  const allFields = ALL_SECTIONS.flatMap(s => SECTION_FIELDS[s] ?? customSections.find(c => c.id === s)?.fields.map(f => f.id) ?? []);

  useEffect(() => {
    if (docIdParam) { setPreferencesLoaded(true); return; }
    fetch('/api/user/preferences')
      .then(r => r.ok ? r.json() : { fields: null })
      .then(data => {
        if (data.fields && typeof data.fields === 'object') {
          setFieldPrefs(data.fields as Record<string, string[]>);
        } else {
          setShowCustomizer(true);
        }
        setPreferencesLoaded(true);
      })
      .catch(() => {
        setPreferencesLoaded(true);
      });
  }, []);

  useEffect(() => {
    fetch('/api/user/custom-sections')
      .then(r => r.ok ? r.json() : { sections: [] })
      .then(data => {
        if (Array.isArray(data.sections)) {
          setCustomSections(data.sections);
          const customIds = data.sections.map((s: CustomSectionDef) => s.id);
          setDoc(prev => ({
            ...prev,
            sectionOrder: [...prev.sectionOrder, ...customIds.filter((id: string) => !prev.sectionOrder.includes(id))]
          }));
        }
      })
      .catch(() => {});
  }, []);

  const prefFields: Record<string, string[]> = {
    ...Object.fromEntries(DEFAULT_SECTION_ORDER.map(s => [s, fieldPrefs?.[s] ?? [...SECTION_FIELDS[s]]])),
    ...Object.fromEntries(customSections.map(cs => [cs.id, fieldPrefs?.[cs.id] ?? cs.fields.map(f => f.id)])),
  };
  const hiddenFields = new Set<string>();
  for (const section of ALL_SECTIONS) {
    const visible = prefFields[section] ?? [];
    const builtinFields = SECTION_FIELDS[section];
    if (builtinFields) {
      for (const field of builtinFields) {
        if (!visible.includes(field)) hiddenFields.add(field);
      }
    } else {
      const cs = customSections.find(c => c.id === section);
      if (cs) {
        for (const fieldDef of cs.fields) {
          if (!visible.includes(fieldDef.id)) hiddenFields.add(`custom_${section}_${fieldDef.id}`);
        }
      }
    }
  }

  async function savePreferences(fields: Record<string, string[]>) {
    setFieldPrefs(fields);
    setShowCustomizer(false);
    await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
  }

  const escHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

  const handleDownload = async () => {
    await saveDoc();
    const isEnt = doc.mode === 'entreprise';
    const docTypeLabel = doc.documentType === 'devis' ? tp('docTypeQuote') : doc.documentType === 'facture' ? tp('docTypeInvoice') : tp('docTypeProforma');
    const vb = (block: string) => !doc.hiddenBlocks.includes(block as any);
    const hf = new Set(hiddenFields);
    const sf = (fieldId: string) => !hf.has(fieldId);
    const bv = (...fieldIds: string[]) => fieldIds.some(f => sf(f));
    const catLabels: Record<string, string> = { preparation: tp('categories.preparation'), peinture: tp('categories.peinture'), finition: tp('categories.finition'), revetement: tp('categories.revetement'), facade: tp('categories.facade'), enduit: tp('categories.enduit'), main_oeuvre: tp('categories.main_oeuvre'), materiaux: tp('categories.materiaux'), transport: tp('categories.transport'), divers: tp('categories.divers') };
    const paymentLabels: Record<string, string> = { cheque: te('paiement.check'), virement: te('paiement.transfer'), especes: te('paiement.cash'), cb: te('paiement.card') };

    const grouped: Record<string, typeof doc.items> = {};
    const uncategorized: typeof doc.items = [];
    for (const item of doc.items) {
      if (item.category) { if (!grouped[item.category]) grouped[item.category] = []; grouped[item.category].push(item); }
      else { uncategorized.push(item); }
    }
    const catOrder = ['preparation', 'peinture', 'finition', 'revetement', 'facade', 'enduit', 'main_oeuvre', 'materiaux', 'transport', 'divers'];

    function itemRow(item: typeof doc.items[0], idx: number): string {
      return `<tr>
        <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:9px;text-align:center;color:#94a3b8;font-weight:700;width:22px">${idx}</td>
        <td style="padding:5px 6px;border-bottom:1px solid #e2e8f0;font-size:10px">${escHtml(item.designation)}</td>
        <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:center;white-space:nowrap">${item.quantity}</td>
        <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:9px;text-align:center;color:#64748b;white-space:nowrap">${unitLabels[item.unit]||item.unit}</td>
        <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:right;white-space:nowrap">${item.unitPrice.toLocaleString('fr-DZ')}</td>
        <td style="padding:5px 4px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:right;font-weight:600;white-space:nowrap">${(item.quantity*item.unitPrice).toLocaleString('fr-DZ')} ${tc('currency')}</td>
      </tr>`;
    }

    let idx = 0;
    const tbody: string[] = [];
    for (const item of uncategorized) { idx++; tbody.push(itemRow(item, idx)); }
    for (const cat of catOrder) {
      const items = grouped[cat]; if (!items) continue;
      const label = catLabels[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
      tbody.push(`<tr><td colspan="6" style="padding:10px 4px 3px;border:none"><div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#1e3a5f">` + label + `</div></td></tr>`);
      for (const item of items) { idx++; tbody.push(itemRow(item, idx)); }
    }

    // Helper: single inline style blocks
    const S = (sel: string, rules: string) => `${sel}{${rules}}`;
    const css = `
      ${S('@page','size:A4;margin:0')}
      ${S('*','margin:0;padding:0;box-sizing:border-box')}
      ${S('body','font-family:Helvetica,Arial,sans-serif;color:#1e293b;font-size:11px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact')}
      ${S('.page','width:190mm;margin:0 auto;padding:45px 50px 30px;min-height:100vh;display:flex;flex-direction:column')}
      ${S('.top-section','flex:1')}
      ${S('.header','display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px')}
      ${S('.header .brand h1','font-size:26px;font-weight:900;color:#1e3a5f;letter-spacing:-0.5px;margin:0;text-transform:uppercase')}
      ${S('.header .brand .sub','font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-top:1px')}
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
      ${S('.signature','margin-top:24px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-end')}
      ${S('.signature .loc','font-size:9px;color:#94a3b8')}
      ${S('.signature .stamp','text-align:right')}
      ${S('.signature .stamp .lbl2','font-size:9px;color:#94a3b8;margin-bottom:3px')}
      ${S('.signature .stamp .box','width:100px;height:48px;border:2px dashed #cbd5e1;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#cbd5e1')}
      ${S('.print-footer','text-align:center;font-size:7px;color:#cbd5e1;margin-top:24px;letter-spacing:0.5px')}
      ${S('@media print','.page{padding:30px 40px 20px;box-shadow:none}')}
    `;

    const s = (v: string) => escHtml(v);
    const fmt = (n: number) => n.toLocaleString('fr-DZ');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>` + docTypeLabel + ` - ` + s(doc.documentNumber) + `</title>
<style>` + css + `</style></head><body>
<div class="page">

<div class="top-section">
  <div class="header">
    <div class="brand">
      <h1>` + docTypeLabel + `</h1>
      <div class="sub">${tc('appName')}</div>
    </div>
    <div class="meta">
      ` + (sf('docNumber') ? `<div class="num">` + s(doc.documentNumber) + `</div>` : '') + `
      ` + (sf('issueDate') ? `<div class="line">${tp('issueDate')} ` + doc.date + `</div>` : '') + `
      ` + (sf('validUntil') && doc.validUntil ? `<div class="line">${tp('validUntil')} ` + doc.validUntil + `</div>` : '') + `
      ` + (sf('orderRef') && doc.bcRef ? `<div class="line">${tp('orderRef')} ` + s(doc.bcRef) + `</div>` : '') + `
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
      ` + customSections.map(cs => {
        const sectionData = doc.customFields[cs.id];
        const visibleFields = cs.fields.filter(f => sf(`custom_${cs.id}_${f.id}`));
        const hasVisibleData = sectionData && visibleFields.some(f => { const v = sectionData[f.id]; return v !== undefined && v !== null && v !== ''; });
        if (vb(cs.id) && hasVisibleData) {
          return `<div class="card" style="background:#f8fafc">
            <strong style="font-size:9px;color:#475569">${ s(cs.label) }</strong><br>
            ` + visibleFields.filter(f => { const v = sectionData[f.id]; return v !== undefined && v !== null && v !== ''; }).map(f => `<span style="color:#64748b"><strong>${ s(f.label) } :</strong> ${ s(sectionData[f.id]) }</span><br>`).join('') + `
          </div>`;
        }
        return '';
      }).join('') + `
    </div>

    <div class="right">
      <table class="totals-table">
        <tr><td class="lbl">${tp('totalHT')}</td><td class="val">` + fmt(results.subTotalHT) + ` ${tc('currency')}</td></tr>
        ` + (vb('remise') && bv('remiseType','remiseValue','remiseReason') && results.discountAmount > 0 ? `<tr class="disc"><td class="lbl">${tp('remise')}` + (doc.discount.reason ? ' (' + s(doc.discount.reason) + ')' : '') + `</td><td class="val">-` + fmt(results.discountAmount) + ` ${tc('currency')}</td></tr>` : '') + `
        ` + (results.tvaRate > 0 ? `<tr class="ttr"><td colspan="2">${tp('vatLine', { rate: results.tvaRate })}</td></tr>
        <tr><td class="lbl">${tp('taxTableBase')}</td><td class="val">` + fmt(results.subTotalHT) + ` ${tc('currency')}</td></tr>
        <tr><td class="lbl">${tp('taxTableAmount')}</td><td class="val">` + fmt(results.tvaAmount) + ` ${tc('currency')}</td></tr>` : '') + `
        ` + (results.timbreFiscal > 0 ? `<tr class="sep"><td colspan="2"></td></tr>
        <tr><td class="lbl">${tp('stampDuty')}</td><td class="val">` + fmt(results.timbreFiscal) + ` ${tc('currency')}</td></tr>` : '') + `
        ` + (results.acompte > 0 ? `<tr class="disc"><td class="lbl">${tp('depositPaid')}</td><td class="val">-` + fmt(results.acompte) + ` ${tc('currency')}</td></tr>` : '') + `
        <tr class="grand"><td class="lbl">${tp('netToPay')}</td><td class="val">` + fmt(results.netAPayer) + ` ${tc('currency')}</td></tr>
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

  <div class="print-footer">${tp('footer')}</div>
</div>

</div>
<script>
window.onload=function(){setTimeout(function(){window.print();},300);};
</script>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) { window.print(); return; }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const unitLabels: Record<string, string> = { u: tu('u'), h: tu('h'), j: tu('j'), m2: tu('m2'), m3: tu('m3'), ml: tu('ml'), kg: tu('kg'), forfait: tu('forfait') };

  const renderSection = (id: SectionId): React.ReactNode => {
    const s = (blockId?: BlockId) => blockId ? { blockId, visible: isBlockVisible(blockId), onToggle: toggleBlock } : { visible: true, onToggle: () => {} };
    const dragProps = { sectionOrder: doc.sectionOrder, moveSection };

    switch (id) {
      case 'design':
        return <CollapsibleSection title={te('sections.design')} sectionId="design" {...dragProps} {...s()}>
          {!hiddenFields.has('logo') && <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="w-14 h-14 bg-white border rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"><span className="text-[9px] text-slate-400">Logo</span></div>
            <div className="flex-1">
              <input type="file" accept="image/*"
                className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>}
        </CollapsibleSection>;

      case 'general':
        return <CollapsibleSection title={te('sections.general')} sectionId="general" {...dragProps} {...s('header')}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('docNumber') && <input type="text" placeholder={te('general.docNumber')} className="w-full bg-slate-50 border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.documentNumber} onChange={(e) => updateDoc('documentNumber', e.target.value)} />}
            {!hiddenFields.has('orderRef') && <input type="text" placeholder={te('general.orderRef')} className="w-full bg-slate-50 border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.bcRef ?? ''} onChange={(e) => updateDoc('bcRef', e.target.value)} />}
            {!hiddenFields.has('issueDate') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('general.issueDate')}</label>
              <input type="date" className="w-full bg-slate-50 border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.date} onChange={(e) => updateDoc('date', e.target.value)} /></div>}
            {!hiddenFields.has('validUntil') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('general.validUntil')}</label>
              <input type="date" className="w-full bg-slate-50 border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.validUntil ?? ''} onChange={(e) => updateDoc('validUntil', e.target.value)} /></div>}
          </div>
          {!hiddenFields.has('vatRate') && <div><label className="block text-[10px] font-bold text-slate-500 mb-0.5">{te('general.vatRate')}</label>
            <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.tvaRate} onChange={(e) => updateDoc('tvaRate', Number(e.target.value))}>
              <option value="19">{te('general.vat19')}</option><option value="9">{te('general.vat9')}</option><option value="0">{te('general.vat0')}</option></select></div>}
          {!hiddenFields.has('stampRate') && <div><label className="block text-[10px] font-bold text-slate-500 mb-0.5">{te('general.stampDuty')}</label>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="block text-[8px] text-slate-400">{te('general.stampRate')}</label>
                <input type="number" step="0.1" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.stampDuty.rate} onChange={(e) => updateStampDuty({ rate: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-[8px] text-slate-400">{te('general.stampMin')}</label>
                <input type="number" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.stampDuty.minAmount} onChange={(e) => updateStampDuty({ minAmount: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-[8px] text-slate-400">{te('general.stampMax')}</label>
                <input type="number" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.stampDuty.maxAmount} onChange={(e) => updateStampDuty({ maxAmount: parseFloat(e.target.value) || 0 })} /></div>
            </div></div>}
        </CollapsibleSection>;

      case 'mode':
        return <CollapsibleSection title={te('sections.mode')} sectionId="mode" {...dragProps} {...s()}>
          {!hiddenFields.has('businessMode') && <label className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600" checked={mode === 'entreprise'} onChange={(e) => setMode(e.target.checked ? 'entreprise' : 'artisan')} />
            <span className="text-[10px] font-bold text-blue-800">{te('mode.enableBusiness')}</span></label>}
        </CollapsibleSection>;

      case 'client':
        return <CollapsibleSection title={te('sections.client')} sectionId="client" {...dragProps} {...s('client')}>
          {!hiddenFields.has('clientName') && <input type="text" placeholder={te('client.clientName')} className="w-full border p-2 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500" value={doc.clientInfo.name} onChange={(e) => updateClientInfo({ name: e.target.value })} />}
          {!hiddenFields.has('clientAddress') && <textarea placeholder={te('client.clientAddress')} className="w-full border p-2 rounded-lg text-[11px] h-12 resize-none outline-none focus:ring-2 focus:ring-blue-500" value={doc.clientInfo.address ?? ''} onChange={(e) => updateClientInfo({ address: e.target.value })} />}
          {!hiddenFields.has('clientNif') && mode === 'entreprise' && <input type="text" placeholder={te('client.clientNif')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.clientInfo.nif ?? ''} onChange={(e) => updateClientInfo({ nif: e.target.value })} />}
          {!hiddenFields.has('clientPhone') && <input type="text" placeholder={te('client.clientPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.clientInfo.phone ?? ''} onChange={(e) => updateClientInfo({ phone: e.target.value })} />}
          {mode === 'artisan' && doc.artisanInfo && <div className="border-t border-slate-100 pt-2 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{te('client.yourInfo')}</h4>
            <input type="text" placeholder={te('client.yourName')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.artisanInfo.name} onChange={(e) => updateArtisanInfo({ name: e.target.value })} />
            <input type="text" placeholder={te('client.yourAddress')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.artisanInfo.address} onChange={(e) => updateArtisanInfo({ address: e.target.value })} />
            <input type="text" placeholder={te('client.yourPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.artisanInfo.phone ?? ''} onChange={(e) => updateArtisanInfo({ phone: e.target.value })} />
          </div>}
          {mode === 'entreprise' && doc.companyInfo && <div className="border-t border-slate-100 pt-2 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{te('client.yourCompany')}</h4>
            <input type="text" placeholder={te('client.companyName')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.companyInfo.name} onChange={(e) => updateCompanyInfo({ name: e.target.value })} />
            <input type="text" placeholder={te('client.companyAddress')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.companyInfo.address} onChange={(e) => updateCompanyInfo({ address: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder={te('client.companyNif')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.companyInfo.taxIds.nif} onChange={(e) => updateTaxIds({ nif: e.target.value })} />
              <input type="text" placeholder={te('client.companyRc')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.companyInfo.taxIds.rc} onChange={(e) => updateTaxIds({ rc: e.target.value })} />
              <input type="text" placeholder={te('client.companyNis')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.companyInfo.taxIds.nis} onChange={(e) => updateTaxIds({ nis: e.target.value })} />
              <input type="text" placeholder={te('client.companyAi')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.companyInfo.taxIds.ai} onChange={(e) => updateTaxIds({ ai: e.target.value })} />
            </div></div>}
          {!hiddenFields.has('clientEmail') && <div className="flex items-center gap-2 pt-1">
            <input type="text" placeholder={te('client.companyEmail')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.clientInfo.email ?? ''} onChange={(e) => updateClientInfo({ email: e.target.value })} /></div>}
        </CollapsibleSection>;

      case 'chantier':
        return <CollapsibleSection title={te('sections.chantier')} sectionId="chantier" {...dragProps} {...s('chantier')} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('chantierAddress') && <div className="col-span-2"><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('chantier.address')}</label>
              <input type="text" placeholder={te('chantier.addressPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.chantierAddress} onChange={(e) => setChantierField('chantierAddress', e.target.value)} /></div>}
            {!hiddenFields.has('chantierType') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('chantier.type')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.chantierType} onChange={(e) => setChantierField('chantierType', e.target.value)}>
                <option value={te('chantier.options.apartment')}>{te('chantier.options.apartment')}</option><option value={te('chantier.options.house')}>{te('chantier.options.house')}</option><option value={te('chantier.options.commercial')}>{te('chantier.options.commercial')}</option><option value={te('chantier.options.office')}>{te('chantier.options.office')}</option><option value={te('chantier.options.facade')}>{te('chantier.options.facade')}</option><option value={te('chantier.options.other')}>{te('chantier.options.other')}</option></select></div>}
            {!hiddenFields.has('chantierCondition') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('chantier.condition')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.chantierEtat} onChange={(e) => setChantierField('chantierEtat', e.target.value)}>
                <option value={te('chantier.conditionNew')}>{te('chantier.conditionNew')}</option><option value={te('chantier.conditionRenovation')}>{te('chantier.conditionRenovation')}</option></select></div>}
            {!hiddenFields.has('chantierSurface') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('chantier.surface')}</label>
              <input type="number" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.chantierSurface || ''} onChange={(e) => setChantierField('chantierSurface', parseFloat(e.target.value) || 0)} /></div>}
            {!hiddenFields.has('chantierProtection') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('chantier.protection')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.chantierProtection} onChange={(e) => setChantierField('chantierProtection', e.target.value)}>
                <option value={te('chantier.protectionProvider')}>{te('chantier.protectionProvider')}</option><option value={te('chantier.protectionClient')}>{te('chantier.protectionClient')}</option><option value={te('chantier.protectionNone')}>{te('chantier.protectionNone')}</option></select></div>}
          </div>
        </CollapsibleSection>;

      case 'materiaux':
        return <CollapsibleSection title={te('sections.materiaux')} sectionId="materiaux" {...dragProps} {...s('materiaux')} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('materiauxBrand') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('materiaux.brand')}</label>
              <input type="text" placeholder={te('materiaux.brandPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.materiauxMarque} onChange={(e) => setMateriauxField('materiauxMarque', e.target.value)} /></div>}
            {!hiddenFields.has('materiauxType') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('materiaux.type')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.materiauxType} onChange={(e) => setMateriauxField('materiauxType', e.target.value)}>
                <option value={te('materiaux.options.acrylicMat')}>{te('materiaux.options.acrylicMat')}</option><option value={te('materiaux.options.acrylicSatin')}>{te('materiaux.options.acrylicSatin')}</option><option value={te('materiaux.options.glycéro')}>{te('materiaux.options.glycéro')}</option><option value={te('materiaux.options.floor')}>{te('materiaux.options.floor')}</option><option value={te('materiaux.options.decorative')}>{te('materiaux.options.decorative')}</option><option value={te('materiaux.options.other')}>{te('materiaux.options.other')}</option></select></div>}
            {!hiddenFields.has('materiauxColor') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('materiaux.color')}</label>
              <input type="text" placeholder={te('materiaux.colorPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.materiauxCouleur} onChange={(e) => setMateriauxField('materiauxCouleur', e.target.value)} /></div>}
            {!hiddenFields.has('materiauxQty') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('materiaux.quantity')}</label>
              <input type="number" placeholder={te('materiaux.quantityPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.materiauxQte || ''} onChange={(e) => setMateriauxField('materiauxQte', parseFloat(e.target.value) || 0)} /></div>}
          </div>
        </CollapsibleSection>;

      case 'prestations':
        return !hiddenFields.has('itemsTable') ? <CollapsibleSection title={te('sections.prestations')} sectionId="prestations" {...dragProps} {...s('table')}>
          {addingItem && <div className="bg-slate-50 p-2 rounded-xl border space-y-1.5">
            <input type="text" placeholder={te('prestations.description')} className="w-full bg-white border p-1.5 rounded-lg text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500" value={newItem.designation} onChange={(e) => setNewItem(p => ({ ...p, designation: e.target.value }))} />
            <div className="grid grid-cols-5 gap-1.5 items-end">
              <div><label className="block text-[9px] font-bold text-slate-400">{te('prestations.qty')}</label>
                <input type="number" className="w-full border p-1.5 rounded-lg text-[11px] bg-white text-center outline-none focus:ring-2 focus:ring-blue-500" value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))} /></div>
              <div><label className="block text-[9px] font-bold text-slate-400">{te('prestations.unitPrice')}</label>
                <input type="number" className="w-full border p-1.5 rounded-lg text-[11px] bg-white text-right outline-none focus:ring-2 focus:ring-blue-500" value={newItem.unitPrice} onChange={(e) => setNewItem(p => ({ ...p, unitPrice: parseFloat(e.target.value) || 0 }))} /></div>
              <div><label className="block text-[9px] font-bold text-slate-400">{te('prestations.unit')}</label>
                <select className="w-full border p-1.5 rounded-lg text-[10px] bg-white outline-none focus:ring-2 focus:ring-blue-500" value={newItem.unit} onChange={(e) => setNewItem(p => ({ ...p, unit: e.target.value as any }))}>
                  {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
              <div><label className="block text-[9px] font-bold text-slate-400">{te('prestations.category')}</label>
                <select className="w-full border p-1.5 rounded-lg text-[10px] bg-white outline-none focus:ring-2 focus:ring-blue-500" value={newItem.category ?? ''} onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))}>
                  <option value="">{te('prestations.noCategory')}</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div className="flex justify-center gap-1">
                <button onClick={handleAddItem} disabled={!newItem.designation || newItem.unitPrice <= 0} className="bg-green-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-700">✓</button>
                <button onClick={() => setAddingItem(false)} className="bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-red-600">✕</button></div>
            </div>
          </div>}
          {doc.items.map((item, idx) => (
            <div key={item.id} className="bg-slate-50 p-2 rounded-xl border space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => { if (idx > 0) moveItem(idx, idx - 1); }} className="text-[9px] text-slate-400 hover:text-slate-600 leading-none p-0.5">▲</button>
                    <button onClick={() => { if (idx < doc.items.length - 1) moveItem(idx, idx + 1); }} className="text-[9px] text-slate-400 hover:text-slate-600 leading-none p-0.5">▼</button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-medium text-slate-800 truncate block">{item.designation}</span>
                    {item.category && <span className="text-[8px] text-slate-400 uppercase">{CATEGORY_OPTIONS.find(c => c.value === item.category)?.label ?? item.category}</span>}
                  </div>
                </div>
                <button onClick={() => { if (confirm(tc('yesDelete'))) handleRemoveItem(item.id); }} className="text-red-500 text-[11px] font-bold hover:text-red-700 shrink-0 ml-1">✕</button>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-[10px] text-slate-600">
                <span>{te('prestations.qtyLabel')} <strong>{item.quantity}</strong></span>
                <span>{te('prestations.puLabel')} <strong>{item.unitPrice.toLocaleString('fr-DZ')}</strong></span>
                <span>{te('prestations.vatLabel')} <strong>{doc.tvaRate}%</strong></span>
                <span>{te('prestations.unitLabel')} <strong>{unitLabels[item.unit] ?? item.unit}</strong></span>
                <span className="text-right font-bold text-slate-900">{(item.quantity * item.unitPrice).toLocaleString('fr-DZ')} {tc('currency')}</span>
              </div>
            </div>
          ))}
          {!addingItem && <button onClick={startNewItem} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition text-[11px]">{te('prestations.addLine')}</button>}
        </CollapsibleSection> : null;

      case 'remise':
        return <CollapsibleSection title={te('sections.remise')} sectionId="remise" {...dragProps} {...s('remise')} defaultOpen={false}>
          <div className="grid grid-cols-3 gap-2 items-end">
            {!hiddenFields.has('remiseType') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('remise.type')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.discount.type} onChange={(e) => updateDiscount({ type: e.target.value as 'percentage' | 'fixed' })}>
                <option value="percentage">{te('remise.pct')}</option><option value="fixed">{te('remise.amount')}</option></select></div>}
            {!hiddenFields.has('remiseValue') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{doc.discount.type === 'percentage' ? te('remise.valuePct') : te('remise.valueDA')}</label>
              <input type="number" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.discount.value} onChange={(e) => updateDiscount({ value: parseFloat(e.target.value) || 0 })} /></div>}
            {!hiddenFields.has('remiseReason') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('remise.reason')}</label>
              <input type="text" placeholder={te('remise.reasonPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.discount.reason} onChange={(e) => updateDiscount({ reason: e.target.value })} /></div>}
          </div>
          {doc.discount.value > 0 && <div className="text-[10px] text-green-700 bg-green-50 p-2 rounded-lg font-medium">
            {te('remise.display')} {doc.discount.type === 'percentage' ? `${doc.discount.value}%` : `${formatCurrency(doc.discount.value, tc('currency'))}`}{doc.discount.reason ? ` (${doc.discount.reason})` : ''} : -{formatCurrency(results.discountAmount, tc('currency'))}</div>}
        </CollapsibleSection>;

      case 'garanties':
        return <CollapsibleSection title={te('sections.garanties')} sectionId="garanties" {...dragProps} {...s('garanties')} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('garantieLabor') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('garanties.labor')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.garantieMO} onChange={(e) => setGarantieField('garantieMO', e.target.value)}>
                <option value={te('garanties.year1')}>{te('garanties.year1')}</option><option value={te('garanties.year2')}>{te('garanties.year2')}</option><option value={te('garanties.year5')}>{te('garanties.year5')}</option><option value={te('garanties.year10')}>{te('garanties.year10')}</option><option value={te('garanties.none')}>{te('garanties.none')}</option></select></div>}
            {!hiddenFields.has('garantieMaterials') && <div><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('garanties.materials')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.garantieMateriaux} onChange={(e) => setGarantieField('garantieMateriaux', e.target.value)}>
                <option value={te('garanties.year1')}>{te('garanties.year1')}</option><option value={te('garanties.year2')}>{te('garanties.year2')}</option><option value={te('garanties.year5')}>{te('garanties.year5')}</option><option value={te('garanties.year10')}>{te('garanties.year10')}</option><option value={te('garanties.none')}>{te('garanties.none')}</option></select></div>}
            {!hiddenFields.has('garantieNotes') && <div className="col-span-2"><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{te('garanties.notes')}</label>
              <textarea placeholder={te('garanties.notesPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] h-14 resize-none outline-none focus:ring-2 focus:ring-blue-500" value={doc.garantieNotes} onChange={(e) => setGarantieField('garantieNotes', e.target.value)} /></div>}
          </div>
        </CollapsibleSection>;

      case 'paiement':
        return <CollapsibleSection title={te('sections.paiement')} sectionId="paiement" {...dragProps} {...s('payment')}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('paymentMethod') && <div><label className="block text-[10px] font-bold text-slate-500 mb-0.5">{te('paiement.method')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.paymentMode} onChange={(e) => updateDoc('paymentMode', e.target.value as any)}>
                <option value="cheque">{te('paiement.check')}</option><option value="virement">{te('paiement.transfer')}</option><option value="especes">{te('paiement.cash')}</option><option value="cb">{te('paiement.card')}</option></select></div>}
            {!hiddenFields.has('paymentDeposit') && <div><label className="block text-[10px] font-bold text-slate-500 mb-0.5">{te('paiement.deposit')}</label>
              <input type="number" min="0" step="100" className="w-full bg-slate-50 border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.acompte ?? 0} onChange={(e) => updateDoc('acompte', parseFloat(e.target.value) || 0)} /></div>}
            {!hiddenFields.has('paymentConditions') && <div className="col-span-2"><label className="block text-[10px] font-bold text-slate-500 mb-0.5">{te('paiement.conditions')}</label>
              <input type="text" placeholder={te('paiement.conditionsPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={doc.paymentDetails.terms} onChange={(e) => updatePaymentDetails({ terms: e.target.value })} /></div>}
            {!hiddenFields.has('paymentIban') && <div className="col-span-2"><label className="block text-[10px] font-bold text-slate-500 mb-0.5">{te('paiement.iban')}</label>
              <input type="text" placeholder={te('paiement.ibanPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] font-mono outline-none focus:ring-2 focus:ring-blue-500" value={doc.paymentDetails.iban} onChange={(e) => updatePaymentDetails({ iban: e.target.value })} /></div>}
          </div>
          <div className="border-t border-slate-100 pt-2 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500"><span>{te('paiement.totalHT')}</span><span className="font-semibold text-slate-700">{formatCurrency(results.subTotalHT, tc('currency'))}</span></div>
            {results.discountAmount > 0 && <div className="flex justify-between text-[10px] text-slate-500"><span>{te('paiement.remise')}</span><span className="font-semibold text-red-500">-{formatCurrency(results.discountAmount, tc('currency'))}</span></div>}
            {results.tvaRate > 0 && <div className="flex justify-between text-[10px] text-slate-500"><span>{te('paiement.vatLine', { rate: results.tvaRate })}</span><span className="font-semibold text-slate-700">{formatCurrency(results.tvaAmount, tc('currency'))}</span></div>}
            {results.timbreFiscal > 0 && <div className="flex justify-between text-[10px] text-slate-500"><span>{te('paiement.stampDuty')}</span><span className="font-semibold text-slate-700">{formatCurrency(results.timbreFiscal, tc('currency'))}</span></div>}
            {results.acompte > 0 && <div className="flex justify-between text-[10px] text-slate-500"><span>{te('paiement.depositPaid')}</span><span className="font-semibold text-red-500">-{formatCurrency(results.acompte, tc('currency'))}</span></div>}
            <div className="flex justify-between text-[11px] font-bold text-slate-900 border-t border-slate-200 pt-1"><span>{te('paiement.netToPay')}</span><span className="text-blue-600">{formatCurrency(results.netAPayer, tc('currency'))}</span></div>
          </div>
        </CollapsibleSection>;

      case 'notes':
        return <CollapsibleSection title={te('sections.notes')} sectionId="notes" {...dragProps} {...s()}>
          {!hiddenFields.has('notes') && <textarea placeholder={te('notes.placeholder')} className="w-full border p-2 rounded-lg text-[11px] h-16 resize-none outline-none focus:ring-2 focus:ring-blue-500" value={doc.notes ?? ''} onChange={(e) => updateDoc('notes', e.target.value)} />}
        </CollapsibleSection>;
      default: {
        const cs = customSections.find(c => c.id === id);
        if (cs) return renderCustomSection(cs, dragProps, s);
        return null;
      }
    }
  };

  function renderCustomSection(cs: CustomSectionDef, dragProps: { sectionOrder: string[]; moveSection: (id: string, dir: 'up' | 'down') => void }, s: (blockId?: any) => { blockId?: any; visible: boolean; onToggle: (b: any) => void }): React.ReactNode {
    return (
      <CollapsibleSection title={cs.label} sectionId={cs.id} {...dragProps} {...s()} defaultOpen={true}>
        {cs.fields.map(field => {
          const hiddenKey = `custom_${cs.id}_${field.id}`;
          if (hiddenFields.has(hiddenKey)) return null;
          const val = (doc.customFields[cs.id] ?? {})[field.id] ?? '';
          const onChange = (v: any) => updateCustomField(cs.id, field.id, v);
          switch (field.type) {
            case 'text':
            case 'number':
              return <div key={field.id}><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{field.label}</label><input type={field.type} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={val} onChange={(e) => onChange(field.type === 'number' ? (parseFloat(e.target.value) || '') : e.target.value)} /></div>;
            case 'date':
              return <div key={field.id}><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{field.label}</label><input type="date" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={val} onChange={(e) => onChange(e.target.value)} /></div>;
            case 'textarea':
              return <div key={field.id}><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{field.label}</label><textarea className="w-full border p-2 rounded-lg text-[11px] h-14 resize-none outline-none focus:ring-2 focus:ring-blue-500" value={val} onChange={(e) => onChange(e.target.value)} /></div>;
            case 'select':
              return <div key={field.id}><label className="block text-[9px] font-bold text-slate-400 mb-0.5">{field.label}</label><select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={val} onChange={(e) => onChange(e.target.value)}>{field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>;
          }
        })}
      </CollapsibleSection>
    );
  }

  return (
    <>
      <Navbar />
      <TrialGate>
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans print:bg-white">
        {/* ─── EDITOR TOP BAR ─── */}
        <div className="no-print flex justify-between items-center py-1.5 px-3 bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{doc.documentNumber}</span>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-[11px] font-bold text-slate-600">{doc.mode === 'entreprise' ? te('businessMode') : te('artisanMode')}</div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {['facture', 'devis'].map((t) => (
                <button key={t} onClick={() => updateDoc('documentType', t as any)}
                  className={cn('px-3 py-1 text-[11px] font-black rounded-md uppercase tracking-wider transition-all duration-200', doc.documentType === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800')}>
                  {t === 'facture' ? te('documentTypeInvoice') : te('documentTypeQuote')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!docIdParam && <button onClick={() => setShowCustomizer(true)} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              {te('customize')}
            </button>}
            {docIdParam && <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{te('editMode')}</span>}
            <Button size="sm" variant="secondary" onClick={saveDoc} disabled={saving}>{saving ? te('saving') : tc('save')}</Button>
            <Button size="sm" onClick={handleDownload} disabled={saving}>{te('downloadPdf')}</Button>
          </div>
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 print:block">
          {/* ═══ LEFT PANEL ═══ */}
          <div className="no-print space-y-3 h-[calc(100vh-80px)] overflow-y-auto text-[11px] pr-1">
            {(preferencesLoaded ? doc.sectionOrder.filter(id => (prefFields[id]?.length ?? 0) > 0) : doc.sectionOrder).map(id => <div key={id}>{renderSection(id)}</div>)}
          </div>

          {/* ═══ RIGHT PANEL: PREVIEW ═══ */}
          <div className="preview-container flex justify-center bg-slate-300/40 p-3 rounded-2xl border border-slate-400/20 overflow-y-auto h-[calc(100vh-80px)] print:h-auto print:bg-white print:p-0 print:border-none">
            <DocumentPreview doc={doc} results={results} customSections={customSections} hiddenFields={hiddenFields} />
          </div>
        </div>
      </div>

      {/* ─── CUSTOMIZATION MODAL — iOS style ─── */}
      {showCustomizer && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-lg sm:mx-3 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}>
            {/* Handle bar for mobile */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-slate-300" /></div>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">{te('customizeTitle')}</h3>
              <button onClick={() => setShowCustomizer(false)} className="text-slate-400 hover:text-slate-600 p-1 -mr-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {showSectionCreator ? (
                <SectionCreatorForm
                  initialSection={editingSection}
                  onSave={async (section) => {
                    if (editingSection?.id) {
                      await fetch('/api/user/custom-sections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section }) });
                    } else {
                      await fetch('/api/user/custom-sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section }) });
                    }
                    const res = await fetch('/api/user/custom-sections');
                    const data = await res.json();
                    setCustomSections(data.sections ?? []);
                    setFieldPrefs(prev => ({ ...(prev ?? {}), [section.id]: section.fields.map(f => f.id) }));
                    setDoc(prev => ({
                      ...prev,
                      sectionOrder: prev.sectionOrder.includes(section.id) ? prev.sectionOrder : [...prev.sectionOrder, section.id],
                    }));
                    setShowSectionCreator(false);
                    setEditingSection(null);
                  }}
                  onCancel={() => { setShowSectionCreator(false); setEditingSection(null); }}
                  te={te}
                />
              ) : (
                <>
                  <FieldSelector
                    sections={ALL_SECTIONS}
                    fieldPrefs={fieldPrefs ?? Object.fromEntries(ALL_SECTIONS.map(s => {
                      if (SECTION_FIELDS[s]) return [s, [...SECTION_FIELDS[s]]];
                      const cs = customSections.find(c => c.id === s);
                      if (cs) return [s, cs.fields.map(f => f.id)];
                      return [s, []];
                    }))}
                    setFieldPrefs={setFieldPrefs}
                    te={te}
                    SECTION_FIELDS={SECTION_FIELDS}
                    customSections={customSections}
                    onEditSection={cs => { setEditingSection(cs); setShowSectionCreator(true); }}
                    onDeleteSection={async id => {
                      if (!confirm('Supprimer cette section ?')) return;
                      await fetch(`/api/user/custom-sections?id=${id}`, { method: 'DELETE' });
                      setCustomSections(prev => prev.filter(c => c.id !== id));
                      setFieldPrefs(prev => { const { [id]: _, ...rest } = prev ?? {}; return rest; });
                      setDoc(prev => ({ ...prev, sectionOrder: prev.sectionOrder.filter(s => s !== id) }));
                    }}
                  />
                  <button onClick={() => { setEditingSection({ id: '', label: '', fields: [] }); setShowSectionCreator(true); }}
                    className="w-full mt-2 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition text-[12px]">
                    {te('addCustomSection') ?? '+ إضافة قسم مخصص'}
                  </button>
                </>
              )}
            </div>
            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex gap-2">
                <button onClick={() => {
                  const all = Object.fromEntries(ALL_SECTIONS.map(s => {
                    if (SECTION_FIELDS[s]) return [s, [...SECTION_FIELDS[s]]];
                    const cs = customSections.find(c => c.id === s);
                    if (cs) return [s, cs.fields.map(f => f.id)];
                    return [s, []];
                  }));
                  setFieldPrefs(all);
                }} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition">{te('selectAll')}</button>
                <button onClick={() => {
                  const none = Object.fromEntries(ALL_SECTIONS.map(s => [s, []]));
                  setFieldPrefs(none);
                }} className="text-[11px] font-semibold text-red-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition">{te('deselectAll')}</button>
              </div>
              <button onClick={() => savePreferences(fieldPrefs ?? Object.fromEntries(ALL_SECTIONS.map(s => {
                if (SECTION_FIELDS[s]) return [s, [...SECTION_FIELDS[s]]];
                const cs = customSections.find(c => c.id === s);
                if (cs) return [s, cs.fields.map(f => f.id)];
                return [s, []];
              })))}
                className="bg-blue-600 text-white text-[12px] font-semibold px-5 py-2 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition shadow-sm">{te('customizeSave')}</button>
            </div>
          </div>
        </div>
      )}
      </TrialGate>
    </>
  );

}

// ─── Section Creator Form ───
function SectionCreatorForm({ initialSection, onSave, onCancel, te }: {
  initialSection: CustomSectionDef | null; onSave: (s: CustomSectionDef) => void; onCancel: () => void; te: (k: string) => string;
}) {
  const [label, setLabel] = useState(initialSection?.label ?? '');
  const [fields, setFields] = useState<CustomFieldDef[]>(initialSection?.fields ?? []);
  const fieldTypes: CustomFieldType[] = ['text', 'number', 'date', 'textarea', 'select'];
  const addField = () => setFields(prev => [...prev, { id: `f_${Date.now()}`, label: '', type: 'text' }]);
  const removeField = (idx: number) => setFields(prev => prev.filter((_, i) => i !== idx));
  const updateField = (idx: number, upd: Partial<CustomFieldDef>) => setFields(prev => prev.map((f, i) => i === idx ? { ...f, ...upd } : f));
  const isValid = label.trim().length > 0 && fields.some(f => f.label.trim().length > 0);
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 mb-1">{te('sectionCreatorLabel') ?? 'Nom de la section'}</label>
        <input type="text" className="w-full border p-2 rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-blue-500" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Informations complémentaires" />
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {fields.map((field, idx) => (
          <div key={field.id} className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input type="text" className="flex-1 border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={field.label} onChange={e => updateField(idx, { label: e.target.value })} placeholder={te('sectionCreatorFieldLabel') ?? 'Libellé du champ'} />
              <select className="border p-1.5 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-blue-500" value={field.type} onChange={e => updateField(idx, { type: e.target.value as CustomFieldType })}>
                {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => removeField(idx)} className="text-red-400 hover:text-red-600 px-1">✕</button>
            </div>
            {field.type === 'select' && (
              <textarea className="w-full border p-1.5 rounded-lg text-[10px] h-12 resize-none outline-none focus:ring-2 focus:ring-blue-500" value={field.options?.join('\n') ?? ''} onChange={e => updateField(idx, { options: e.target.value.split('\n').filter(Boolean) })} placeholder={te('sectionCreatorOptions') ?? 'Une option par ligne'} />
            )}
          </div>
        ))}
      </div>
      <button onClick={addField} className="w-full py-1.5 border border-dashed border-slate-300 rounded-lg text-slate-400 hover:bg-slate-50 transition text-[11px] font-medium">+ {te('sectionCreatorAddField') ?? 'Ajouter un champ'}</button>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition">{te('sectionCreatorCancel') ?? 'Annuler'}</button>
        <button onClick={() => {
          if (!isValid) return;
          const id = initialSection?.id || `custom_${Date.now()}`;
          onSave({ id, label: label.trim(), fields });
        }} disabled={!isValid} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[11px] font-semibold hover:bg-blue-700 transition disabled:opacity-40">{te('sectionCreatorSave') ?? 'Enregistrer'}</button>
      </div>
    </div>
  );
}

// ─── Field Selector Component ───
function FieldSelector({ sections, fieldPrefs, setFieldPrefs, te, SECTION_FIELDS: sf, customSections, onEditSection, onDeleteSection }: {
  sections: string[]; fieldPrefs: Record<string, string[]>; setFieldPrefs: (p: Record<string, string[]>) => void; te: (k: string) => string; SECTION_FIELDS: Record<string, string[]>; customSections: CustomSectionDef[]; onEditSection?: (cs: CustomSectionDef) => void; onDeleteSection?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggleSection = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const getFields = (id: string): string[] => {
    if (sf[id]) return sf[id];
    const cs = customSections.find(c => c.id === id);
    if (cs) return cs.fields.map(f => f.id);
    return [];
  };
  const toggleAllInSection = (id: string) => {
    const selected = fieldPrefs[id] ?? [];
    const all = getFields(id);
    const allChecked = all.every(f => selected.includes(f));
    setFieldPrefs({ ...fieldPrefs, [id]: allChecked ? [] : [...all] });
  };
  const toggleField = (sectionId: string, fieldId: string) => {
    const selected = fieldPrefs[sectionId] ?? [];
    setFieldPrefs({ ...fieldPrefs, [sectionId]: selected.includes(fieldId) ? selected.filter(f => f !== fieldId) : [...selected, fieldId] });
  };
  const isBuiltinSection = (id: string) => DEFAULT_SECTION_ORDER.includes(id as any);
  const isBuiltinField = (fieldId: string) => Object.values(sf).some(arr => arr.includes(fieldId));
  const getSectionLabel = (id: string): string => {
    if (isBuiltinSection(id)) { const t = te(`sections.${id}`); if (t) return t; }
    const cs = customSections.find(c => c.id === id);
    return cs?.label ?? id;
  };
  const getFieldLabel = (sectionId: string, fieldId: string): string => {
    if (isBuiltinField(fieldId)) { const t = te(`fields.${fieldId}`); if (t) return t; }
    const cs = customSections.find(c => c.id === sectionId);
    const fd = cs?.fields.find(f => f.id === fieldId);
    return fd?.label ?? fieldId;
  };
  return (
    <div className="divide-y divide-slate-100">
      {sections.map(id => {
        const fields = getFields(id);
        const selected = fieldPrefs[id] ?? [];
        const isAll = fields.length > 0 && fields.every(f => selected.includes(f));
        const isNone = selected.length === 0;
        return (
          <div key={id} className="py-0.5">
            <button onClick={() => toggleSection(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <div onClick={(e) => { e.stopPropagation(); toggleAllInSection(id); }}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-150 ${isAll ? 'bg-blue-600 border-blue-600' : isNone ? 'border-slate-300 bg-white' : 'bg-blue-500 border-blue-500'}`}>
                  {isAll && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  {!isAll && !isNone && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
                </div>
              </div>
              <span className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 flex-1 text-left">{getSectionLabel(id)}</span>
              {!sf[id] && customSections.find(c => c.id === id) && onEditSection && (
                <span onClick={(e) => { e.stopPropagation(); onEditSection({ ...customSections.find(c => c.id === id)! }); }}
                  className="text-[10px] text-slate-400 hover:text-blue-600 px-1 py-0.5 rounded hover:bg-blue-50 transition cursor-pointer">✎</span>
              )}
              {!sf[id] && customSections.find(c => c.id === id) && onDeleteSection && (
                <span onClick={(e) => { e.stopPropagation(); onDeleteSection(id); }}
                  className="text-[10px] text-slate-300 hover:text-red-500 px-1 py-0.5 rounded hover:bg-red-50 transition cursor-pointer">✕</span>
              )}
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded.includes(id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${expanded.includes(id) ? 'max-h-96' : 'max-h-0'}`}>
              <div className="ml-10 mr-2 pb-1 space-y-0.5">
                {fields.map(fieldId => {
                  const isOn = selected.includes(fieldId);
                  return (
                    <button key={fieldId} onClick={() => toggleField(id, fieldId)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-50 transition group">
                      <span className={`text-[12px] ${isOn ? 'text-slate-700 font-medium' : 'text-slate-400'} text-left`}>{getFieldLabel(id, fieldId)}</span>
                      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${isOn ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isOn ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function EditorPage() {
  const tc = useTranslations('common');
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-pulse space-y-4 text-center"><div className="w-8 h-8 bg-slate-200 rounded-full mx-auto" /><p className="text-sm text-slate-400">{tc('loading')}</p></div></div>}>
      <EditorContent />
    </Suspense>
  );
}
