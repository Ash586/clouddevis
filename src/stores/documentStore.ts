// ============================================================
// CloudDevis Mobile — Document Store
// Manages document creation wizard + auto-computed totals
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  calculateDocumentTotals,
  generateDocNumber,
  type DocumentCalculationResult,
} from '@/lib/dgi';
import { generateId, round2 } from '@/lib/calculations';
import { useSyncStore } from './syncStore';
import type {
  Document,
  DocumentType,
  DocumentStatus,
  LineItem,
  Client,
  Company,
  Language,
  PaymentMode,
  UnitMeasure,
} from '@/mobile/types';

// ── Default empty state ───────────────────────────────────────

const emptyTotals: DocumentCalculationResult = {
  subTotalHT: 0,
  totalTVA: 0,
  totalTTC: 0,
  timbreFiscal: false,
  timbreAmount: 0,
  netAPayer: 0,
};

interface CurrentDocument {
  type: DocumentType;
  client: Partial<Client>;
  items: LineItem[];
  notes: string;
  language: Language;
  paymentMode: PaymentMode;
  acompte: number;
  validUntil?: string;
}

const defaultCurrentDoc: CurrentDocument = {
  type: 'DEVIS',
  client: {},
  items: [],
  notes: '',
  language: 'FR',
  paymentMode: 'especes',
  acompte: 0,
};

// ── Store Interface ───────────────────────────────────────────

export interface DocumentStore {
  // ── Current document being created ──
  currentDoc: CurrentDocument;
  step: 1 | 2 | 3 | 4;
  totals: DocumentCalculationResult;

  // ── Saved documents (local cache) ──
  savedDocuments: Document[];
  syncStatus: 'synced' | 'pending' | 'offline';

  // ── Document-level setters ──
  setType: (type: DocumentType) => void;
  setClient: (client: Partial<Client>) => void;
  setLanguage: (language: Language) => void;
  setPaymentMode: (mode: PaymentMode) => void;
  setAcompte: (acompte: number) => void;
  setNotes: (notes: string) => void;
  setValidUntil: (date: string | undefined) => void;

  // ── Line item CRUD ──
  addItem: (item: Omit<LineItem, 'id' | 'totalHT'>) => void;
  updateItem: (id: string, updates: Partial<Omit<LineItem, 'id'>>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;

  // ── Wizard navigation ──
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: 1 | 2 | 3 | 4) => void;

  // ── Document lifecycle ──
  saveDocument: (company: Company) => Document | null;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => Document | null;
  loadDocumentIntoWizard: (id: string) => void;

  // ── Sync ──
  setSyncStatus: (status: 'synced' | 'pending' | 'offline') => void;
  markDocumentSynced: (id: string) => void;
  /**
   * Replace savedDocuments with server data.
   * Locally-created docs whose ID isn't on the server are preserved (offline-created).
   */
  replaceAll: (serverDocs: Document[]) => void;

  // ── Reset ──
  resetDocument: () => void;
}

// ── Helper: recompute totals from current state ───────────────

function computeTotals(doc: CurrentDocument): DocumentCalculationResult {
  const items = doc.items.map((item) => ({
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    tvaRate: item.tvaRate,
  }));
  return calculateDocumentTotals(items, doc.type, doc.acompte);
}

// ── Helper: build a full Document from current state ──────────

function buildDocument(
  doc: CurrentDocument,
  company: Company,
  totals: DocumentCalculationResult,
  sequenceNumber: number
): Document {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    type: doc.type,
    number: generateDocNumber(doc.type, sequenceNumber),
    date: now.split('T')[0],
    dueDate: doc.validUntil,
    company,
    client: doc.client as Client,
    items: doc.items,
    totalHT: totals.subTotalHT,
    totalTVA: totals.totalTVA,
    timbreFiscal: totals.timbreFiscal,
    timbreAmount: totals.timbreAmount,
    totalTTC: totals.totalTTC,
    status: 'DRAFT' as DocumentStatus,
    language: doc.language,
    paymentMode: doc.paymentMode,
    notes: doc.notes || undefined,
    validUntil: doc.validUntil,
    acompte: doc.acompte || undefined,
  };
}

// ── Store ─────────────────────────────────────────────────────

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ──
      currentDoc: { ...defaultCurrentDoc },
      step: 1,
      totals: { ...emptyTotals },
      savedDocuments: [],
      syncStatus: 'offline',

      // ── Document-level setters ──

      setType: (type) =>
        set((state) => {
          const newDoc = { ...state.currentDoc, type };
          return { currentDoc: newDoc, totals: computeTotals(newDoc) };
        }),

      setClient: (client) =>
        set((state) => ({
          currentDoc: { ...state.currentDoc, client: { ...state.currentDoc.client, ...client } },
        })),

      setLanguage: (language) =>
        set((state) => ({
          currentDoc: { ...state.currentDoc, language },
        })),

      setPaymentMode: (mode) =>
        set((state) => ({
          currentDoc: { ...state.currentDoc, paymentMode: mode },
        })),

      setAcompte: (acompte) =>
        set((state) => {
          const newDoc = { ...state.currentDoc, acompte };
          return { currentDoc: newDoc, totals: computeTotals(newDoc) };
        }),

      setNotes: (notes) =>
        set((state) => ({
          currentDoc: { ...state.currentDoc, notes },
        })),

      setValidUntil: (date) =>
        set((state) => ({
          currentDoc: { ...state.currentDoc, validUntil: date },
        })),

      // ── Line item CRUD ──

      addItem: (itemData) =>
        set((state) => {
          const totalHT = round2(itemData.quantity * itemData.unitPrice);
          const newItem: LineItem = {
            id: generateId(),
            ...itemData,
            totalHT,
          };
          const newDoc = { ...state.currentDoc, items: [...state.currentDoc.items, newItem] };
          return { currentDoc: newDoc, totals: computeTotals(newDoc) };
        }),

      updateItem: (id, updates) =>
        set((state) => {
          const newItems = state.currentDoc.items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates };
            // Recompute totalHT if quantity or unitPrice changed
            updated.totalHT = round2(updated.quantity * updated.unitPrice);
            return updated;
          });
          const newDoc = { ...state.currentDoc, items: newItems };
          return { currentDoc: newDoc, totals: computeTotals(newDoc) };
        }),

      removeItem: (id) =>
        set((state) => {
          const newItems = state.currentDoc.items.filter((item) => item.id !== id);
          const newDoc = { ...state.currentDoc, items: newItems };
          return { currentDoc: newDoc, totals: computeTotals(newDoc) };
        }),

      clearItems: () =>
        set((state) => {
          const newDoc = { ...state.currentDoc, items: [] };
          return { currentDoc: newDoc, totals: computeTotals(newDoc) };
        }),

      // ── Wizard navigation ──

      nextStep: () =>
        set((state) => ({
          step: (Math.min(state.step + 1, 4) as 1 | 2 | 3 | 4),
        })),

      prevStep: () =>
        set((state) => ({
          step: (Math.max(state.step - 1, 1) as 1 | 2 | 3 | 4),
        })),

      goToStep: (step) => set({ step }),

      // ── Document lifecycle ──

      saveDocument: (company) => {
        const state = get();
        if (state.currentDoc.items.length === 0) return null;

        const sequenceNumber = state.savedDocuments.length + 1;
        const doc = buildDocument(state.currentDoc, company, state.totals, sequenceNumber);

        set((prevState) => ({
          savedDocuments: [...prevState.savedDocuments, doc],
          syncStatus: 'pending',
        }));

        // Enqueue for API sync (processQueue will push when online)
        useSyncStore.getState().enqueue({
          action: 'CREATE',
          entity: 'document',
          entityId: doc.id,
          payload: doc,
        });

        return doc;
      },

      deleteDocument: (id) =>
        set((state) => ({
          savedDocuments: state.savedDocuments.filter((doc) => doc.id !== id),
          syncStatus: state.savedDocuments.length > 1 ? 'pending' : 'synced',
        })),

      duplicateDocument: (id) => {
        const state = get();
        const sourceDoc = state.savedDocuments.find((d) => d.id === id);
        if (!sourceDoc) return null;

        const sequenceNumber = state.savedDocuments.length + 1;
        const today = new Date().toISOString().split('T')[0];

        const duplicatedDoc: Document = {
          ...sourceDoc,
          id: generateId(),
          number: generateDocNumber(sourceDoc.type, sequenceNumber),
          date: today,
          dueDate: undefined, // Clear due date, recalculate on edit
          status: 'DRAFT',
          items: sourceDoc.items.map((item) => ({
            ...item,
            id: generateId(),
          })),
        };

        set((prevState) => ({
          savedDocuments: [...prevState.savedDocuments, duplicatedDoc],
          syncStatus: 'pending',
        }));

        return duplicatedDoc;
      },

      loadDocumentIntoWizard: (id) => {
        const state = get();
        const doc = state.savedDocuments.find((d) => d.id === id);
        if (!doc) return;

        set({
          currentDoc: {
            type: doc.type,
            client: { ...doc.client },
            items: [...doc.items],
            notes: doc.notes || '',
            language: doc.language,
            paymentMode: doc.paymentMode,
            acompte: doc.acompte || 0,
            validUntil: doc.validUntil,
          },
          step: 1,
          totals: {
            subTotalHT: doc.totalHT,
            totalTVA: doc.totalTVA,
            totalTTC: doc.totalTTC,
            timbreFiscal: doc.timbreFiscal,
            timbreAmount: doc.timbreAmount,
            netAPayer: doc.totalTTC + doc.timbreAmount - (doc.acompte || 0),
          },
        });
      },

      // ── Sync ──

      setSyncStatus: (status) => set({ syncStatus: status }),

      markDocumentSynced: (id) =>
        set((state) => ({
          savedDocuments: state.savedDocuments.map((doc) =>
            doc.id === id ? doc : doc
          ),
          syncStatus: state.savedDocuments.length > 0 ? 'synced' : 'offline',
        })),

      replaceAll: (serverDocs) =>
        set((state) => {
          const serverIds = new Set(serverDocs.map((d) => d.id));
          // Keep locally-created docs not yet on the server
          const localOnly = state.savedDocuments.filter((d) => !serverIds.has(d.id));
          return {
            savedDocuments: [...serverDocs, ...localOnly],
            syncStatus: 'synced',
          };
        }),

      // ── Reset ──

      resetDocument: () =>
        set({
          currentDoc: { ...defaultCurrentDoc },
          step: 1,
          totals: { ...emptyTotals },
        }),
    }),
    {
      name: 'clouddevis-document-store',
      storage: createJSONStorage(() => {
        // Use localStorage on web, Capacitor Preferences on mobile
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage;
        }
        // Fallback for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist savedDocuments and syncStatus (not current wizard state)
      partialize: (state) => ({
        savedDocuments: state.savedDocuments,
        syncStatus: state.syncStatus,
      }),
    }
  )
);
