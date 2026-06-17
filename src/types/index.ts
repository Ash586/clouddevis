export type Country = 'algeria' | 'tunisia' | 'morocco' | 'france';
export type SectorId =
  | 'btp' | 'demengement' | 'nettoyage' | 'hotellerie'
  | 'reparation_auto' | 'sante' | 'formation' | 'immobilier'
  | 'transport_personnes' | 'artisanat' | 'agriculture'
  | 'professions_liberales' | 'informatique';
export type DocumentType = 'devis' | 'proforma' | 'bc' | 'br' | 'facture' | 'intervention' | 'attachement';
export type WorkflowState = 'draft' | 'accepted' | 'progress' | 'delivered';
export type TaxRegimeId = 'tva_19' | 'tva_9' | 'tva_0' | 'tva_7_tn' | 'tva_20_ma' | 'tva_20_fr';
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
  logoPosition?: 'left' | 'right';

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
  design: ['logo', 'logoPosition'],
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
};

/**
 * الحقول الافتراضية لكل نوع وثيقة.
 * عند اختيار المستخدم لنوع الوثيقة، تظهر هذه الحقول فقط تلقائياً.
 * يمكن للمستخدم إضافة/إخفاء حقول من نافذة Customize.
 */
export const DOC_TYPE_DEFAULT_FIELDS: Record<DocumentType, Record<string, string[]>> = {
  devis: {
    design: ['logo', 'logoPosition'],
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
    design: ['logo', 'logoPosition'],
    general: ['docNumber', 'issueDate', 'vatRate', 'stampRate', 'stampMin', 'stampMax', 'retenueSource', 'tvaArticle'],
    mode: ['businessMode'],
    client: ['clientName', 'clientAddress', 'clientNif', 'clientNis', 'clientRc', 'clientAi', 'clientPhone', 'clientEmail', 'clientForme'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
    remise: ['remiseType', 'remiseValue', 'remiseReason'],
    paiement: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban', 'paymentEcheance', 'paymentModeReglement'],
    notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  },
  proforma: {
    design: ['logo', 'logoPosition'],
    general: ['docNumber', 'issueDate', 'vatRate', 'stampRate', 'stampMin', 'stampMax'],
    mode: ['businessMode'],
    client: ['clientName', 'clientAddress', 'clientNif', 'clientPhone', 'clientEmail'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
    remise: ['remiseType', 'remiseValue', 'remiseReason'],
    paiement: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban', 'paymentEcheance', 'paymentModeReglement'],
    notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  },
  bc: {
    design: ['logo', 'logoPosition'],
    general: ['docNumber', 'issueDate', 'validUntil'],
    client: ['clientName', 'clientAddress', 'clientNif', 'clientPhone'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice'],
    notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  },
  br: {
    design: ['logo', 'logoPosition'],
    general: ['docNumber', 'issueDate'],
    client: ['clientName', 'clientAddress'],
    materiaux: ['materiauxBrand', 'materiauxType', 'materiauxColor', 'materiauxQty', 'materiauxUnite'],
    notes: ['notes'],
  },
  intervention: {
    design: ['logo', 'logoPosition'],
    general: ['docNumber', 'issueDate'],
    client: ['clientName', 'clientAddress', 'clientPhone'],
    chantier: ['chantierAddress', 'chantierType', 'chantierCondition', 'chantierResponsable'],
    prestations: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
    garanties: ['garantieLabor', 'garantieMaterials', 'garantieNotes', 'garantieDuree', 'garantieRetenue'],
    notes: ['notes', 'mentionsLegales', 'conditionsGenerales'],
  },
  attachement: {
    design: ['logo', 'logoPosition'],
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
];

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
