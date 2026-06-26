export type Country = 'algeria';
export type SectorId =
  | 'btp' | 'demengement' | 'nettoyage' | 'hotellerie'
  | 'reparation_auto' | 'sante' | 'formation' | 'immobilier'
  | 'transport_personnes' | 'artisanat' | 'agriculture'
  | 'professions_liberales' | 'informatique';
export type DocumentType = 'devis' | 'proforma' | 'bc' | 'br' | 'facture' | 'intervention' | 'attachement';
export type WorkflowState = 'draft' | 'accepted' | 'progress' | 'delivered';
export type TaxRegimeId = 'tva_19' | 'tva_9' | 'tva_0';
export type PaymentMode = 'cheque' | 'virement' | 'especes' | 'cb';
export type Language = 'fr' | 'ar' | 'en';
export type UserMode = 'artisan' | 'entreprise';
export type WizardStep = 1 | 2 | 3;
export type UnitMeasure = 'u' | 'h' | 'j' | 'm2' | 'm3' | 'ml' | 'kg' | 'forfait';

export interface FieldVisibility {
  fieldId: string;
  visible: boolean;
}

export interface TaxIds {
  nif: string;
  nis: string;
  rc: string;
  ai: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  taxIds: TaxIds;
  capital?: string;
  logo?: string;
  signature?: string;
}

export interface ArtisanInfo {
  name: string;
  address: string;
  phone: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  nif?: string;
  nis?: string;
  rc?: string;
  ai?: string;
}

export interface LineItem {
  id: string;
  designation: string;
  description?: string;
  quantity: number;
  unit: UnitMeasure;
  unitPrice: number;
  category?: string;
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  reason: string;
}

export interface StampDutyConfig {
  rate: number;
  minAmount: number;
  maxAmount: number;
}

export interface PaymentDetails {
  terms: string;
  iban: string;
}

export type BlockId = 'header' | 'client' | 'chantier' | 'materiaux' | 'table' | 'remise' | 'tafqit' | 'situations' | 'payment' | 'garanties' | 'legal' | 'signature';

export type CustomFieldType = 'text' | 'number' | 'date' | 'textarea' | 'select';

export interface CustomFieldDef {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  required?: boolean;
}

export interface CustomSectionDef {
  id: string;
  label: string;
  fields: CustomFieldDef[];
}

export type SectionId = string;

export const DEFAULT_SECTION_ORDER: string[] = [
  'design', 'general', 'devis', 'mode', 'client', 'chantier', 'materiaux',
  'prestations', 'remise', 'garanties', 'paiement', 'notes', 'signature',
];

export const SECTION_LABELS: Record<SectionId, string> = {
  design: 'Design & Logo',
  general: 'General',
  devis: 'Informations Devis',
  mode: 'Mode',
  client: 'Client',
  chantier: 'Chantier',
  materiaux: 'Materials',
  prestations: 'Prestations',
  remise: 'Discount',
  garanties: 'Warranties',
  paiement: 'Payment',
  notes: 'Notes',
  signature: 'Signature',
  equipement: 'Équipement',
  visite: 'Visite',
  verifications: 'Vérifications',
  travaux: 'Travaux',
  pieces: 'Pièces',
  etat: 'État Appareil',
};

export interface CalculationResult {
  subTotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  timbreFiscal: number;
  discountAmount: number;
  totalHTAfterDiscount: number;
  totalTTC: number;
  acompte: number;
  netAPayer: number;
  totalInWords: string;
}

export interface DocumentState {
  mode: UserMode;
  clientInfo: ClientInfo;
  companyInfo?: CompanyInfo;
  artisanInfo?: ArtisanInfo;
  items: LineItem[];
  tvaRate: number;
  paymentMode: PaymentMode;
  documentType: DocumentType;
  documentNumber: string;
  date: string;
  validUntil?: string;
  deliveryDate?: string;
  acompte?: number;
  bcRef?: string;
  brRef?: string;
  notes?: string;
  discount: DiscountInfo;
  stampDuty: StampDutyConfig;
  paymentDetails: PaymentDetails;
  hiddenBlocks: BlockId[];
  chantierAddress: string;
  chantierType: string;
  chantierSurface: number;
  chantierEtat: string;
  chantierProtection: string;
  materiauxMarque: string;
  materiauxType: string;
  materiauxCouleur: string;
  materiauxQte: number;
  garantieMO: string;
  garantieMateriaux: string;
  garantieNotes: string;
  sectionOrder: string[];
  customFields: Record<string, Record<string, unknown>>;
  logoPosition?: 'left' | 'center' | 'right';
  logoSize?: 'sm' | 'md' | 'lg';
  previewTemplate?: 'classic' | 'nordic' | 'velours';

  // DEVIS-specific fields
  companyTagline?: string;
  companyCapital?: string;
  rcNumber?: string;
  nisNumber?: string;
  aiNumber?: string;
  rib?: string;
  bankName?: string;
  bankAgency?: string;
  ccpNumber?: string;
  validityDays?: number;
  reference?: string;
  showWatermark?: boolean;
  objet?: string;
  docCity?: string;

  // Attachement signature fields (left column only)
  sigClientSubtitle?: string;
  sigClientNameFr?: string;
  sigClientRole?: string;
  sigClientRoleFr?: string;
  sigClientNameAr?: string;
  sigCompanyNameFr?: string;
  sigDirectionNameFr?: string;
  sigDirectionRole?: string;
  sigDirectionNameAr?: string;

  // Company phone
  companyPhone?: string;
}

export const SECTION_FIELDS: Record<SectionId, string[]> = {
  design: ['logo', 'logoPosition', 'logoSize'],
  general: ['docNumber', 'orderRef', 'issueDate', 'validUntil', 'vatRate', 'stampRate', 'stampMin', 'stampMax', 'retenueSource', 'tvaArticle', 'objet', 'docCity'],
  devis: ['companyTagline', 'companyCapital', 'rcNumber', 'nisNumber', 'aiNumber', 'reference', 'rib', 'bankName', 'bankAgency', 'ccpNumber', 'validityDays', 'showWatermark'],
  mode: ['businessMode'],
  client: ['clientName', 'clientAddress', 'clientNif', 'clientNis', 'clientRc', 'clientAi', 'clientPhone', 'clientEmail', 'clientForme'],
  chantier: ['chantierAddress', 'chantierType', 'chantierCondition', 'chantierSurface', 'chantierProtection', 'chantierResponsable'],
  materiaux: ['materiauxBrand', 'materiauxType', 'materiauxColor', 'materiauxQty', 'materiauxUnite'],
  prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
  remise: ['remiseType', 'remiseValue', 'remiseReason'],
  garanties: ['garantieLabor', 'garantieMaterials', 'garantieNotes', 'garantieDuree', 'garantieRetenue'],
  paiement: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban', 'paymentEcheance', 'paymentModeReglement'],
  notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  signature: ['companyPhone', 'sigClientSubtitle', 'sigClientNameFr', 'sigClientRole', 'sigClientRoleFr', 'sigClientNameAr', 'sigCompanyNameFr', 'sigDirectionNameFr', 'sigDirectionRole', 'sigDirectionNameAr'],
  equipement: ['equipementDesignation', 'equipementType', 'equipementSerie'],
  visite: ['typeVisite', 'duree', 'intervenants'],
  verifications: [],
  travaux: [],
  pieces: [],
  etat: ['etatAppareil', 'defauts'],
};

/**
 * الحقول الافتراضية لكل نوع وثيقة.
 * عند اختيار المستخدم لنوع الوثيقة، تظهر هذه الحقول فقط تلقائياً.
 * يمكن للمستخدم إضافة/إخفاء حقول من نافذة Customize.
 */
export const DOC_TYPE_DEFAULT_FIELDS: Record<DocumentType, Record<string, string[]>> = {
  devis: {
    design: ['logo', 'logoPosition', 'logoSize'],

    general: ['docNumber', 'issueDate', 'validUntil', 'orderRef', 'vatRate', 'stampRate', 'stampMin', 'stampMax', 'retenueSource', 'tvaArticle'],
    devis: ['companyTagline', 'companyCapital', 'rcNumber', 'nisNumber', 'aiNumber', 'reference', 'rib', 'bankName', 'bankAgency', 'ccpNumber', 'validityDays', 'showWatermark'],
    mode: ['businessMode'],
    client: ['clientName', 'clientAddress', 'clientNif', 'clientNis', 'clientRc', 'clientAi', 'clientPhone', 'clientEmail', 'clientForme'],
    chantier: ['chantierAddress', 'chantierType', 'chantierCondition', 'chantierSurface', 'chantierProtection', 'chantierResponsable'],
    materiaux: ['materiauxBrand', 'materiauxType', 'materiauxColor', 'materiauxQty', 'materiauxUnite'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
    remise: ['remiseType', 'remiseValue', 'remiseReason'],
    garanties: ['garantieLabor', 'garantieMaterials', 'garantieNotes', 'garantieDuree', 'garantieRetenue'],
    paiement: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban', 'paymentEcheance', 'paymentModeReglement'],
    notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  },
  facture: {
    design: ['logo', 'logoPosition', 'logoSize'],

    general: ['docNumber', 'issueDate', 'vatRate', 'stampRate', 'stampMin', 'stampMax', 'retenueSource', 'tvaArticle'],
    mode: ['businessMode'],
    client: ['clientName', 'clientAddress', 'clientNif', 'clientNis', 'clientRc', 'clientAi', 'clientPhone', 'clientEmail', 'clientForme'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
    remise: ['remiseType', 'remiseValue', 'remiseReason'],
    paiement: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban', 'paymentEcheance', 'paymentModeReglement'],
    notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  },
  proforma: {
    design: ['logo', 'logoPosition', 'logoSize'],

    general: ['docNumber', 'issueDate', 'vatRate', 'stampRate', 'stampMin', 'stampMax'],
    mode: ['businessMode'],
    client: ['clientName', 'clientAddress', 'clientNif', 'clientPhone', 'clientEmail'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
    remise: ['remiseType', 'remiseValue', 'remiseReason'],
    paiement: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban', 'paymentEcheance', 'paymentModeReglement'],
    notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  },
  bc: {
    design: ['logo', 'logoPosition', 'logoSize'],

    general: ['docNumber', 'issueDate', 'validUntil'],
    client: ['clientName', 'clientAddress', 'clientNif', 'clientPhone'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice'],
    notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  },
  br: {
    design: ['logo', 'logoPosition', 'logoSize'],

    general: ['docNumber', 'issueDate'],
    client: ['clientName', 'clientAddress'],
    materiaux: ['materiauxBrand', 'materiauxType', 'materiauxColor', 'materiauxQty', 'materiauxUnite'],
    notes: ['notes'],
  },
  intervention: {
    design: ['logo', 'logoPosition', 'logoSize'],

    general: ['docNumber', 'issueDate'],
    client: ['clientName', 'clientAddress', 'clientPhone'],
    equipement: ['equipementDesignation', 'equipementType', 'equipementSerie'],
    visite: ['typeVisite', 'duree', 'intervenants'],
    verifications: [],
    travaux: [],
    pieces: [],
    etat: ['etatAppareil', 'defauts'],
    notes: ['notes'],
  },
  attachement: {
    design: ['logo', 'logoPosition', 'logoSize'],

    general: ['docNumber', 'issueDate'],
    client: ['clientName', 'clientAddress', 'clientNif', 'clientPhone'],
    chantier: ['chantierAddress', 'chantierType', 'chantierSurface'],
    materiaux: ['materiauxBrand', 'materiauxType', 'materiauxColor', 'materiauxQty', 'materiauxUnite'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice'],
    notes: ['notes'],
    signature: ['companyPhone', 'sigClientSubtitle', 'sigClientNameFr', 'sigClientRole', 'sigClientRoleFr', 'sigClientNameAr', 'sigCompanyNameFr', 'sigDirectionNameFr', 'sigDirectionRole', 'sigDirectionNameAr'],
  },
};

export const UNIT_OPTIONS: { value: UnitMeasure; labelKey: string }[] = [
  { value: 'u', labelKey: 'preview.units.u' },
  { value: 'h', labelKey: 'preview.units.h' },
  { value: 'j', labelKey: 'preview.units.j' },
  { value: 'm2', labelKey: 'preview.units.m2' },
  { value: 'm3', labelKey: 'preview.units.m3' },
  { value: 'ml', labelKey: 'preview.units.ml' },
  { value: 'kg', labelKey: 'preview.units.kg' },
  { value: 'forfait', labelKey: 'preview.units.forfait' },
];

export const CATEGORY_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '', labelKey: 'preview.categories.none' },
  { value: 'preparation', labelKey: 'preview.categories.preparation' },
  { value: 'peinture', labelKey: 'preview.categories.peinture' },
  { value: 'finition', labelKey: 'preview.categories.finition' },
  { value: 'revetement', labelKey: 'preview.categories.revetement' },
  { value: 'facade', labelKey: 'preview.categories.facade' },
  { value: 'enduit', labelKey: 'preview.categories.enduit' },
  { value: 'main_oeuvre', labelKey: 'preview.categories.main_oeuvre' },
  { value: 'materiaux', labelKey: 'preview.categories.materiaux' },
  { value: 'transport', labelKey: 'preview.categories.transport' },
  { value: 'divers', labelKey: 'preview.categories.divers' },
  { value: 'services', labelKey: 'preview.categories.services' },
];

export const DOC_TYPE_CATEGORIES: Record<DocumentType, { value: string; labelKey: string }[]> = {
  devis: [
    { value: '', labelKey: 'preview.categories.none' },
    { value: 'preparation', labelKey: 'preview.categories.preparation' },
    { value: 'peinture', labelKey: 'preview.categories.peinture' },
    { value: 'finition', labelKey: 'preview.categories.finition' },
    { value: 'revetement', labelKey: 'preview.categories.revetement' },
    { value: 'facade', labelKey: 'preview.categories.facade' },
    { value: 'enduit', labelKey: 'preview.categories.enduit' },
    { value: 'main_oeuvre', labelKey: 'preview.categories.main_oeuvre' },
    { value: 'materiaux', labelKey: 'preview.categories.materiaux' },
    { value: 'transport', labelKey: 'preview.categories.transport' },
    { value: 'divers', labelKey: 'preview.categories.divers' },
  ],
  facture: [
    { value: '', labelKey: 'preview.categories.none' },
    { value: 'prestation', labelKey: 'preview.categories.services' },
    { value: 'materiaux', labelKey: 'preview.categories.materiaux' },
    { value: 'main_oeuvre', labelKey: 'preview.categories.main_oeuvre' },
    { value: 'transport', labelKey: 'preview.categories.transport' },
    { value: 'divers', labelKey: 'preview.categories.divers' },
  ],
  proforma: [
    { value: '', labelKey: 'preview.categories.none' },
    { value: 'prestation', labelKey: 'preview.categories.services' },
    { value: 'materiaux', labelKey: 'preview.categories.materiaux' },
    { value: 'main_oeuvre', labelKey: 'preview.categories.main_oeuvre' },
    { value: 'transport', labelKey: 'preview.categories.transport' },
    { value: 'divers', labelKey: 'preview.categories.divers' },
  ],
  bc: [
    { value: '', labelKey: 'preview.categories.none' },
    { value: 'materiaux', labelKey: 'preview.categories.materiaux' },
    { value: 'equipement', labelKey: 'preview.categories.equipement' },
    { value: 'outillage', labelKey: 'preview.categories.outillage' },
    { value: 'divers', labelKey: 'preview.categories.divers' },
  ],
  br: [
    { value: '', labelKey: 'preview.categories.none' },
    { value: 'materiaux', labelKey: 'preview.categories.materiaux' },
    { value: 'equipement', labelKey: 'preview.categories.equipement' },
    { value: 'divers', labelKey: 'preview.categories.divers' },
  ],
  intervention: [
    { value: '', labelKey: 'preview.categories.none' },
    { value: 'diagnostic', labelKey: 'preview.categories.diagnostic' },
    { value: 'reparation', labelKey: 'preview.categories.reparation' },
    { value: 'pieces', labelKey: 'preview.categories.pieces' },
    { value: 'main_oeuvre', labelKey: 'preview.categories.main_oeuvre' },
    { value: 'transport', labelKey: 'preview.categories.transport' },
    { value: 'divers', labelKey: 'preview.categories.divers' },
  ],
  attachement: [
    { value: '', labelKey: 'preview.categories.none' },
    { value: 'preparation', labelKey: 'preview.categories.preparation' },
    { value: 'peinture', labelKey: 'preview.categories.peinture' },
    { value: 'finition', labelKey: 'preview.categories.finition' },
    { value: 'revetement', labelKey: 'preview.categories.revetement' },
    { value: 'facade', labelKey: 'preview.categories.facade' },
    { value: 'enduit', labelKey: 'preview.categories.enduit' },
    { value: 'main_oeuvre', labelKey: 'preview.categories.main_oeuvre' },
    { value: 'materiaux', labelKey: 'preview.categories.materiaux' },
    { value: 'transport', labelKey: 'preview.categories.transport' },
    { value: 'divers', labelKey: 'preview.categories.divers' },
  ],
};

/** Every known category (global list + every per-type list), de-duplicated by value. */
export const ALL_CATEGORY_OPTIONS: { value: string; labelKey: string }[] = (() => {
  const seen = new Map<string, { value: string; labelKey: string }>();
  for (const opt of [...CATEGORY_OPTIONS, ...Object.values(DOC_TYPE_CATEGORIES).flat()]) {
    if (!seen.has(opt.value)) seen.set(opt.value, opt);
  }
  return [...seen.values()];
})();

/** Category options to show in the editor for a given document type. */
export function getCategoryOptions(type: DocumentType): { value: string; labelKey: string }[] {
  return DOC_TYPE_CATEGORIES[type] ?? CATEGORY_OPTIONS;
}

/** Resolve a category value to its i18n labelKey (handles type-only categories). */
export function categoryLabelKey(value: string): string | undefined {
  return ALL_CATEGORY_OPTIONS.find((c) => c.value === value)?.labelKey;
}

export const DOC_TYPE_SECTION_ORDER: Record<DocumentType, string[]> = {
  devis: ['design', 'general', 'devis', 'client', 'chantier', 'materiaux', 'prestations', 'remise', 'garanties', 'paiement', 'notes', 'signature'],
  facture: ['design', 'general', 'client', 'prestations', 'remise', 'garanties', 'paiement', 'notes'],
  proforma: ['design', 'general', 'client', 'prestations', 'remise', 'paiement', 'notes'],
  bc: ['design', 'general', 'client', 'prestations', 'notes'],
  br: ['design', 'general', 'client', 'materiaux', 'notes'],
  intervention: ['design', 'general', 'client', 'chantier', 'prestations', 'garanties', 'paiement', 'notes'],
  attachement: ['design', 'general', 'client', 'chantier', 'materiaux', 'prestations', 'notes', 'signature'],
};

export const DOC_TYPE_SECTIONS: Record<DocumentType, string[]> = {
  devis: ['design', 'general', 'devis', 'client', 'chantier', 'materiaux', 'prestations', 'remise', 'garanties', 'paiement', 'notes', 'signature'],
  facture: ['design', 'general', 'client', 'prestations', 'remise', 'garanties', 'paiement', 'notes'],
  proforma: ['design', 'general', 'client', 'prestations', 'remise', 'paiement', 'notes'],
  bc: ['design', 'general', 'client', 'prestations', 'notes'],
  br: ['design', 'general', 'client', 'materiaux', 'notes'],
  intervention: ['design', 'general', 'client', 'equipement', 'visite', 'verifications', 'travaux', 'pieces', 'etat', 'notes', 'signature'],
  attachement: ['design', 'general', 'client', 'chantier', 'materiaux', 'prestations', 'notes', 'signature'],
};

export const BLOCK_LABELS: Record<BlockId, string> = {
  header: 'Header',
  client: 'Client',
  chantier: 'Site',
  materiaux: 'Materials',
  table: 'Items table',
  remise: 'Discount',
  tafqit: 'Amount in words',
  situations: 'Situations',
  payment: 'Payment',
  garanties: 'Warranties',
  legal: 'Legal mentions',
  signature: 'Signature',
};
