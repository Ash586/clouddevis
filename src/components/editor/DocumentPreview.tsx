'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import type { DocumentState, CalculationResult, CustomSectionDef, BlockId } from '@/types';
import { ALL_CATEGORY_OPTIONS } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { PreviewHeader } from './preview/PreviewHeader';
import { PreviewMetaSections } from './preview/PreviewMetaSections';
import { PreviewFooter } from './preview/PreviewFooter';
import { PreviewAttachement } from './preview/PreviewAttachement';
import { PreviewDevis } from './preview/PreviewDevis';
import { PreviewNordic } from './preview/PreviewNordic';
import { PreviewVelours } from './preview/PreviewVelours';
import { PreviewBonCommande } from './preview/PreviewBonCommande';
import { PreviewIntervention } from './preview/PreviewIntervention';
import { getDesign } from '@/lib/documentDesign';

export type PreviewFocus = 'header' | 'client' | 'items' | 'totals' | 'payment' | null;

interface Props {
  doc: DocumentState;
  results: CalculationResult;
  customSections?: CustomSectionDef[];
  hiddenFields?: Set<string>;
  previewFocus?: PreviewFocus;
  showGrid?: boolean;
}

export function DocumentPreview({ doc, results, customSections = [], hiddenFields, previewFocus = null, showGrid = false }: Props) {
  const t = useTranslations('preview');
  const tcat = useTranslations('preview.categories');
  const tcommon = useTranslations('common');
  const tu = useTranslations('preview.units');
  const UNIT_LABELS: Record<string, string> = { u:tu('u'), h:tu('h'), j:tu('j'), m2:tu('m2'), m3:tu('m3'), ml:tu('ml'), kg:tu('kg'), forfait:tu('forfait') };
  const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
    ALL_CATEGORY_OPTIONS
      .filter(c => c.value)
      .map(c => [c.value, tcat(c.labelKey.replace(/^preview\.categories\./, ''))])
  );
  const design = getDesign(doc.documentType);
  const vb = (block: string) => !doc.hiddenBlocks.includes(block as BlockId);
  const hf = new Set(hiddenFields ?? []);
  const sf = (fieldId: string) => !hf.has(fieldId);
  const bv = (...fieldIds: string[]) => fieldIds.some(f => sf(f));

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

  const categoryOrder = ['preparation', 'peinture', 'finition', 'revetement', 'facade', 'enduit', 'main_oeuvre', 'materiaux', 'transport', 'divers'];

  if (doc.documentType === 'attachement') {
    return <PreviewAttachement doc={doc} sf={sf} bv={bv} vb={vb} t={t} tu={tu} design={design} highlight={previewFocus} />;
  }

  if (doc.documentType === 'bc') {
    return <PreviewBonCommande doc={doc} results={results} sf={sf} bv={bv} vb={vb} t={t} tc={tcommon} tu={tu} design={design} highlight={previewFocus} />;
  }

  if (doc.documentType === 'intervention') {
    return <PreviewIntervention doc={doc} results={results} sf={sf} bv={bv} vb={vb} t={t} tc={tcommon} tu={tu} design={design} highlight={previewFocus} />;
  }

  const sharedProps = { doc, sf, bv, vb, t, tc: tcommon, tu, results, design, highlight: previewFocus };

  if (doc.previewTemplate === 'nordic') {
    return <PreviewNordic {...sharedProps} />;
  }

  if (doc.previewTemplate === 'velours') {
    return <PreviewVelours {...sharedProps} />;
  }

  if (doc.documentType === 'devis') {
    return <PreviewDevis doc={doc} sf={sf} bv={bv} vb={vb} t={t} tc={tcommon} tu={tu} results={results} design={design} highlight={previewFocus} />;
  }

  return (
    <div id="print-area" className={`w-[21cm] min-h-[29.7cm] bg-white p-10 flex flex-col justify-between shadow-md print:shadow-none relative ${showGrid ? 'print:grid' : ''}`} style={{ borderTop: `12px solid ${design.borderColor}` }}>
      {showGrid && <div className="absolute inset-0 pointer-events-none print:hidden" style={{ backgroundImage: 'linear-gradient(rgba(200,200,200,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(200,200,200,0.15) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />}
      <div>
        <PreviewHeader doc={doc} design={design} sf={sf} bv={bv} vb={vb} t={t} highlight={previewFocus === 'header'} />
        <PreviewMetaSections doc={doc} sf={sf} vb={vb} bv={bv} t={t} highlight={previewFocus === 'client'} />

        {vb('table') && sf('itemsTable') && doc.items.length > 0 && (
          <div className={`mb-6 rounded-lg transition-all duration-700 print:rounded-none ${previewFocus === 'items' ? 'ring-2 ring-blue-400/50 bg-blue-50/40 p-2 -m-2' : ''}`}>
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr style={{ borderBottom: `2px solid ${design.primaryHex}`, color: design.primaryHex }} className="text-[8px] font-black uppercase tracking-wider">
                <th className="pb-2 pr-2 w-8">{t('tableHash')}</th>
                <th className="pb-2">{t('tableDescription')}</th>
                <th className="pb-2 text-center w-12">{t('tableQty')}</th>
                <th className="pb-2 text-right w-16">{t('tableUnitPrice')}</th>
                <th className="pb-2 text-right w-16">{t('tableTotalHT')}</th>
              </tr>
            </thead>
            <tbody>
              {(function() {
                let rowIdx = 0;
                const rows: React.ReactNode[] = [];

                for (const item of uncategorized) {
                  rowIdx++;
                  rows.push(
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-2.5 pr-2 text-slate-300 font-bold">{rowIdx}</td>
                      <td className="py-2.5 font-semibold text-slate-700">{item.designation}</td>
                      <td className="py-2.5 text-center font-medium text-slate-600">{item.quantity} {UNIT_LABELS[item.unit] ?? item.unit}</td>
                      <td className="py-2.5 text-right font-medium text-slate-600">{item.unitPrice.toLocaleString('fr-DZ')} {tcommon('currency')}</td>
                      <td className="py-2.5 text-right font-black text-slate-900">{(item.quantity * item.unitPrice).toLocaleString('fr-DZ')} {tcommon('currency')}</td>
                    </tr>
                  );
                }

                const allCats = [...categoryOrder, ...Object.keys(grouped).filter(c => !categoryOrder.includes(c))];
                for (const cat of allCats) {
                  const items = grouped[cat];
                  if (!items) continue;
                  const catLabel = CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
                  rows.push(
                    <tr key={'h-'+cat}>
                      <td colSpan={5} className="pt-3 pb-1.5">
                        <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: design.accent }}>{catLabel}</div>
                      </td>
                    </tr>
                  );
                  for (const item of items) {
                    rowIdx++;
                    rows.push(
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-2 pr-2 text-slate-300 font-bold">{rowIdx}</td>
                        <td className="py-2 font-semibold text-slate-700">{item.designation}</td>
                        <td className="py-2 text-center font-medium text-slate-600">{item.quantity} {UNIT_LABELS[item.unit] ?? item.unit}</td>
                        <td className="py-2 text-right font-medium text-slate-600">{item.unitPrice.toLocaleString('fr-DZ')} {tcommon('currency')}</td>
                        <td className="py-2 text-right font-black text-slate-900">{(item.quantity * item.unitPrice).toLocaleString('fr-DZ')} {tcommon('currency')}</td>
                      </tr>
                    );
                  }
                }
                return rows;
              })()}
            </tbody>
          </table>
          </div>
        )}

        {vb('situations') && (
          <div className="mb-6">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 text-[8px] font-black uppercase tracking-wider">
                  <th className="pb-1.5 text-left">{t('tableSituation')}</th>
                  <th className="pb-1.5 text-right">{t('tableAmountHT')}</th>
                  <th className="pb-1.5 text-right">{t('tableVat')}</th>
                  <th className="pb-1.5 text-right">{t('tableNetTTC')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1 font-medium">100%</td>
                  <td className="py-1 text-right font-medium">{formatCurrency(results.subTotalHT, tcommon('currency'))}</td>
                  <td className="py-1 text-right font-medium">{formatCurrency(results.tvaAmount, tcommon('currency'))}</td>
                  <td className="py-1 text-right font-black">{formatCurrency(results.totalTTC, tcommon('currency'))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {customSections.map(cs => {
          const sectionData = doc.customFields[cs.id];
          const visibleFields = cs.fields.filter(f => sf(`custom_${cs.id}_${f.id}`));
          const hasVisibleData = sectionData && visibleFields.some(f => {
            const v = sectionData[f.id];
            return v !== undefined && v !== null && v !== '';
          });
          if (!vb(cs.id) || !hasVisibleData) return null;
          return (
            <div key={cs.id} className="mb-6 p-3 bg-white rounded-xl border border-slate-200 max-w-md">
              <span className="text-[8px] font-bold uppercase tracking-[1.5px] text-slate-500 block mb-1">{cs.label}</span>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                {visibleFields.map(f => {
                  const v = sectionData[f.id];
                  if (v === undefined || v === null || v === '') return null;
                  return <p key={f.id}><span className="font-semibold">{f.label}:</span> {String(v)}</p>;
                })}
              </div>
            </div>
          );
        })}
      </div>

      <PreviewFooter doc={doc} results={results} design={design} vb={vb} bv={bv} sf={sf} highlight={previewFocus === 'totals' || previewFocus === 'payment'} />
    </div>
  );
}
