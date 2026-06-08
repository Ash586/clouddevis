'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Button } from '@/components/ui/button';
import { DocumentPreview } from '@/components/editor/DocumentPreview';
import { CollapsibleSection } from '@/components/editor/CollapsibleSection';
import { FieldSelector } from '@/components/editor/FieldSelector';
import { SectionCreatorForm } from '@/components/editor/SectionCreatorForm';
import { useEditor } from '@/hooks/useEditor';
import { useToast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/calculations';
import { generateDocumentHTML } from '@/lib/generateDocumentHTML';
import { validateNIF, validateRC, validateNIS, validateAI, validateLineItem } from '@/lib/validation';
import { UNIT_OPTIONS, CATEGORY_OPTIONS, DEFAULT_SECTION_ORDER, SECTION_FIELDS } from '@/types';
import type { UserMode, BlockId, SectionId, CustomSectionDef, CustomFieldDef, CustomFieldType } from '@/types';
import { cn } from '@/lib/utils';

function EditorContent() {
  const sp = useSearchParams();
  const modeParam = sp.get('mode') as UserMode | null;
  const docIdParam = sp.get('id');
  const { showToast } = useToast();
  const {
    doc, setDoc, mode, setMode,
    addingItem, setAddingItem, newItem, setNewItem,
    saving, results, draftRestored, setDraftRestored,
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
  const [allExpanded, setAllExpanded] = useState<boolean | null>(null);
  const [itemErrors, setItemErrors] = useState<string | null>(null);
  const [nifErrors, setNifErrors] = useState<Record<string, string>>({});
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

  const router = useRouter();

  const handleSave = async () => {
    await saveDoc();
    showToast(tc('save') + ' ✓', 'success');
  };

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

    const html = generateDocumentHTML({
      isEnt, docTypeLabel, vb, sf, bv, catLabels, paymentLabels, unitLabels,
      grouped, uncategorized, catOrder, doc, results,
      tc: (k: string) => tc(k),
      tp: (k: string, vars?: Record<string, any>) => tp(k, vars as any),
      te: (k: string) => te(k),
      tu: (k: string) => tu(k),
      customSections, currency: tc('currency'),
    });

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) { window.print(); return; }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // Keyboard shortcuts: Ctrl+S = save, Ctrl+P = print/download
  const saveDocRef = useRef(saveDoc);
  const handleDownloadRef = useRef(handleDownload);
  saveDocRef.current = saveDoc;
  handleDownloadRef.current = handleDownload;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleDownloadRef.current();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Show draft restoration notification
  useEffect(() => {
    if (draftRestored === 'unsaved_draft' && doc.clientInfo.name && !docIdParam) {
      showToast(te('draftRestored' as any) || 'Brouillon restauré ✓', 'success');
    }
    if (draftRestored) setDraftRestored(null);
  }, []);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (doc.items.length > 0 || doc.clientInfo.name) {
        saveDoc().then(() => showToast(tc('save') + ' ✓', 'success')).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [doc.items.length, doc.clientInfo.name, saveDoc, showToast, tc]);

  const unitLabels: Record<string, string> = { u: tu('u'), h: tu('h'), j: tu('j'), m2: tu('m2'), m3: tu('m3'), ml: tu('ml'), kg: tu('kg'), forfait: tu('forfait') };

  const renderSection = (id: SectionId): React.ReactNode => {
    const s = (blockId?: BlockId) => blockId ? { blockId, visible: isBlockVisible(blockId), onToggle: toggleBlock } : { visible: true, onToggle: () => {} };
    const dragProps = { sectionOrder: doc.sectionOrder, moveSection, ...(allExpanded !== null ? { forceOpen: allExpanded, forceClose: !allExpanded } : {}) };

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
          {!hiddenFields.has('clientNif') && mode === 'entreprise' && <div>
            <input type="text" placeholder={te('client.clientNif')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.clientInfo.nif && !validateNIF(doc.clientInfo.nif) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`} value={doc.clientInfo.nif ?? ''} onChange={(e) => updateClientInfo({ nif: e.target.value })} />
            {doc.clientInfo.nif && !validateNIF(doc.clientInfo.nif) && <span className="text-[8px] text-red-500">11 chiffres requis</span>}
          </div>}
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
              <div>
                <input type="text" placeholder={te('client.companyNif')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.nif && !validateNIF(doc.companyInfo.taxIds.nif) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`} value={doc.companyInfo.taxIds.nif} onChange={(e) => updateTaxIds({ nif: e.target.value })} />
                {doc.companyInfo.taxIds.nif && !validateNIF(doc.companyInfo.taxIds.nif) && <span className="text-[8px] text-red-500">11 chiffres requis</span>}
              </div>
              <div>
                <input type="text" placeholder={te('client.companyRc')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.rc && !validateRC(doc.companyInfo.taxIds.rc) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`} value={doc.companyInfo.taxIds.rc} onChange={(e) => updateTaxIds({ rc: e.target.value })} />
                {doc.companyInfo.taxIds.rc && !validateRC(doc.companyInfo.taxIds.rc) && <span className="text-[8px] text-red-500">Format RC invalide</span>}
              </div>
              <div>
                <input type="text" placeholder={te('client.companyNis')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.nis && !validateNIS(doc.companyInfo.taxIds.nis) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`} value={doc.companyInfo.taxIds.nis} onChange={(e) => updateTaxIds({ nis: e.target.value })} />
                {doc.companyInfo.taxIds.nis && !validateNIS(doc.companyInfo.taxIds.nis) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
              </div>
              <div>
                <input type="text" placeholder={te('client.companyAi')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.ai && !validateAI(doc.companyInfo.taxIds.ai) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`} value={doc.companyInfo.taxIds.ai} onChange={(e) => updateTaxIds({ ai: e.target.value })} />
                {doc.companyInfo.taxIds.ai && !validateAI(doc.companyInfo.taxIds.ai) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
              </div>
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
            <input type="text" placeholder={te('prestations.description')} className="w-full bg-white border p-1.5 sm:p-2 rounded-lg text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500" value={newItem.designation} onChange={(e) => setNewItem(p => ({ ...p, designation: e.target.value }))} />
            <div className="grid grid-cols-5 gap-1.5 items-end">
              <div><label className="block text-[9px] font-bold text-slate-400">{te('prestations.qty')}</label>
                <input type="number" className="w-full border p-1.5 sm:p-2 rounded-lg text-[11px] bg-white text-center outline-none focus:ring-2 focus:ring-blue-500" value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))} /></div>
              <div><label className="block text-[9px] font-bold text-slate-400">{te('prestations.unitPrice')}</label>
                <input type="number" className="w-full border p-1.5 sm:p-2 rounded-lg text-[11px] bg-white text-right outline-none focus:ring-2 focus:ring-blue-500" value={newItem.unitPrice} onChange={(e) => setNewItem(p => ({ ...p, unitPrice: parseFloat(e.target.value) || 0 }))} /></div>
              <div><label className="block text-[9px] font-bold text-slate-400">{te('prestations.unit')}</label>
                <select className="w-full border p-1.5 sm:p-2 rounded-lg text-[10px] bg-white outline-none focus:ring-2 focus:ring-blue-500" value={newItem.unit} onChange={(e) => setNewItem(p => ({ ...p, unit: e.target.value as any }))}>
                  {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{tu(u.labelKey)}</option>)}</select></div>
              <div><label className="block text-[9px] font-bold text-slate-400">{te('prestations.category')}</label>
                <select className="w-full border p-1.5 sm:p-2 rounded-lg text-[10px] bg-white outline-none focus:ring-2 focus:ring-blue-500" value={newItem.category ?? ''} onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))}>
                  <option value="">{te('prestations.noCategory')}</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{te(c.labelKey)}</option>)}</select></div>
              <div className="flex justify-center gap-1">
                <button onClick={() => { const v = validateLineItem(newItem); if (!v.valid) { setItemErrors(Object.values(v.errors)[0] ?? null); return; } setItemErrors(null); handleAddItem(); }} disabled={!newItem.designation || newItem.unitPrice <= 0} className="bg-green-600 text-white text-[11px] font-bold px-3 py-1.5 sm:py-2 min-h-[36px] rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">✓</button>
                <button onClick={() => { setAddingItem(false); setItemErrors(null); }} className="bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 sm:py-2 min-h-[36px] rounded-lg hover:bg-red-600">✕</button></div>
            </div>
            {itemErrors && <div className="text-[10px] text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">{itemErrors}</div>}
          </div>}
          {doc.items.map((item, idx) => (
            <div key={item.id} className="bg-slate-50 p-2 sm:p-3 rounded-xl border space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => { if (idx > 0) moveItem(idx, idx - 1); }} className="text-[9px] text-slate-400 hover:text-slate-600 p-1 min-w-[28px] flex justify-center">▲</button>
                    <button onClick={() => { if (idx < doc.items.length - 1) moveItem(idx, idx + 1); }} className="text-[9px] text-slate-400 hover:text-slate-600 p-1 min-w-[28px] flex justify-center">▼</button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-medium text-slate-800 truncate block">{item.designation}</span>
                    {item.category && <span className="text-[8px] text-slate-400 uppercase">{te(CATEGORY_OPTIONS.find(c => c.value === item.category)?.labelKey ?? 'preview.categories.none')}</span>}
                  </div>
                </div>
                <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 text-[11px] font-bold hover:text-red-700 shrink-0 ml-1 min-h-[36px] min-w-[36px] flex items-center justify-center">✕</button>
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
          {!addingItem && <button onClick={startNewItem} className="w-full py-3 sm:py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition text-[11px] min-h-[44px]">{te('prestations.addLine')}</button>}
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
        <div className="no-print flex flex-wrap items-center py-1.5 px-2 sm:px-3 bg-white border-b sticky top-0 z-50 shadow-sm gap-1">
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400">
              <button onClick={() => router.push('/dashboard')} className="hover:text-blue-600 transition font-medium">{tc('dashboard') || 'Dashboard'}</button>
              <span>/</span>
              <span className="text-slate-600 font-bold truncate max-w-[80px] sm:max-w-none">{doc.documentType === 'facture' ? te('documentTypeInvoice') : te('documentTypeQuote')}</span>
            </nav>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {['facture', 'devis'].map((t) => (
                <button key={t} onClick={() => updateDoc('documentType', t as any)}
                  className={cn('px-2 sm:px-3 py-1.5 text-[9px] sm:text-[11px] font-black rounded-md uppercase tracking-wider transition-all duration-200 min-w-[44px]', doc.documentType === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800')}>
                  {t === 'facture' ? te('documentTypeInvoice') : te('documentTypeQuote')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {!docIdParam && <button onClick={() => setShowCustomizer(true)} className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 w-8 h-8 sm:w-auto sm:px-2 rounded-lg transition" title={te('customize')}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              <span className="hidden sm:inline">{te('customize')}</span>
            </button>}
            <button onClick={() => setAllExpanded(prev => prev === true ? null : true)} className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 w-8 h-8 sm:w-auto sm:px-2 rounded-lg transition" title={allExpanded === true ? te('collapseAll') || 'Collapse all' : te('expandAll') || 'Expand all'}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={allExpanded === true ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} /></svg>
              <span className="hidden sm:inline">{allExpanded === true ? te('collapseAll') || 'Collapse' : te('expandAll') || 'Expand'}</span>
            </button>
            {docIdParam && <span className="text-[9px] sm:text-[10px] text-green-600 font-medium bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-full hidden sm:inline">{te('editMode')}</span>}
            <Button size="sm" variant="secondary" onClick={saveDoc} disabled={saving} className="min-h-[36px] text-[10px] sm:text-xs">{saving ? te('saving') : tc('save')}</Button>
            <Button size="sm" onClick={handleDownload} disabled={saving} className="min-h-[36px] text-[10px] sm:text-xs">{te('downloadPdf')}</Button>
          </div>
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-3 print:block">
          {/* ═══ LEFT PANEL ═══ */}
          <div className="no-print space-y-3 h-auto lg:h-[calc(100vh-80px)] overflow-y-auto text-[10px] sm:text-[11px] pr-0 sm:pr-1">
            {(preferencesLoaded ? doc.sectionOrder.filter(id => (prefFields[id]?.length ?? 0) > 0) : doc.sectionOrder).map(id => <div key={id}>{renderSection(id)}</div>)}
          </div>

          {/* ═══ RIGHT PANEL: PREVIEW ═══ */}
          <div className="hidden lg:flex preview-container flex-col bg-slate-300/40 p-3 rounded-2xl border border-slate-400/20 overflow-y-auto h-[calc(100vh-80px)] print:h-auto print:bg-white print:p-0 print:border-none">
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



export default function EditorPage() {
  const tc = useTranslations('common');
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-pulse space-y-4 text-center"><div className="w-8 h-8 bg-slate-200 rounded-full mx-auto" /><p className="text-sm text-slate-400">{tc('loading')}</p></div></div>}>
      <EditorContent />
    </Suspense>
  );
}
