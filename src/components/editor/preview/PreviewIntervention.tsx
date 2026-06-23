'use client';
import React from 'react';
import type { DocumentState, CalculationResult } from '@/types';

interface PreviewInterventionProps {
  doc: DocumentState;
  results: CalculationResult;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  t: (key: string) => string;
  tc: (key: string) => string;
  tu: (key: string) => string;
  design: { borderColor: string; primaryHex: string; accent: string };
  highlight?: string | null;
}

export function PreviewIntervention({ doc, sf, t, tc, design, highlight }: PreviewInterventionProps) {
  const intervention = (doc.customFields.intervention ?? {}) as Record<string, unknown>;

  return (
    <div id="print-area" className="w-[21cm] min-h-[29.7cm] bg-white p-8 flex flex-col shadow-md print:shadow-none relative" style={{ borderTop: `12px solid ${design.borderColor}` }}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b-2" style={{ borderColor: design.primaryHex }}>
        <h1 className="text-2xl font-bold" style={{ color: design.primaryHex }}>Rapport d'Intervention</h1>
        <div className="grid grid-cols-3 gap-4 text-xs mt-2">
          <div><span className="font-bold">N°:</span> {doc.documentNumber}</div>
          <div><span className="font-bold">Date:</span> {new Date(doc.date).toLocaleDateString('fr-DZ')}</div>
          <div className="text-right"><span className="font-bold">Technicien:</span> {String(intervention.intervenants ?? '—')}</div>
        </div>
      </div>

      {/* Client & Site Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Client</h3>
          <p className="text-sm font-bold">{doc.clientInfo.name}</p>
          <p className="text-xs text-slate-600">{doc.clientInfo.address}</p>
          <p className="text-xs text-slate-600">{doc.clientInfo.phone}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Lieu d'intervention</h3>
          <p className="text-sm">{doc.chantierAddress || '—'}</p>
        </div>
      </div>

      {/* Equipment Section */}
      <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">Équipement</h3>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-600">Désignation:</span>
            <p className="text-slate-800">{String(intervention.equipementDesignation ?? '—')}</p>
          </div>
          <div>
            <span className="font-bold text-slate-600">Type:</span>
            <p className="text-slate-800">{String(intervention.equipementType ?? '—')}</p>
          </div>
          <div>
            <span className="font-bold text-slate-600">Série:</span>
            <p className="text-slate-800">{String(intervention.equipementSerie ?? '—')}</p>
          </div>
        </div>
      </div>

      {/* Visit Info */}
      <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
        <div className="p-2 bg-blue-50 rounded border border-blue-200">
          <span className="font-bold text-blue-700">Type de visite</span>
          <p className="text-sm">{String(intervention.typeVisite ?? '—')}</p>
        </div>
        <div className="p-2 bg-green-50 rounded border border-green-200">
          <span className="font-bold text-green-700">Durée</span>
          <p className="text-sm">{String(intervention.duree ?? '—')} h</p>
        </div>
        <div className="p-2 bg-purple-50 rounded border border-purple-200">
          <span className="font-bold text-purple-700">État appareil</span>
          <p className="text-sm">{String(intervention.etatAppareil ?? '—')}</p>
        </div>
      </div>

      {/* Defects */}
      {String(intervention.defauts ?? '').trim() && (
        <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-xs font-bold uppercase text-red-700 mb-2">Défauts constatés</h3>
          <p className="text-xs text-slate-800 whitespace-pre-wrap">{String(intervention.defauts)}</p>
        </div>
      )}

      {/* Verifications Checklist */}
      {(intervention.verifications as string[])?.length > 0 && (
        <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">Vérifications effectuées</h3>
          <div className="space-y-1">
            {(intervention.verifications as string[]).map((item, i) => (
              <p key={i} className="text-xs flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span> {item}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Work Done */}
      {(intervention.travaux as string[])?.length > 0 && (
        <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="text-xs font-bold uppercase text-amber-700 mb-2">Travaux effectués</h3>
          <div className="space-y-1">
            {(intervention.travaux as string[]).map((item, i) => (
              <p key={i} className="text-xs">{i + 1}. {item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Parts Used */}
      {(intervention.pieces as string[])?.length > 0 && (
        <div className="mb-6 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="text-xs font-bold uppercase text-indigo-700 mb-2">Pièces utilisées/commandées</h3>
          <div className="space-y-1">
            {(intervention.pieces as string[]).map((item, i) => (
              <p key={i} className="text-xs">• {item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {doc.notes && (
        <div className="mb-6 p-3 bg-slate-100 rounded-lg border border-slate-300">
          <h3 className="text-xs font-bold uppercase text-slate-700 mb-1">Remarques</h3>
          <p className="text-xs text-slate-800">{doc.notes}</p>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Signature Block */}
      <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-slate-300">
        <div className="text-center text-xs">
          <p className="h-16 mb-2 border-b border-slate-400" />
          <p className="font-bold">Signature Client</p>
        </div>
        <div className="text-center text-xs">
          <p className="h-16 mb-2 border-b border-slate-400" />
          <p className="font-bold">Signature Technicien</p>
        </div>
      </div>
    </div>
  );
}
