import type { DocumentState, CalculationResult } from '@/types';

interface GenerateInterventionHTMLParams {
  doc: DocumentState;
  results: CalculationResult;
  sf: (fieldId: string) => boolean;
  bv: (...fieldIds: string[]) => boolean;
  vb: (block: string) => boolean;
  tc: (key: string) => string;
  tp: (key: string, vars?: Record<string, string>) => string;
  currency: string;
  design: { borderColor: string; primaryHex: string; accent: string };
}

const e = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function generateInterventionHTML({
  doc,
  tc,
  tp,
  design,
}: GenerateInterventionHTMLParams): string {
  const intervention = (doc.customFields.intervention ?? {}) as Record<string, unknown>;
  const dateStr = new Date(doc.date).toLocaleDateString('fr-DZ');

  const verifications = (Array.isArray(intervention.verifications) ? intervention.verifications : []) as unknown[];
  const travaux = (Array.isArray(intervention.travaux) ? intervention.travaux : []) as unknown[];
  const pieces = (Array.isArray(intervention.pieces) ? intervention.pieces : []) as unknown[];

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'Intervention - ${e(doc.documentNumber)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 0 }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.5; color: #1a1a1a; background: white; }
    .page { width: 210mm; min-height: 297mm; background: white; margin: 0 auto; padding: 32px; }
    .header { border-bottom: 3px solid ${design.primaryHex}; margin-bottom: 24px; padding-bottom: 16px; }
    .header h1 { font-size: 28px; font-weight: 700; color: ${design.primaryHex}; margin-bottom: 12px; }
    .header-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; font-size: 12px; margin-top: 8px; }
    .header-grid > div { font-weight: 600; }
    .header-grid span { font-weight: 400; color: #666; display: block; margin-top: 2px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 8px; letter-spacing: 0.5px; }
    .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; font-size: 12px; }
    .info-block { background: #f9f9f9; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0; }
    .info-block strong { display: block; color: #333; margin-bottom: 4px; }
    .info-block span { color: #666; }
    .colored-block { padding: 12px; border-radius: 6px; border: 1px solid; margin-bottom: 8px; }
    .blue-block { background: #f0f7ff; border-color: #b3d9ff; }
    .green-block { background: #f0fdf4; border-color: #86efac; }
    .amber-block { background: #fffbf0; border-color: #fcd34d; }
    .indigo-block { background: #f0f4ff; border-color: #a5b4fc; }
    .list-item { font-size: 12px; margin: 6px 0; padding-left: 20px; position: relative; }
    .list-item:before { content: '•'; position: absolute; left: 0; color: ${design.primaryHex}; font-weight: bold; }
    .check-item { font-size: 12px; margin: 6px 0; padding-left: 20px; position: relative; }
    .check-item:before { content: '✓'; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
    .textarea-content { white-space: pre-wrap; word-wrap: break-word; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #444; }
    .spacer { flex: 1; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; }
    .sig-block { text-align: center; }
    .sig-line { height: 60px; border-bottom: 1px solid #333; margin-bottom: 8px; }
    .sig-label { font-size: 11px; font-weight: 600; }
    @media print {
      body { background: white; }
      .page { margin: 0; padding: 20mm; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <h1>Rapport d'Intervention</h1>
      <div class="header-grid">
        <div>N°: <span>${e(doc.documentNumber)}</span></div>
        <div>Date: <span>${dateStr}</span></div>
        <div style="text-align: right;">Technicien: <span>${e(String(intervention.intervenants ?? '—'))}</span></div>
      </div>
    </div>

    <!-- Client & Site -->
    <div class="info-row">
      <div>
        <div class="section-title">Client</div>
        <div class="info-block">
          <strong>${e(doc.clientInfo.name)}</strong>
          <span>${e(doc.clientInfo.address || '—')}<br>${e(doc.clientInfo.phone || '—')}</span>
        </div>
      </div>
      <div>
        <div class="section-title">Lieu d'intervention</div>
        <div class="info-block">
          <span>${e(doc.chantierAddress || '—')}</span>
        </div>
      </div>
    </div>

    <!-- Equipment -->
    <div class="section">
      <div class="section-title">Équipement</div>
      <div class="info-row">
        <div class="colored-block blue-block">
          <strong>Désignation</strong>
          <span>${e(String(intervention.equipementDesignation ?? '—'))}</span>
        </div>
        <div class="colored-block blue-block">
          <strong>Type</strong>
          <span>${e(String(intervention.equipementType ?? '—'))}</span>
        </div>
      </div>
      <div class="colored-block blue-block">
        <strong>N° Série</strong>
        <span>${e(String(intervention.equipementSerie ?? '—'))}</span>
      </div>
    </div>

    <!-- Visit Info -->
    <div class="section">
      <div class="section-title">Visite</div>
      <div class="info-row">
        <div class="colored-block green-block">
          <strong>Type de visite</strong>
          <span>${e(String(intervention.typeVisite ?? '—'))}</span>
        </div>
        <div class="colored-block green-block">
          <strong>Durée</strong>
          <span>${String(intervention.duree ?? 0)} heures</span>
        </div>
      </div>
    </div>

    <!-- Device State -->
    <div class="section">
      <div class="section-title">État Appareil</div>
      <div class="colored-block amber-block">
        <strong>État général</strong>
        <span>${e(String(intervention.etatAppareil ?? '—'))}</span>
      </div>
      ${String(intervention.defauts ?? '').trim() ? `
      <div class="colored-block" style="background: #fef2f2; border-color: #fca5a5;">
        <strong style="color: #dc2626;">Défauts constatés</strong>
        <div class="textarea-content" style="color: #991b1b; margin-top: 6px;">${e(String(intervention.defauts))}</div>
      </div>
      ` : ''}
    </div>

    <!-- Verifications -->
    ${verifications.length > 0 ? `
    <div class="section">
      <div class="section-title">Vérifications effectuées</div>
      ${verifications.map((item) => `<div class="check-item">${e(String(item))}</div>`).join('')}
    </div>
    ` : ''}

    <!-- Work Done -->
    ${travaux.length > 0 ? `
    <div class="section">
      <div class="section-title">Travaux effectués</div>
      ${travaux.map((item, i) => `<div class="list-item">${i + 1}. ${e(String(item))}</div>`).join('')}
    </div>
    ` : ''}

    <!-- Parts -->
    ${pieces.length > 0 ? `
    <div class="section">
      <div class="section-title">Pièces utilisées / Commandées</div>
      ${pieces.map((item) => `<div class="list-item">${e(String(item))}</div>`).join('')}
    </div>
    ` : ''}

    <!-- Notes -->
    ${doc.notes ? `
    <div class="section">
      <div class="section-title">Remarques</div>
      <div class="colored-block" style="background: #f3f4f6; border-color: #d1d5db;">
        <div class="textarea-content">${e(doc.notes)}</div>
      </div>
    </div>
    ` : ''}

    <!-- Signatures -->
    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Signature Client</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Signature Technicien</div>
      </div>
    </div>
  </div>

  <script>
    window.print();
  </script>
</body>
</html>`;
}
