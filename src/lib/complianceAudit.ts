// ============================================================
// Rakmana — DGI Compliance Audit
// Scans a document BEFORE save for the two most common ways an
// invoice fails a DGI check: a missing/invalid client NIF, and a
// Timbre Fiscal that doesn't match what Art. 220 CII requires for
// the document's total and payment mode.
// ============================================================

import { validateNIF, shouldApplyTimbre, TIMBRE_FISCAL_AMOUNT, TIMBRE_FISCAL_THRESHOLD } from '@/lib/dgi';
import type { DocumentState, CalculationResult, SectionId } from '@/types';

export type ComplianceSeverity = 'error' | 'warning';

export interface ComplianceIssue {
  id: string;
  severity: ComplianceSeverity;
  message: string;
  /** Section to jump to when the user clicks "Corriger". */
  section: SectionId;
}

/**
 * Pure function: given the current document + its computed totals,
 * return every compliance issue found. Empty array = compliant.
 */
export function auditDocument(doc: DocumentState, results: CalculationResult): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  // ── Check 1: client NIF ──────────────────────────────────────
  const nif = doc.clientInfo?.nif?.trim();
  if (!nif) {
    issues.push({
      id: 'client-nif-missing',
      severity: 'warning',
      message: 'Le NIF du client est manquant — requis pour la conformité DGI et la déductibilité de la TVA côté client.',
      section: 'client',
    });
  } else if (!validateNIF(nif)) {
    issues.push({
      id: 'client-nif-invalid',
      severity: 'error',
      message: `Le NIF du client "${nif}" est invalide — il doit comporter 11 chiffres (particulier) ou 15 chiffres (société).`,
      section: 'client',
    });
  }

  // ── Check 2: Timbre Fiscal correctness (Art. 220 CII) ────────
  const timbreRequired = shouldApplyTimbre(doc.documentType, results.totalTTC, doc.paymentMode);
  const timbreApplied = results.timbreFiscal > 0;

  if (timbreRequired && !timbreApplied) {
    issues.push({
      id: 'timbre-missing',
      severity: 'error',
      message: `Timbre fiscal manquant : le montant TTC (${results.totalTTC.toLocaleString('fr-DZ')} DA) dépasse le seuil de ${TIMBRE_FISCAL_THRESHOLD.toLocaleString('fr-DZ')} DA — ${TIMBRE_FISCAL_AMOUNT} DA de timbre sont dus (Art. 220 CII).`,
      section: 'general',
    });
  } else if (!timbreRequired && timbreApplied) {
    issues.push({
      id: 'timbre-unexpected',
      severity: 'warning',
      message: `Un timbre fiscal est appliqué alors qu'il ne devrait pas l'être pour ce document (type exempté, paiement par chèque/virement, ou montant sous le seuil de ${TIMBRE_FISCAL_THRESHOLD.toLocaleString('fr-DZ')} DA).`,
      section: 'general',
    });
  }

  return issues;
}
