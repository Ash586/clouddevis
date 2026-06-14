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
    errors.nif = 'NIF invalide: 11 ou 15 chiffres requis';
  }
  if (taxIds.rc && !validateRC(taxIds.rc)) {
    errors.rc = 'RC invalide: 9-14 caractères alphanumériques requis';
  }
  if (taxIds.nis && !validateNIS(taxIds.nis)) {
    errors.nis = 'NIS invalide: exactement 10 chiffres requis';
  }
  if (taxIds.ai && !validateAI(taxIds.ai)) {
    errors.ai = 'AI invalide: exactement 10 chiffres requis';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateDocumentBody(body: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  if (body.documentType && !['devis', 'proforma', 'bc', 'br', 'facture', 'intervention', 'attachement'].includes(body.documentType as string)) {
    errors.documentType = 'Type de document invalide';
  }

  if (body.tvaRate !== undefined) {
    const rate = Number(body.tvaRate);
    if (![0, 9, 19].includes(rate)) errors.tvaRate = 'Taux de TVA invalide';
  }

  if (body.paymentMode && !['cheque', 'virement', 'especes', 'cb'].includes(body.paymentMode as string)) {
    errors.paymentMode = 'Mode de paiement invalide';
  }

  if (body.items) {
    if (!Array.isArray(body.items)) {
      errors.items = 'Les articles doivent être un tableau';
    } else {
      (body.items as Record<string, unknown>[]).forEach((item, i) => {
        if (item.quantity !== undefined && (Number(item.quantity) <= 0 || !Number.isFinite(Number(item.quantity)))) {
          errors[`items.${i}.qty`] = `Ligne ${i + 1} : quantité doit être > 0`;
        }
        if (item.unitPrice !== undefined && (Number(item.unitPrice) <= 0 || Number(item.unitPrice) > 1000000)) {
          errors[`items.${i}.price`] = `Ligne ${i + 1} : prix unitaire invalide (max 1 000 000 DA)`;
        }
      });
    }
  }

  if (body.acompte !== undefined && (Number(body.acompte) < 0)) {
    errors.acompte = "L'acompte ne peut pas être négatif";
  }

  if (body.discount && typeof body.discount === 'object') {
    const disc = body.discount as Record<string, unknown>;
    if (disc.value !== undefined && Number(disc.value) < 0) {
      errors.discount = 'La remise ne peut pas être négative';
    }
    if (disc.type === 'percentage' && Number(disc.value) > 100) {
      errors.discount = 'Le pourcentage de remise ne peut pas dépasser 100%';
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
      errors['clientNif'] = 'NIF client invalide: 11 ou 15 chiffres requis';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAuthInput(body: Record<string, unknown>, type: 'login' | 'register'): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.email = 'Email invalide';
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.password = 'Mot de passe requis';
  } else if (type === 'register' && body.password.length < 6) {
    errors.password = 'Minimum 6 caractères';
  } else if (type === 'register') {
    let score = 0;
    if (body.password.length >= 8) score++;
    if (/[A-Z]/.test(body.password as string)) score++;
    if (/[0-9]/.test(body.password as string)) score++;
    if (/[^A-Za-z0-9]/.test(body.password as string)) score++;
    if (score < 2) errors.password = 'Mot de passe trop faible : ajoutez majuscule, chiffre ou caractère spécial';
  }

  if (type === 'register') {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.name = 'Nom requis (min 2 caractères)';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLineItem(item: { designation?: string; quantity?: number; unitPrice?: number }): ValidationResult {
  const errors: Record<string, string> = {};
  if (!item.designation || item.designation.trim().length === 0) {
    errors.designation = 'La désignation est requise';
  } else if (item.designation.length > 200) {
    errors.designation = 'La désignation ne peut pas dépasser 200 caractères';
  }
  if (!item.quantity || item.quantity <= 0 || !Number.isFinite(item.quantity)) {
    errors.quantity = 'La quantité doit être un nombre positif';
  }
  if (!item.unitPrice || item.unitPrice <= 0 || !Number.isFinite(item.unitPrice)) {
    errors.unitPrice = 'Le prix unitaire doit être un nombre positif';
  } else if (item.unitPrice > 1000000) {
    errors.unitPrice = 'Le prix unitaire ne peut pas dépasser 1 000 000 DA';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
