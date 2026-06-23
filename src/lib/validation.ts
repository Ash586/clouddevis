export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// Import from DGI engine (single source of truth) and re-export
import {
  validateNIF as dgiValidateNIF,
  validateRC as dgiValidateRC,
  validateNIS as dgiValidateNIS,
  validateAI as dgiValidateAI,
} from './dgi';

export const validateNIF = dgiValidateNIF;
export const validateRC = dgiValidateRC;
export const validateNIS = dgiValidateNIS;
export const validateAI = dgiValidateAI;

// Keep legacy wrapper for backward compatibility (returns ValidationResult type)
export function validateCompanyTaxIds(taxIds: { nif?: string; rc?: string; nis?: string; ai?: string }): ValidationResult {
  const errors: Record<string, string> = {};

  if (taxIds.nif && !validateNIF(taxIds.nif)) {
    errors.nif = 'NIF invalide : 11 chiffres (particulier) ou 15 chiffres (entreprise) requis. Saisissez uniquement des chiffres.';
  }
  if (taxIds.rc && !validateRC(taxIds.rc)) {
    errors.rc = 'RC invalide : 9 à 14 caractères attendus. Exemple : 16/00-1234567B08.';
  }
  if (taxIds.nis && !validateNIS(taxIds.nis)) {
    errors.nis = 'NIS invalide : 10 chiffres exactement requis. Vérifiez votre numéro INS.';
  }
  if (taxIds.ai && !validateAI(taxIds.ai)) {
    errors.ai = 'AI invalide : 10 chiffres exactement requis. Vérifiez votre article d\'imposition.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateDocumentBody(body: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  if (body.documentType && !['devis', 'proforma', 'bc', 'br', 'facture', 'intervention', 'attachement'].includes(body.documentType as string)) {
    errors.documentType = 'Type de document invalide. Types acceptés : devis, facture, proforma, bc, br, intervention, attachement.';
  }

  if (body.tvaRate !== undefined) {
    const rate = Number(body.tvaRate);
    if (![0, 9, 19].includes(rate)) errors.tvaRate = 'Taux de TVA invalide. Taux autorisés : 0%, 9%, 19%.';
  }

  if (body.paymentMode && !['cheque', 'virement', 'especes', 'cb'].includes(body.paymentMode as string)) {
    errors.paymentMode = 'Mode de paiement invalide. Options : chèque, virement, espèces, CB.';
  }

  if (body.items) {
    if (!Array.isArray(body.items)) {
      errors.items = 'Les articles doivent être fournis sous forme de liste.';
    } else {
      (body.items as Record<string, unknown>[]).forEach((item, i) => {
        if (item.quantity !== undefined && (Number(item.quantity) <= 0 || !Number.isFinite(Number(item.quantity)))) {
          errors[`items.${i}.qty`] = `Ligne ${i + 1} : la quantité doit être un nombre supérieur à 0.`;
        }
        if (item.unitPrice !== undefined && (Number(item.unitPrice) <= 0 || Number(item.unitPrice) > 10000000)) {
          errors[`items.${i}.price`] = `Ligne ${i + 1} : le prix unitaire doit être compris entre 0 et 10 000 000 DA.`;
        }
      });
    }
  }

  if (body.acompte !== undefined && (Number(body.acompte) < 0)) {
    errors.acompte = "L'acompte ne peut pas être négatif. Saisissez 0 ou un montant positif.";
  }

  if (body.discount && typeof body.discount === 'object') {
    const disc = body.discount as Record<string, unknown>;
    if (disc.value !== undefined && Number(disc.value) < 0) {
      errors.discount = 'La remise ne peut pas être négative. Saisissez 0 ou un montant positif.';
    }
    if (disc.type === 'percentage' && Number(disc.value) > 100) {
      errors.discount = 'Le pourcentage de remise ne peut pas dépasser 100%. Saisissez une valeur entre 0 et 100.';
    }
  }

  if (body.companyInfo && typeof body.companyInfo === 'object') {
    const taxIds = (body.companyInfo as Record<string, unknown>).taxIds || {};
    const taxErrors = validateCompanyTaxIds(taxIds as { nif?: string; rc?: string; nis?: string; ai?: string });
    Object.assign(errors, taxErrors.errors);
  }

  if (body.clientInfo && typeof body.clientInfo === 'object') {
    const c = body.clientInfo as Record<string, unknown>;
    if (c.nif && !validateNIF(c.nif as string)) {
      errors['clientNif'] = 'NIF client invalide : 11 chiffres (particulier) ou 15 chiffres (entreprise) requis. Vérifiez le numéro saisi.';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAuthInput(body: Record<string, unknown>, type: 'login' | 'register'): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.email = 'Email invalide. Vérifiez le format (exemple : nom@domaine.com).';
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.password = 'Mot de passe requis. Choisissez un mot de passe sécurisé.';
  } else if (type === 'register' && body.password.length < 6) {
    errors.password = 'Minimum 6 caractères. Plus long = plus sécurisé.';
  } else if (type === 'register') {
    let score = 0;
    if (body.password.length >= 8) score++;
    if (/[A-Z]/.test(body.password as string)) score++;
    if (/[0-9]/.test(body.password as string)) score++;
    if (/[^A-Za-z0-9]/.test(body.password as string)) score++;
    if (score < 2) errors.password = 'Mot de passe trop faible. Pour un mot de passe robuste, ajoutez une majuscule, un chiffre ou un caractère spécial (@, #, !, etc.).';
  }

  if (type === 'register') {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.name = 'Nom requis (minimum 2 caractères).';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLineItem(item: { designation?: string; quantity?: number; unitPrice?: number }): ValidationResult {
  const errors: Record<string, string> = {};
  if (!item.designation || item.designation.trim().length === 0) {
    errors.designation = 'Donnez un nom à cet article (exemple : "Installation électrique").';
  } else if (item.designation.length > 200) {
    errors.designation = 'Le nom de l\'article est trop long (200 caractères maximum).';
  }
  if (!item.quantity || item.quantity <= 0 || !Number.isFinite(item.quantity)) {
    errors.quantity = 'Quantité invalide. Saisissez un nombre supérieur à 0.';
  }
  if (!item.unitPrice || item.unitPrice <= 0 || !Number.isFinite(item.unitPrice)) {
    errors.unitPrice = 'Prix unitaire invalide. Saisissez un montant supérieur à 0 DA.';
  } else if (item.unitPrice > 10000000) {
    errors.unitPrice = 'Le prix unitaire ne peut pas dépasser 10 000 000 DA.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
