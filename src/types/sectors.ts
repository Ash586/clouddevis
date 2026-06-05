import type { SectorId, TaxRegimeId, DocumentType, UnitMeasure } from './index';

export interface SectorConfig {
  id: SectorId;
  nameFr: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  defaultTaxRates: TaxRegimeId[];
  allowedDocTypes: DocumentType[];
  defaultUnits: UnitMeasure[];
  requiresAcompte: boolean;
  acomptePercent: number;
  tvaNote: string;
}
