'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import type { DocumentState, CalculationResult, CustomSectionDef } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface Props {
  doc: DocumentState;
  results: CalculationResult;
  customSections?: CustomSectionDef[];
  hiddenFields?: Set<string>;
}

export function DocumentPreview({ doc, results, customSections = [], hiddenFields }: Props) {
  const t = useTranslations('preview');
  const tcat = useTranslations('preview.categories');
  const tcommon = useTranslations('common');
  const tu = useTranslations('preview.units');
  const isEnt = doc.mode === 'entreprise';
  const UNIT_LABELS: Record<string, string> = { u:tu('u'), h:tu('h'), j:tu('j'), m2:tu('m2'), m3:tu('m3'), ml:tu('ml'), kg:tu('kg'), forfait:tu('forfait') };
  const CATEGORY_LABELS: Record<string, string> = {
    preparation: tcat('preparation'), peinture: tcat('peinture'), finition: tcat('finition'),
    revetement: tcat('revetement'), facade: tcat('facade'), enduit: tcat('enduit'),
    main_oeuvre: tcat('main_oeuvre'), materiaux: tcat('materiaux'), transport: tcat('transport'),
    divers: tcat('divers'), services: tcat('services'),
  };
  const docTypeLabel = doc.documentType === 'devis' ? t('docTypeQuote') : doc.documentType === 'facture' ? t('docTypeInvoice') : doc.documentType === 'proforma' ? t('docTypeProforma') : doc.documentType === 'bc' ? t('docTypeOrder') : doc.documentType === 'br' ? t('docTypeBR') : doc.documentType;
  const vb = (block: string) => !doc.hiddenBlocks.includes(block as any);
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

  return (
    <div id="print-area" className="w-[21cm] min-h-[29.7cm] bg-white p-10 flex flex-col justify-between shadow-md print:shadow-none border-t-[12px] border-slate-800">
      <div>
        {vb('header') && bv('docNumber','issueDate','validUntil','orderRef') && (
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start gap-4">
              <div>
                <h1 className="text-[28px] font-black text-slate-800 tracking-tight uppercase leading-none mb-2">{docTypeLabel}</h1>
                <div className="text-[10px] text-slate-500 font-semibold space-y-0.5">
                  {sf('docNumber') && <p>N° <span className="text-slate-700">{doc.documentNumber}</span></p>}
                  {sf('issueDate') && <p>{t('issueDate')} {doc.date}</p>}
                  {sf('validUntil') && doc.validUntil && <p>{t('validUntil')} {doc.validUntil}</p>}
                  {sf('orderRef') && doc.bcRef && <p>{t('orderRef')} {doc.bcRef}</p>}
                </div>
              </div>
            </div>
            <div className="text-right max-w-[260px]">
              {isEnt && doc.companyInfo ? (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h2 className="text-sm font-black text-slate-800 mb-1">{doc.companyInfo.name}</h2>
                  {doc.companyInfo.address && <p className="text-[9px] text-slate-500 leading-relaxed">{doc.companyInfo.address}</p>}
                  {doc.companyInfo.taxIds.nif && <p className="text-[8px] text-slate-400 mt-0.5">NIF: {doc.companyInfo.taxIds.nif}</p>}
                  {doc.companyInfo.taxIds.rc && <p className="text-[8px] text-slate-400">RC: {doc.companyInfo.taxIds.rc}</p>}
                </div>
              ) : doc.artisanInfo ? (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h2 className="text-sm font-black text-slate-800 mb-1">{doc.artisanInfo.name}</h2>
                  {doc.artisanInfo.address && <p className="text-[9px] text-slate-500 leading-relaxed">{doc.artisanInfo.address}</p>}
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-sm ml-auto">CD</div>
              )}
            </div>
          </div>
        )}

        {vb('client') && bv('clientName','clientAddress','clientPhone','clientEmail') && (
          <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm">
            <span className="text-[8px] font-bold uppercase tracking-[1.5px] text-slate-400 block mb-1">{t('billedTo')}</span>
            {sf('clientName') && <h3 className="text-sm font-bold text-slate-900 mb-0.5">{doc.clientInfo.name}</h3>}
            {sf('clientAddress') && doc.clientInfo.address && <p className="text-[10px] text-slate-500 leading-relaxed">{doc.clientInfo.address}</p>}
            {sf('clientPhone') && doc.clientInfo.phone && <p className="text-[9px] text-slate-400 mt-1">{doc.clientInfo.phone}</p>}
          </div>
        )}

        {vb('chantier') && bv('chantierAddress','chantierType','chantierCondition','chantierSurface','chantierProtection') && (
          <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200 max-w-md">
            <span className="text-[8px] font-bold uppercase tracking-[1.5px] text-amber-600 block mb-1">{t('chantier')}</span>
            <div className="text-[10px] text-slate-700 space-y-0.5">
              {sf('chantierAddress') && doc.chantierAddress && <p><span className="font-semibold">{t('chantierAddress')}</span> {doc.chantierAddress}</p>}
              {sf('chantierType') && doc.chantierType && <p><span className="font-semibold">{t('chantierType')}</span> {doc.chantierType}</p>}
              {sf('chantierSurface') && doc.chantierSurface > 0 && <p><span className="font-semibold">{t('chantierSurface')}</span> {doc.chantierSurface} m²</p>}
              {sf('chantierCondition') && doc.chantierEtat && <p><span className="font-semibold">{t('chantierCondition')}</span> {doc.chantierEtat}</p>}
              {sf('chantierProtection') && doc.chantierProtection && <p><span className="font-semibold">{t('chantierProtection')}</span> {doc.chantierProtection}</p>}
            </div>
          </div>
        )}

        {vb('materiaux') && bv('materiauxBrand','materiauxType','materiauxColor','materiauxQte') && (
          <div className="mb-6 p-3 bg-sky-50 rounded-xl border border-sky-200 max-w-md">
            <span className="text-[8px] font-bold uppercase tracking-[1.5px] text-sky-600 block mb-1">{t('materiaux')}</span>
            <div className="text-[10px] text-slate-700 space-y-0.5">
              {sf('materiauxBrand') && doc.materiauxMarque && <p><span className="font-semibold">{t('materiauxBrand')}</span> {doc.materiauxMarque}</p>}
              {sf('materiauxType') && doc.materiauxType && <p><span className="font-semibold">{t('materiauxType')}</span> {doc.materiauxType}</p>}
              {sf('materiauxColor') && doc.materiauxCouleur && <p><span className="font-semibold">{t('materiauxColor')}</span> {doc.materiauxCouleur}</p>}
              {sf('materiauxQte') && doc.materiauxQte > 0 && <p><span className="font-semibold">{t('materiauxQuantity')}</span> {doc.materiauxQte} L / m²</p>}
            </div>
          </div>
        )}

        {vb('table') && sf('itemsTable') && doc.items.length > 0 && (
          <table className="w-full text-left text-[10px] mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-500 text-[8px] font-black uppercase tracking-wider">
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
                        <div className="text-[9px] font-black uppercase tracking-wider text-blue-600">{catLabel}</div>
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
          const sectionHiddenFields = cs.fields.filter(f => !sf(`custom_${cs.id}_${f.id}`));
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
                  return <p key={f.id}><span className="font-semibold">{f.label}:</span> {v}</p>;
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex justify-between items-start pt-6 border-t-2 border-slate-200 mb-4">
          <div className="max-w-[280px] text-[8px] text-slate-400 leading-relaxed space-y-2">
            {vb('garanties') && bv('garantieLabor','garantieMaterials','garantieNotes') && (
              <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                <p className="text-[9px] font-bold text-green-700 mb-0.5">{t('garanties')}</p>
                {sf('garantieLabor') && doc.garantieMO && <p className="text-[8px] text-green-600">{t('garantiesMO')} {doc.garantieMO}</p>}
                {sf('garantieMaterials') && doc.garantieMateriaux && <p className="text-[8px] text-green-600">{t('garantiesMaterials')} {doc.garantieMateriaux}</p>}
                {sf('garantieNotes') && doc.garantieNotes && <p className="text-[8px] text-green-500 italic mt-0.5">{doc.garantieNotes}</p>}
              </div>
            )}

            {vb('payment') && bv('paymentMethod','paymentDeposit','paymentConditions','paymentIban') && (
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                {sf('paymentConditions') && doc.paymentDetails.terms && <p className="text-[8px] text-slate-600"><span className="font-semibold">{t('paymentLabel')}</span> {doc.paymentDetails.terms}</p>}
                {sf('paymentIban') && doc.paymentDetails.iban && <p className="text-[8px] text-slate-500 mt-0.5"><span className="font-semibold">{t('ibanLabel')}</span> {doc.paymentDetails.iban}</p>}
              </div>
            )}

            {vb('legal') && (
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <p className="text-slate-600 mb-0.5">{t('legalRecovery')}</p>
                <p>{t('legalRetention')}</p>
              </div>
            )}
          </div>

          <div className="w-64">
            {results.tvaRate > 0 && (
              <table className="w-full text-[10px] mb-2">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[8px] font-bold uppercase">
                    <th className="pb-1 text-left">{t('taxTableVatRate')}</th>
                    <th className="pb-1 text-right">{t('taxTableBase')}</th>
                    <th className="pb-1 text-right">{t('taxTableAmount')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-0.5 text-left font-medium">{results.tvaRate}%</td>
                    <td className="py-0.5 text-right font-medium">{formatCurrency(results.subTotalHT, tcommon('currency'))}</td>
                    <td className="py-0.5 text-right font-medium">{formatCurrency(results.tvaAmount, tcommon('currency'))}</td>
                  </tr>
                </tbody>
              </table>
            )}
            <div className="space-y-1 text-[11px] border-t border-slate-200 pt-2">
              <div className="flex justify-between font-medium text-slate-500">
                <span>{t('totalHT')}</span>
                <span className="text-slate-700">{formatCurrency(results.subTotalHT, tcommon('currency'))}</span>
              </div>
              {vb('remise') && bv('remiseType','remiseValue','remiseReason') && results.discountAmount > 0 && (
                <div className="flex justify-between font-medium text-red-500">
                  <span>{t('remise')}{doc.discount.reason ? ` (${doc.discount.reason})` : ''}</span>
                  <span>-{formatCurrency(results.discountAmount, tcommon('currency'))}</span>
                </div>
              )}
              {results.tvaRate > 0 && (
                <div className="flex justify-between font-medium text-slate-500">
                  <span>{t('vatLine', { rate: results.tvaRate })}</span>
                  <span className="text-slate-700">{formatCurrency(results.tvaAmount, tcommon('currency'))}</span>
                </div>
              )}
              {results.timbreFiscal > 0 && (
                <div className="flex justify-between font-medium text-slate-500">
                  <span>{t('stampDuty')}</span>
                  <span className="text-slate-700">{formatCurrency(results.timbreFiscal, tcommon('currency'))}</span>
                </div>
              )}
              {results.acompte > 0 && (
                <div className="flex justify-between font-medium text-slate-500">
                  <span>{t('depositPaid')}</span>
                  <span className="font-medium text-red-500">-{formatCurrency(results.acompte, tcommon('currency'))}</span>
                </div>
              )}
              <div className="flex justify-between p-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 text-white mt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">{t('netToPay')}</span>
                <span className="text-base font-black">{formatCurrency(results.netAPayer, tcommon('currency'))}</span>
              </div>
            </div>
          </div>
        </div>

        {vb('tafqit') && (
          <div className="text-[9px] text-slate-500 border-t border-slate-100 pt-3 mb-2 leading-relaxed">
            <p className="font-semibold text-slate-700">
              {t('tafqitIntro', { docType: docTypeLabel.toLowerCase() })} <span className="font-bold">{formatCurrency(results.netAPayer, tcommon('currency'))}</span>
            </p>
            {results.tvaAmount > 0 && (
              <p className="text-[8px] text-slate-400 mt-1 italic">{t('tafqitVatNote', { amount: formatCurrency(results.tvaAmount) })}</p>
            )}
            <p className="text-[9px] text-slate-600 mt-2 font-medium border-t border-dotted border-slate-200 pt-2">
              {results.totalInWords}
            </p>
          </div>
        )}

        {vb('signature') && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
            <div>
              <p className="text-[9px] text-slate-400">{t('signatureLine', { city: doc.companyInfo?.address?.split(',')[0] ?? '________', date: doc.date })}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 mb-1">{t('signatureLabel')}</p>
              <div className="w-28 h-14 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[8px] text-slate-300">
                {doc.companyInfo?.signature ? <img src={doc.companyInfo.signature} className="max-w-full max-h-full" alt={t('signatureStamp')} /> : t('signatureStamp')}
              </div>
            </div>
          </div>
        )}

        <div className="text-[7px] text-slate-300 text-center mt-3">{t('footer')}</div>
      </div>
    </div>
  );
}
