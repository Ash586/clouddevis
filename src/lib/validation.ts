export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateDocumentBody(body: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  if (body.documentType && !['devis', 'proforma', 'bc', 'br', 'facture'].includes(body.documentType as string)) {
    errors.documentType = 'Type de document invalide';
  }

  if (body.tvaRate !== undefined) {
    const rate = Number(body.tvaRate);
    if (![0, 9, 19].includes(rate)) errors.tvaRate = 'Taux de TVA invalide';
  }

  if (body.paymentMode && !['cheque', 'virement', 'especes', 'cb'].includes(body.paymentMode as string)) {
    errors.paymentMode = 'Mode de paiement invalide';
  }

  if (body.items && !Array.isArray(body.items)) {
    errors.items = 'Les articles doivent être un tableau';
  }

  if (body.acompte !== undefined && (Number(body.acompte) < 0)) {
    errors.acompte = 'L\'acompte ne peut pas être négatif';
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
  }

  if (type === 'register') {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.name = 'Nom requis (min 2 caractères)';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
