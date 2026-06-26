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

// ---------------------------------------------------------------------------
// Translated validation messages
// ---------------------------------------------------------------------------
type MsgFn = (n: number) => string;
interface MsgMap {
  nifInvalid: string;
  rcInvalid: string;
  nisInvalid: string;
  aiInvalid: string;
  docTypeInvalid: string;
  tvaInvalid: string;
  paymentInvalid: string;
  itemsNotArray: string;
  itemQtyInvalid: MsgFn;
  itemPriceInvalid: MsgFn;
  acompteNegative: string;
  discountNegative: string;
  discountOver100: string;
  clientNifInvalid: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordTooShort: string;
  passwordWeak: string;
  nameRequired: string;
  designationRequired: string;
  designationTooLong: string;
  quantityInvalid: string;
  priceInvalid: string;
  priceMax: string;
}

const VM: Record<string, MsgMap> = {
  fr: {
    nifInvalid: 'NIF invalide : 11 chiffres requis.',
    rcInvalid: 'RC invalide : 9 à 14 caractères. Exemple : 16/00-1234567B08.',
    nisInvalid: 'NIS invalide : 10 chiffres exactement requis.',
    aiInvalid: 'AI invalide : 10 chiffres exactement requis.',
    docTypeInvalid: 'Type de document invalide. Types acceptés : devis, facture, proforma, bc, br, intervention, attachement.',
    tvaInvalid: 'Taux de TVA invalide. Taux autorisés : 0%, 9%, 19%.',
    paymentInvalid: 'Mode de paiement invalide. Options : chèque, virement, espèces, CB.',
    itemsNotArray: 'Les articles doivent être fournis sous forme de liste.',
    itemQtyInvalid: (n) => `Ligne ${n} : la quantité doit être un nombre supérieur à 0.`,
    itemPriceInvalid: (n) => `Ligne ${n} : le prix unitaire doit être compris entre 0 et 10 000 000 DA.`,
    acompteNegative: "L'acompte ne peut pas être négatif.",
    discountNegative: 'La remise ne peut pas être négative.',
    discountOver100: 'Le pourcentage de remise ne peut pas dépasser 100%.',
    clientNifInvalid: 'NIF client invalide : 11 chiffres requis.',
    emailInvalid: 'Email invalide. Vérifiez le format (exemple : nom@domaine.com).',
    passwordRequired: 'Mot de passe requis.',
    passwordTooShort: 'Minimum 12 caractères.',
    passwordWeak: 'Mot de passe trop faible. Ajoutez une majuscule, un chiffre ou un caractère spécial.',
    nameRequired: 'Nom requis (minimum 2 caractères).',
    designationRequired: 'Donnez un nom à cet article.',
    designationTooLong: "Le nom de l'article est trop long (200 caractères maximum).",
    quantityInvalid: 'Quantité invalide. Saisissez un nombre supérieur à 0.',
    priceInvalid: 'Prix unitaire invalide. Saisissez un montant supérieur à 0 DA.',
    priceMax: 'Le prix unitaire ne peut pas dépasser 10 000 000 DA.',
  },
  ar: {
    nifInvalid: 'رقم التعريف الجبائي (NIF) غير صالح: يجب أن يكون 11 رقماً.',
    rcInvalid: 'رقم السجل التجاري (RC) غير صالح: من 9 إلى 14 حرفاً. مثال: 16/00-1234567B08.',
    nisInvalid: 'رقم التعريف الإحصائي (NIS) غير صالح: 10 أرقام بالضبط.',
    aiInvalid: 'رقم مادة الضريبة (AI) غير صالح: 10 أرقام بالضبط.',
    docTypeInvalid: 'نوع المستند غير صالح.',
    tvaInvalid: 'نسبة الضريبة غير صالحة. النسب المقبولة: 0%, 9%, 19%.',
    paymentInvalid: 'طريقة الدفع غير صالحة.',
    itemsNotArray: 'يجب أن تكون العناصر قائمة.',
    itemQtyInvalid: (n) => `السطر ${n}: الكمية يجب أن تكون أكبر من 0.`,
    itemPriceInvalid: (n) => `السطر ${n}: السعر يجب أن يكون بين 0 و 10,000,000 دج.`,
    acompteNegative: 'الدفعة المسبقة لا يمكن أن تكون سالبة.',
    discountNegative: 'لا يمكن أن يكون الخصم سالباً.',
    discountOver100: 'نسبة الخصم لا يمكن أن تتجاوز 100%.',
    clientNifInvalid: 'رقم التعريف الجبائي للعميل غير صالح.',
    emailInvalid: 'البريد الإلكتروني غير صالح.',
    passwordRequired: 'كلمة المرور مطلوبة.',
    passwordTooShort: 'الحد الأدنى 12 حرفاً.',
    passwordWeak: 'كلمة المرور ضعيفة جداً. أضف حرفاً كبيراً أو رقماً أو رمزاً خاصاً.',
    nameRequired: 'الاسم مطلوب (حرفان على الأقل).',
    designationRequired: 'أدخل اسم العنصر.',
    designationTooLong: 'اسم العنصر طويل جداً (200 حرف كحد أقصى).',
    quantityInvalid: 'الكمية غير صالحة، أدخل عدداً أكبر من 0.',
    priceInvalid: 'السعر الوحدوي غير صالح، أدخل مبلغاً أكبر من 0 دج.',
    priceMax: 'السعر الوحدوي لا يمكن أن يتجاوز 10,000,000 دج.',
  },
  en: {
    nifInvalid: 'Invalid NIF: must be 11 digits.',
    rcInvalid: 'Invalid RC: 9 to 14 characters expected. Example: 16/00-1234567B08.',
    nisInvalid: 'Invalid NIS: must be exactly 10 digits.',
    aiInvalid: 'Invalid AI: must be exactly 10 digits.',
    docTypeInvalid: 'Invalid document type. Accepted types: devis, facture, proforma, bc, br, intervention, attachement.',
    tvaInvalid: 'Invalid TVA rate. Allowed rates: 0%, 9%, 19%.',
    paymentInvalid: 'Invalid payment mode. Options: cheque, wire transfer, cash, CB.',
    itemsNotArray: 'Items must be provided as a list.',
    itemQtyInvalid: (n) => `Line ${n}: quantity must be greater than 0.`,
    itemPriceInvalid: (n) => `Line ${n}: unit price must be between 0 and 10,000,000 DA.`,
    acompteNegative: 'Down payment cannot be negative.',
    discountNegative: 'Discount cannot be negative.',
    discountOver100: 'Discount percentage cannot exceed 100%.',
    clientNifInvalid: 'Invalid client NIF: must be 11 digits.',
    emailInvalid: 'Invalid email. Check the format (example: name@domain.com).',
    passwordRequired: 'Password is required.',
    passwordTooShort: 'Minimum 12 characters.',
    passwordWeak: 'Password too weak. Add an uppercase letter, a digit, or a special character.',
    nameRequired: 'Name required (minimum 2 characters).',
    designationRequired: 'Give the item a name.',
    designationTooLong: 'Item name too long (200 characters maximum).',
    quantityInvalid: 'Invalid quantity. Enter a number greater than 0.',
    priceInvalid: 'Invalid unit price. Enter an amount greater than 0 DA.',
    priceMax: 'Unit price cannot exceed 10,000,000 DA.',
  },
};

function m(lang: string): MsgMap {
  return VM[lang] ?? VM.fr;
}

// ---------------------------------------------------------------------------
// Validation functions — accept optional lang (defaults to 'fr')
// ---------------------------------------------------------------------------

export function validateCompanyTaxIds(
  taxIds: { nif?: string; rc?: string; nis?: string; ai?: string },
  lang = 'fr',
): ValidationResult {
  const msgs = m(lang);
  const errors: Record<string, string> = {};

  if (taxIds.nif && !validateNIF(taxIds.nif)) errors.nif = msgs.nifInvalid;
  if (taxIds.rc && !validateRC(taxIds.rc)) errors.rc = msgs.rcInvalid;
  if (taxIds.nis && !validateNIS(taxIds.nis)) errors.nis = msgs.nisInvalid;
  if (taxIds.ai && !validateAI(taxIds.ai)) errors.ai = msgs.aiInvalid;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateDocumentBody(body: Record<string, unknown>, lang = 'fr'): ValidationResult {
  const msgs = m(lang);
  const errors: Record<string, string> = {};

  if (body.documentType && !['devis', 'proforma', 'bc', 'br', 'facture', 'intervention', 'attachement'].includes(body.documentType as string)) {
    errors.documentType = msgs.docTypeInvalid;
  }

  if (body.tvaRate !== undefined) {
    const rate = Number(body.tvaRate);
    if (![0, 9, 19].includes(rate)) errors.tvaRate = msgs.tvaInvalid;
  }

  if (body.paymentMode && !['cheque', 'virement', 'especes', 'cb'].includes(body.paymentMode as string)) {
    errors.paymentMode = msgs.paymentInvalid;
  }

  if (body.items) {
    if (!Array.isArray(body.items)) {
      errors.items = msgs.itemsNotArray;
    } else {
      (body.items as Record<string, unknown>[]).forEach((item, i) => {
        if (item.quantity !== undefined && (Number(item.quantity) <= 0 || !Number.isFinite(Number(item.quantity)))) {
          errors[`items.${i}.qty`] = msgs.itemQtyInvalid(i + 1);
        }
        if (item.unitPrice !== undefined && (Number(item.unitPrice) <= 0 || Number(item.unitPrice) > 10000000)) {
          errors[`items.${i}.price`] = msgs.itemPriceInvalid(i + 1);
        }
      });
    }
  }

  if (body.acompte !== undefined && Number(body.acompte) < 0) {
    errors.acompte = msgs.acompteNegative;
  }

  if (body.discount && typeof body.discount === 'object') {
    const disc = body.discount as Record<string, unknown>;
    if (disc.value !== undefined && Number(disc.value) < 0) errors.discount = msgs.discountNegative;
    if (disc.type === 'percentage' && Number(disc.value) > 100) errors.discount = msgs.discountOver100;
  }

  if (body.companyInfo && typeof body.companyInfo === 'object') {
    const taxIds = (body.companyInfo as Record<string, unknown>).taxIds || {};
    const taxErrors = validateCompanyTaxIds(taxIds as { nif?: string; rc?: string; nis?: string; ai?: string }, lang);
    Object.assign(errors, taxErrors.errors);
  }

  if (body.clientInfo && typeof body.clientInfo === 'object') {
    const c = body.clientInfo as Record<string, unknown>;
    if (c.nif && !validateNIF(c.nif as string)) {
      errors['clientNif'] = msgs.clientNifInvalid;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAuthInput(body: Record<string, unknown>, type: 'login' | 'register', lang = 'fr'): ValidationResult {
  const msgs = m(lang);
  const errors: Record<string, string> = {};

  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.email = msgs.emailInvalid;
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.password = msgs.passwordRequired;
  } else if (type === 'register' && body.password.length < 12) {
    errors.password = msgs.passwordTooShort;
  } else if (type === 'register') {
    let score = 0;
    if (body.password.length >= 12) score++;
    if (/[A-Z]/.test(body.password as string)) score++;
    if (/[0-9]/.test(body.password as string)) score++;
    if (/[^A-Za-z0-9]/.test(body.password as string)) score++;
    if (score < 2) errors.password = msgs.passwordWeak;
  }

  if (type === 'register') {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.name = msgs.nameRequired;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLineItem(
  item: { designation?: string; quantity?: number; unitPrice?: number },
  lang = 'fr',
): ValidationResult {
  const msgs = m(lang);
  const errors: Record<string, string> = {};

  if (!item.designation || item.designation.trim().length === 0) {
    errors.designation = msgs.designationRequired;
  } else if (item.designation.length > 200) {
    errors.designation = msgs.designationTooLong;
  }

  if (!item.quantity || item.quantity <= 0 || !Number.isFinite(item.quantity)) {
    errors.quantity = msgs.quantityInvalid;
  }

  if (!item.unitPrice || item.unitPrice <= 0 || !Number.isFinite(item.unitPrice)) {
    errors.unitPrice = msgs.priceInvalid;
  } else if (item.unitPrice > 10000000) {
    errors.unitPrice = msgs.priceMax;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
