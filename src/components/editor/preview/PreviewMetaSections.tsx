'use client';
import React from 'react';
import type { DocumentState } from '@/types';

interface MetaSectionsProps {
  doc: DocumentState;
  sf: (fieldId: string) => boolean;
  vb: (block: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  t: (key: string) => string;
  highlight?: boolean;
  onZoneClick?: () => void;
}

export function PreviewMetaSections({ doc, sf, vb, bv, t, highlight = false, onZoneClick }: MetaSectionsProps) {
  return (
    <>
      {vb('client') && bv('clientName','clientAddress','clientPhone','clientEmail') && (
        <div onClick={onZoneClick} title={onZoneClick ? 'Cliquer pour modifier' : undefined}
          className={`mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm transition-all duration-700 print:transition-none ${onZoneClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-300/40' : ''} ${highlight ? 'ring-2 ring-blue-400/50 bg-blue-50/60' : ''}`}>
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
    </>
  );
}
