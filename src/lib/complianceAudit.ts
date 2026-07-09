// ============================================================
// Rakmana — DGI Compliance Audit
// Scans a document BEFORE save for the two most common ways an
// invoice fails a DGI check: a missing/invalid client NIF, and a
// Timbre Fiscal that doesn't match what Art. 220 CII requires for
// the document's total and payment mode.
// ============================================================

import { validateNIF, validateNIS, validateAI, validateRC, shouldApplyTimbre, TIMBRE_FISCAL_AMOUNT, TIMBRE_FISCAL_THRESHOLD } from '@/lib/dgi';
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

  // ── Check 3: Mode-specific fiscal IDs ─────────────────────────
  if (doc.mode === 'artisan') {
    const art = doc.artisanInfo;
    if (art) {
      if (!art.nif?.trim()) {
        issues.push({ id: 'artisan-nif-missing', severity: 'warning', message: 'Le NIF de l\'artisan est manquant — requis pour la conformité DGI.', section: 'general' });
      } else if (!validateNIF(art.nif)) {
        issues.push({ id: 'artisan-nif-invalid', severity: 'error', message: `Le NIF de l'artisan "${art.nif}" est invalide — 11 ou 15 chiffres requis.`, section: 'general' });
      }
      if (!art.nis?.trim()) {
        issues.push({ id: 'artisan-nis-missing', severity: 'warning', message: 'Le NIS de l\'artisan est manquant — requis pour la conformité DGI.', section: 'general' });
      } else if (!validateNIS(art.nis)) {
        issues.push({ id: 'artisan-nis-invalid', severity: 'error', message: `Le NIS de l'artisan "${art.nis}" est invalide — 10 chiffres requis.`, section: 'general' });
      }
      if (art.ai && !validateAI(art.ai)) {
        issues.push({ id: 'artisan-ai-invalid', severity: 'error', message: `L'AI de l'artisan "${art.ai}" est invalide — 10 chiffres requis.`, section: 'general' });
      }
      if (!art.carteArtisan?.trim()) {
        issues.push({ id: 'artisan-carte-missing', severity: 'warning', message: 'Le N° Carte d\'Artisan est manquant — recommandé pour les documents officiels.', section: 'client' });
      }
    }
  } else if (doc.mode === 'entreprise') {
    const comp = doc.companyInfo;
    if (comp) {
      const tax = comp.taxIds;
      if (!tax.nif?.trim()) {
        issues.push({ id: 'entreprise-nif-missing', severity: 'warning', message: 'Le NIF de l\'entreprise est manquant — requis pour la conformité DGI.', section: 'general' });
      } else if (!validateNIF(tax.nif)) {
        issues.push({ id: 'entreprise-nif-invalid', severity: 'error', message: `Le NIF de l'entreprise "${tax.nif}" est invalide — 15 chiffres requis.`, section: 'general' });
      }
      if (!tax.nis?.trim()) {
        issues.push({ id: 'entreprise-nis-missing', severity: 'warning', message: 'Le NIS de l\'entreprise est manquant — requis pour la conformité DGI.', section: 'general' });
      } else if (!validateNIS(tax.nis)) {
        issues.push({ id: 'entreprise-nis-invalid', severity: 'error', message: `Le NIS de l'entreprise "${tax.nis}" est invalide — 10 chiffres requis.`, section: 'general' });
      }
      if (!tax.rc?.trim()) {
        issues.push({ id: 'entreprise-rc-missing', severity: 'warning', message: 'Le RC de l\'entreprise est manquant — requis pour les sociétés.', section: 'general' });
      } else if (!validateRC(tax.rc)) {
        issues.push({ id: 'entreprise-rc-invalid', severity: 'error', message: `Le RC de l'entreprise "${tax.rc}" est invalide.`, section: 'general' });
      }
      if (tax.ai && !validateAI(tax.ai)) {
        issues.push({ id: 'entreprise-ai-invalid', severity: 'error', message: `L'AI de l'entreprise "${tax.ai}" est invalide — 10 chiffres requis.`, section: 'general' });
      }
    }
  }

  return issues;
}
