'use client';
import React from 'react';
import type { DocumentState } from '@/types';
import type { DocTypeDesign } from '@/lib/documentDesign';

interface HeaderProps {
  doc: DocumentState;
  design: DocTypeDesign;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  t: (key: string) => string;
  highlight?: boolean;
  onZoneClick?: () => void;
}

const SIZE_CLASS: Record<string, string> = {
  sm: 'max-w-[60px]  max-h-[40px]',
  md: 'max-w-[110px] max-h-[60px]',
  lg: 'max-w-[180px] max-h-[90px]',
};

function LogoImg({ url, size = 'md' }: { url: string; size?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt="Logo"
      className={`object-contain ${SIZE_CLASS[size] ?? SIZE_CLASS.md}`}
    />
  );
}

export function PreviewHeader({ doc, design, sf, bv, vb, t, highlight = false, onZoneClick }: HeaderProps) {
  if (!vb('header') || !bv('docNumber', 'issueDate', 'validUntil', 'orderRef')) return null;

  const docTypeLabel =
    doc.documentType === 'devis'        ? t('docTypeQuote')    :
    doc.documentType === 'facture'      ? t('docTypeInvoice')  :
    doc.documentType === 'proforma'     ? t('docTypeProforma') :
    doc.documentType === 'bc'           ? t('docTypeOrder')    :
    doc.documentType === 'br'           ? t('docTypeBR')       :
    doc.documentType === 'bl'           ? t('docTypeBL')       :
    doc.documentType;

  // Logo resolution: companyInfo takes priority, then artisanInfo (not yet supported — future)
  const logoUrl: string | undefined = doc.companyInfo?.logo || undefined;
  const logoPos  = doc.logoPosition ?? 'right';
  const logoSize = doc.logoSize ?? 'md';

  const companyBlock = doc.mode === 'entreprise' && doc.companyInfo ? (
    <div style={{ background: design.primaryLight, borderColor: design.primaryHex }} className="p-3 rounded-lg border">
      <h2 className="text-sm font-black mb-1" style={{ color: design.primaryDark }}>{doc.companyInfo.name}</h2>
      {doc.companyInfo.address && <p className="text-[9px] text-slate-500 leading-relaxed">{doc.companyInfo.address}</p>}
      {doc.companyInfo.taxIds.nif && <p className="text-[8px] text-slate-400 mt-0.5">NIF: {doc.companyInfo.taxIds.nif}</p>}
      {doc.companyInfo.taxIds.rc  && <p className="text-[8px] text-slate-400">RC: {doc.companyInfo.taxIds.rc}</p>}
    </div>
  ) : doc.artisanInfo ? (
    <div style={{ background: design.primaryLight, borderColor: design.primaryHex }} className="p-3 rounded-lg border">
      <h2 className="text-sm font-black mb-1" style={{ color: design.primaryDark }}>{doc.artisanInfo.name}</h2>
      {doc.artisanInfo.address && <p className="text-[9px] text-slate-500 leading-relaxed">{doc.artisanInfo.address}</p>}
    </div>
  ) : (
    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-sm ms-auto">CD</div>
  );

  const docInfoBlock = (
    <div>
      <h1 className="text-[28px] font-black tracking-tight uppercase leading-none mb-2" style={{ color: design.primaryDark }}>
        {docTypeLabel}
      </h1>
      <div className="text-[10px] text-slate-500 font-semibold space-y-0.5">
        {sf('docNumber')  && <p>N° <span className="text-slate-700">{doc.documentNumber}</span></p>}
        {sf('issueDate')  && <p>{t('issueDate')} {doc.date}</p>}
        {sf('validUntil') && doc.validUntil && <p>{t('validUntil')} {doc.validUntil}</p>}
        {sf('orderRef')   && doc.bcRef && <p>{t('orderRef')} {doc.bcRef}</p>}
      </div>
    </div>
  );

  const wrapClass = `mb-8 transition-all duration-700 print:transition-none ${onZoneClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-300/40 hover:bg-blue-50/20 rounded-lg p-2 -m-2' : ''} ${highlight ? 'ring-2 ring-blue-400/50 bg-blue-50/40 rounded-lg p-2 -m-2' : ''}`;

  /* ── CENTER layout ── */
  if (logoUrl && logoPos === 'center') {
    return (
      <div className={wrapClass} onClick={onZoneClick} title={onZoneClick ? 'Cliquer pour modifier' : undefined}>
        <div className="flex justify-center mb-4">
          <LogoImg url={logoUrl} size={logoSize} />
        </div>
        <div className="flex justify-between items-start">
          {docInfoBlock}
          <div className="text-right max-w-[260px]">{companyBlock}</div>
        </div>
      </div>
    );
  }

  /* ── LEFT / RIGHT layout ── */
  const showLogoLeft  = !!(logoUrl && logoPos === 'left');
  const showLogoRight = !!(logoUrl && (logoPos === 'right' || !logoPos));

  return (
    <div className={`flex justify-between items-start ${wrapClass}`} onClick={onZoneClick} title={onZoneClick ? 'Cliquer pour modifier' : undefined}>
      {/* Left side */}
      <div className={`flex items-start gap-4 ${showLogoRight ? 'max-w-[50%]' : ''}`}>
        {showLogoLeft && <LogoImg url={logoUrl!} size={logoSize} />}
        {docInfoBlock}
      </div>
      {/* Right side */}
      <div className={`text-right max-w-[260px] ${showLogoLeft ? 'max-w-[50%]' : ''}`}>
        {showLogoRight && (
          <div className="flex justify-end mb-2">
            <LogoImg url={logoUrl!} size={logoSize} />
          </div>
        )}
        {companyBlock}
      </div>
    </div>
  );
}
