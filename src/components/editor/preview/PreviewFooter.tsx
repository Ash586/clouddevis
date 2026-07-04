'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import type { DocumentState } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';
import { formatCurrency } from '@/lib/calculations';

interface FooterProps {
  doc: DocumentState;
  results: {
    subTotalHT: number;
    discountAmount: number;
    tvaRate: number;
    tvaAmount: number;
    timbreFiscal: number;
    acompte: number;
    netAPayer: number;
    totalInWords: string;
  };
  design: DocTypeDesign;
  vb: (block: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  sf: (fieldId: string) => boolean;
  highlight?: boolean;
  onTotalsClick?: () => void;
  onPaymentClick?: () => void;
}

export function PreviewFooter({ doc, results, design, vb, bv, sf, highlight = false, onTotalsClick, onPaymentClick }: FooterProps) {
  const t = useTranslations('preview');
  const tcommon = useTranslations('common');

  return (
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
            <div onClick={onPaymentClick} title={onPaymentClick ? 'Cliquer pour modifier' : undefined}
              className={`bg-slate-50 p-2 rounded-lg border border-slate-100 ${onPaymentClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-300/40' : ''}`}>
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
          <div onClick={onTotalsClick} title={onTotalsClick ? 'Cliquer pour modifier' : undefined}
            className={`space-y-1 text-[11px] border-t border-slate-200 pt-2 transition-all duration-700 print:transition-none ${onTotalsClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-300/40 hover:bg-blue-50/20 rounded-lg p-2 -m-2' : ''} ${highlight ? 'ring-2 ring-blue-400/50 bg-blue-50/40 rounded-lg p-2 -m-2' : ''}`}>
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
            <div className="flex justify-between p-3 rounded-lg text-white mt-2" style={{ background: `linear-gradient(to right, ${design.gradientFrom}, ${design.gradientTo})` }}>
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('netToPay')}</span>
              <span className="text-base font-black">{formatCurrency(results.netAPayer, tcommon('currency'))}</span>
            </div>
          </div>
        </div>
      </div>

      {vb('tafqit') && (
        <div className="text-[9px] text-slate-500 border-t border-slate-100 pt-3 mb-2 leading-relaxed">
          <p className="font-semibold text-slate-700">
            {t('tafqitIntro', { docType: (doc.documentType || '').toLowerCase() })} <span className="font-bold">{formatCurrency(results.netAPayer, tcommon('currency'))}</span>
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {doc.companyInfo?.signature ? <img src={doc.companyInfo.signature} className="max-w-full max-h-full" alt={t('signatureStamp')} /> : t('signatureStamp')}
            </div>
          </div>
        </div>
      )}

      <div className="text-[7px] text-slate-300 text-center mt-3">{t('footer')}</div>
    </div>
  );
}
