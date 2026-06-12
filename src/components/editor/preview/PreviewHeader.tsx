'use client';
import React from 'react';
import type { DocumentState } from '@/types';

interface HeaderProps {
  doc: DocumentState;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  t: (key: string) => string;
  highlight?: boolean;
}

function LogoImg({ url }: { url: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Logo" className="max-w-[120px] max-h-[60px] object-contain" />;
}

export function PreviewHeader({ doc, sf, bv, vb, t, highlight = false }: HeaderProps) {
  const isEnt = doc.mode === 'entreprise';
  const docTypeLabel = doc.documentType === 'devis' ? t('docTypeQuote') : doc.documentType === 'facture' ? t('docTypeInvoice') : doc.documentType === 'proforma' ? t('docTypeProforma') : doc.documentType === 'bc' ? t('docTypeOrder') : doc.documentType === 'br' ? t('docTypeBR') : doc.documentType;

  if (!vb('header') || !bv('docNumber','issueDate','validUntil','orderRef')) return null;

  const logoUrl: string | undefined = isEnt ? doc.companyInfo?.logo : undefined;
  const logoPos = doc.logoPosition ?? 'right';
  const showLogoLeft = !!(logoUrl && logoPos === 'left');
  const showLogoRight = !!(logoUrl && logoPos === 'right');

  return (
    <div className={`flex justify-between items-start mb-8 transition-all duration-700 print:transition-none ${highlight ? 'ring-2 ring-blue-400/50 bg-blue-50/40 rounded-lg p-2 -m-2' : ''}`}>
      {/* LEFT SIDE: doc type + number + dates */}
      <div className={`flex items-start gap-4 ${showLogoRight ? 'max-w-[50%]' : ''}`}>
        {showLogoLeft && <LogoImg url={logoUrl!} />}
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
      {/* RIGHT SIDE: company info + logo */}
      <div className={`text-right max-w-[260px] ${showLogoLeft ? 'max-w-[50%]' : ''}`}>
        {showLogoRight && <div className="flex justify-end mb-2"><LogoImg url={logoUrl!} /></div>}
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
  );
}
