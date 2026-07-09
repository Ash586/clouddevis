import { createContext, useContext, createElement, type ReactNode } from 'react';
import type {
  DocumentState, BlockId, SectionId, UserMode, LineItem,
  CustomSectionDef, CalculationResult, ClientInfo, CompanyInfo,
  ArtisanInfo, DiscountInfo, StampDutyConfig, PaymentDetails,
  TaxIds, UnitMeasure,
} from '@/types';

/** Every prop a section component may need. Each section picks what it needs. */
export interface SectionProps {
  doc: DocumentState;
  setDoc: React.Dispatch<React.SetStateAction<DocumentState>>;
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  hiddenFields: Set<string>;
  customSections: CustomSectionDef[];
  sectionOrder: string[];
  results: CalculationResult;
  // Items
  addingItem: boolean;
  setAddingItem: (v: boolean) => void;
  newItem: LineItem;
  setNewItem: React.Dispatch<React.SetStateAction<LineItem>>;
  handleAddItem: () => void;
  handleRemoveItem: (id: string) => void;
  moveItem: (fromIdx: number, toIdx: number) => void;
  startNewItem: () => void;
  itemErrors: string | null;
  setItemErrors: (err: string | null) => void;
  dragIdx: number | null;
  setDragIdx: (idx: number | null) => void;
  dragOverIdx: number | null;
  setDragOverIdx: (idx: number | null) => void;
  catalogItems: LineItem[];
  catalogLoading: boolean;
  setCatalogItems: (items: LineItem[]) => void;
  setCatalogLoading: (v: boolean) => void;
  // Updaters
  updateDoc: <K extends keyof DocumentState>(key: K, value: DocumentState[K]) => void;
  updateClientInfo: (info: Partial<ClientInfo>) => void;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  updateTaxIds: (ids: Partial<TaxIds>) => void;
  updateArtisanInfo: (info: Partial<ArtisanInfo>) => void;
  updateDiscount: (info: Partial<DiscountInfo>) => void;
  updateStampDuty: (info: Partial<StampDutyConfig>) => void;
  updatePaymentDetails: (info: Partial<PaymentDetails>) => void;
  setChantierField: (key: string, value: unknown) => void;
  setMateriauxField: (key: string, value: unknown) => void;
  setGarantieField: (key: string, value: unknown) => void;
  updateCustomField: (sectionId: string, fieldId: string, value: unknown) => void;
  toggleBlock: (block: BlockId) => void;
  isBlockVisible: (block: BlockId) => boolean;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  // i18n — next-intl Translator type
  te: (key: string, vars?: Record<string, string | number | Date>) => string;
  tp: (key: string, vars?: Record<string, string | number | Date>) => string;
  tu: (key: string) => string;
  tc: (key: string) => string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SectionCtx = createContext<SectionProps | null>(null);

export function SectionProvider({ children, ...props }: SectionProps & { children: ReactNode }) {
  return createElement(SectionCtx.Provider, { value: props }, children);
}

export function useSectionContext(): SectionProps {
  const ctx = useContext(SectionCtx);
  if (!ctx) throw new Error('useSectionContext must be used inside <SectionProvider>');
  return ctx;
}

/** A section component receives SectionProps and returns only the *inner content*
 *  (no CollapsibleSection wrapper — the editor adds that). */
export type SectionComponent = React.ComponentType;

/** Metadata for each section: title (literal or i18n key), blockId (optional), defaultOpen */
export interface SectionMeta {
  sectionId: string;
  title?: string;
  titleKey?: string;
  blockId?: BlockId;
  defaultOpen?: boolean;
}

/** Registry: section id → component + metadata */
export const SECTION_REGISTRY = new Map<string, { component: SectionComponent; meta: SectionMeta }>();

/** Register a section so the editor can render it. */
export function registerSection(id: string, component: SectionComponent, meta: SectionMeta): void {
  SECTION_REGISTRY.set(id, { component, meta });
}

/** Look up a registered section. */
export function getSection(id: string): { component: SectionComponent; meta: SectionMeta } | undefined {
  return SECTION_REGISTRY.get(id);
}
