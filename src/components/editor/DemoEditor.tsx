'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DocumentPreview } from './DocumentPreview';
import { calculateDocument, formatDateISO, generateId } from '@/lib/calculations';
import type { DocumentState, LineItem, UnitMeasure } from '@/types';
import { Button } from '@/components/ui/button';
import { DEFAULT_SECTION_ORDER } from '@/types';

function createDemoDoc(t: (key: string) => string): DocumentState {
  return {
    mode: 'entreprise',
    clientInfo: {
      name: t('defaults.clientName'),
      address: t('defaults.clientAddress'),
      phone: '0550 12 34 56',
      email: 'contact@btp-plus.dz',
    },
    companyInfo: {
      name: t('defaults.companyName'),
      address: t('defaults.companyAddress'),
      taxIds: { nif: '019923456789012', rc: '19B12345678901', nis: '019923456789012345', ai: '0199234567890123' },
      capital: t('defaults.companyCapital'),
    },
    items: [
      { id: generateId(), designation: t('defaults.item1'), quantity: 85, unit: 'm2' as UnitMeasure, unitPrice: 490 },
      { id: generateId(), designation: t('defaults.item2'), quantity: 42, unit: 'm2' as UnitMeasure, unitPrice: 1250 },
      { id: generateId(), designation: t('defaults.item3'), quantity: 1, unit: 'forfait' as UnitMeasure, unitPrice: 45000 },
      { id: generateId(), designation: t('defaults.item4'), quantity: 38, unit: 'm2' as UnitMeasure, unitPrice: 780 },
    ],
    tvaRate: 19,
    paymentMode: 'virement',
    documentType: 'devis',
    documentNumber: 'DEV-2026-00001',
    date: formatDateISO(new Date()),
    validUntil: formatDateISO(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    discount: { type: 'percentage', value: 0, reason: '' },
    stampDuty: { rate: 1, minAmount: 5, maxAmount: 2500 },
    paymentDetails: { terms: t('defaults.paymentTerms'), iban: 'FR76 1234 5678 9012 3456 7890 123' },
    hiddenBlocks: [],
    chantierAddress: '',
    chantierType: 'Appartement',
    chantierSurface: 0,
    chantierEtat: 'Neuf',
    chantierProtection: "À charge du prestataire",
    materiauxMarque: '',
    materiauxType: 'Peinture acrylique mat',
    materiauxCouleur: '',
    materiauxQte: 0,
    garantieMO: '1 an',
    garantieMateriaux: '2 ans',
    garantieNotes: '',
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    notes: '',
    customFields: {},
  };
}

interface Props {
  onDownload: () => void;
}

export function DemoEditor({ onDownload }: Props) {
  const t = useTranslations('demo');
  const tc = useTranslations('common');
  const pu = useTranslations('preview.units');
  const [doc, setDoc] = useState<DocumentState>(() => createDemoDoc(t));
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const results = useMemo(() => calculateDocument(doc), [doc]);

  const updateClient = (field: keyof typeof doc.clientInfo, value: string) => {
    setDoc(prev => ({ ...prev, clientInfo: { ...prev.clientInfo, [field]: value } }));
  };

  const updateCompany = (field: string, value: string) => {
    setDoc(prev => ({
      ...prev,
      companyInfo: prev.companyInfo ? { ...prev.companyInfo, [field]: value } : prev.companyInfo,
    }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setDoc(prev => ({
      ...prev,
      items: prev.items.map(it => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  };

  const removeItem = (id: string) => {
    setDoc(prev => ({ ...prev, items: prev.items.filter(it => it.id !== id) }));
  };

  const addItem = () => {
    setDoc(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), designation: t('defaults.newItemName'), quantity: 1, unit: 'u' as UnitMeasure, unitPrice: 0 }],
    }));
  };

  const toggleMode = () => {
    const newMode = doc.mode === 'artisan' ? 'entreprise' : 'artisan';
    setDoc(prev => ({
      ...prev,
      mode: newMode,
      companyInfo: newMode === 'entreprise'
        ? { name: t('defaults.companyName'), address: t('defaults.companyAddress'), taxIds: { nif: '', rc: '', nis: '', ai: '' }, capital: '' }
        : undefined,
      artisanInfo: newMode === 'artisan' ? { name: t('defaults.companyName'), address: t('defaults.companyAddress'), phone: '' } : undefined,
      tvaRate: newMode === 'artisan' ? 0 : 19,
    }));
  };

  const UNIT_LABELS: Record<string, string> = { u: pu('u'), h: pu('h'), j: pu('j'), m2: pu('m2'), m3: pu('m3'), ml: pu('ml'), kg: pu('kg'), forfait: pu('forfait') };

  const UNIT_OPTIONS_LOCAL = [
    { value: 'u', label: pu('u') },
    { value: 'h', label: pu('h') },
    { value: 'j', label: pu('j') },
    { value: 'm2', label: pu('m2') },
    { value: 'm3', label: pu('m3') },
    { value: 'ml', label: pu('ml') },
    { value: 'kg', label: pu('kg') },
    { value: 'forfait', label: pu('forfait') },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 sm:gap-6">
      {/* Preview toggle on mobile */}
      <button onClick={() => setShowPreview(!showPreview)}
        className="lg:hidden text-[11px] font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPreview ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} /></svg>
        {showPreview ? t('mode') + ' ✕' : t('livePreview')}
      </button>

      {/* Left Panel — Form */}
      <div className={`w-full lg:flex-1 max-w-lg space-y-5 overflow-y-auto ${showPreview ? 'hidden lg:block' : ''}`}>
        {/* Mode toggle */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('mode')}</span>
          <button
            onClick={toggleMode}
            className={`relative w-12 h-6 rounded-full transition-colors ${doc.mode === 'entreprise' ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${doc.mode === 'entreprise' ? 'translate-x-6' : ''}`} />
          </button>
          <span className="text-xs font-semibold text-slate-700">{doc.mode === 'entreprise' ? t('entreprise') : t('artisan')}</span>
        </div>

        {/* Client */}
        <fieldset className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <legend className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">{t('client')}</legend>
          <input className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" value={doc.clientInfo.name} onChange={e => updateClient('name', e.target.value)} placeholder={t('clientNamePlaceholder')} />
          <input className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" value={doc.clientInfo.address} onChange={e => updateClient('address', e.target.value)} placeholder={t('addressPlaceholder')} />
          <div className="flex gap-2">
            <input className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" value={doc.clientInfo.phone} onChange={e => updateClient('phone', e.target.value)} placeholder={t('phonePlaceholder')} />
            <input className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" value={doc.clientInfo.email} onChange={e => updateClient('email', e.target.value)} placeholder={t('emailPlaceholder')} />
          </div>
        </fieldset>

        {/* Items */}
        <fieldset className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <legend className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">{t('prestations')}</legend>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {doc.items.map(item => (
              <div key={item.id} className="flex items-start gap-1.5 bg-slate-50 rounded-lg p-2">
                <div className="flex-1 min-w-0">
                  <input
                    className="w-full text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 mb-1"
                    value={item.designation} onChange={e => updateItem(item.id, 'designation', e.target.value)}
                    placeholder={t('designation')}
                  />
                  <div className="flex gap-1">
                    <input
                      className="w-14 text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-right"
                      type="number" min="0" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                    />
                    <select
                      className="text-[11px] border border-slate-200 rounded-md px-1.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value as UnitMeasure)}
                    >
                      {UNIT_OPTIONS_LOCAL.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <input
                      className="w-20 text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-right"
                      type="number" min="0" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      placeholder={t('unitPricePlaceholder')}
                    />
                    <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap self-center min-w-[60px] text-right">
                      {(item.quantity * item.unitPrice).toLocaleString('fr-DZ')} {tc('currency')}
                    </span>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-sm leading-none mt-0.5">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addItem} className="w-full text-[11px]">{t('addLine')}</Button>
        </fieldset>

        {/* Download button */}
        <Button onClick={onDownload} className="w-full">
          {t('downloadPdf')}
        </Button>
      </div>

      {/* Right Panel — Live Preview */}
      <div className={`w-full lg:flex-1 min-w-0 overflow-y-auto rounded-xl border border-slate-200 shadow-lg bg-white ${showPreview ? '' : 'hidden lg:block'}`}>
        <div className="sticky top-0 bg-slate-900 text-white px-4 py-2 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('livePreview')}</span>
          </div>
          <span className="text-[9px] text-slate-500">{doc.items.length} {doc.items.length > 1 ? t('itemPlural') : t('itemSingular')}</span>
        </div>
        <div className="p-4 flex justify-center bg-slate-100">
          <div className="scale-[0.55] origin-top transform-gpu w-[21cm]">
            <DocumentPreview doc={doc} results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}
