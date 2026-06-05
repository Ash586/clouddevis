export type Country = 'algeria' | 'tunisia' | 'morocco' | 'france';
export type SectorId =
  | 'btp' | 'demengement' | 'nettoyage' | 'hotellerie'
  | 'reparation_auto' | 'sante' | 'formation' | 'immobilier'
  | 'transport_personnes' | 'artisanat' | 'agriculture'
  | 'professions_liberales' | 'informatique';
export type DocumentType = 'devis' | 'proforma' | 'bc' | 'br' | 'facture';
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
  'design', 'general', 'mode', 'client', 'chantier', 'materiaux',
  'prestations', 'remise', 'garanties', 'paiement', 'notes',
];

export const SECTION_LABELS: Record<SectionId, string> = {
  design: 'Design & Logo',
  general: '1. Données Générales',
  mode: '2. Mode',
  client: '3. Client',
  chantier: '4. Chantier',
  materiaux: '5. Matériaux',
  prestations: '7. Prestations',
  remise: '8. Remise',
  garanties: '9. Garanties',
  paiement: '10. Règlement & Paiement',
  notes: '11. Notes',
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
  customFields: Record<string, Record<string, any>>;
}

export const SECTION_FIELDS: Record<SectionId, string[]> = {
  design: ['logo'],
  general: ['docNumber', 'orderRef', 'issueDate', 'validUntil', 'vatRate', 'stampRate', 'stampMin', 'stampMax'],
  mode: ['businessMode'],
  client: ['clientName', 'clientAddress', 'clientNif', 'clientPhone', 'clientEmail'],
  chantier: ['chantierAddress', 'chantierType', 'chantierCondition', 'chantierSurface', 'chantierProtection'],
  materiaux: ['materiauxBrand', 'materiauxType', 'materiauxColor', 'materiauxQty'],
  prestations: ['itemsTable'],
  remise: ['remiseType', 'remiseValue', 'remiseReason'],
  garanties: ['garantieLabor', 'garantieMaterials', 'garantieNotes'],
  paiement: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban'],
  notes: ['notes'],
};

export const UNIT_OPTIONS: { value: UnitMeasure; label: string }[] = [
  { value: 'u', label: 'Unité' },
  { value: 'h', label: 'Heure' },
  { value: 'j', label: 'Jour' },
  { value: 'm2', label: 'm²' },
  { value: 'm3', label: 'm³' },
  { value: 'ml', label: 'ml' },
  { value: 'kg', label: 'Kg' },
  { value: 'forfait', label: 'Forfait' },
];

export const CATEGORY_OPTIONS = [
  { value: '', label: '— Sans catégorie —' },
  { value: 'preparation', label: 'Préparation' },
  { value: 'peinture', label: 'Peinture' },
  { value: 'finition', label: 'Finition' },
  { value: 'revetement', label: 'Revêtement sol' },
  { value: 'facade', label: 'Façade' },
  { value: 'enduit', label: 'Enduit' },
  { value: 'main_oeuvre', label: 'Main-d\'œuvre' },
  { value: 'materiaux', label: 'Matériaux' },
  { value: 'transport', label: 'Transport' },
  { value: 'divers', label: 'Divers' },
];

export const BLOCK_LABELS: Record<BlockId, string> = {
  header: 'En-tête société',
  client: 'Client',
  chantier: 'Chantier',
  materiaux: 'Matériaux',
  table: 'Tableau prestations',
  remise: 'Remise',
  tafqit: 'Arrêté en lettres',
  situations: 'Situations',
  payment: 'Paiement',
  garanties: 'Garanties',
  legal: 'Mentions légales',
  signature: 'Signature',
};
