// CloudDevis Mobile — Main Entry Point
// Re-export all mobile modules

// ── Types & Schemas ──────────────────────────────────────────
export type {
  Company, Client, LineItem, Document,
  User, AuthSession, WizardState,
  SyncStatus, DashboardStats,
  DocumentType, DocumentStatus, Language, Plan,
  UnitMeasure, PaymentMode, UserMode,
} from './types';
export {
  DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS,
  UNIT_LABELS, PLAN_LABELS, TIMBRE_FISCAL_AMOUNT, PLAN_LIMITS,
} from './types';
export {
  CompanySchema, ClientSchema, LineItemSchema, DocumentSchema,
  UserSchema, LoginSchema, RegisterSchema,
  calculateDocumentTotals, shouldApplyTimbre, calculateFinalTotal,
} from './types/schemas';

// ── Components ────────────────────────────────────────────────
export { BottomTabs } from './components/BottomTabs';
export type { TabId } from './components/BottomTabs';
export { HomeHeader } from './components/HomeHeader';
export { StatCards } from './components/StatCards';
export { QuickActions } from './components/QuickActions';
export { RecentDocuments } from './components/RecentDocuments';
export { MobileShell } from './components/MobileShell';
export { DocumentRow } from './components/DocumentRow';
export { ActionSheet } from './components/ActionSheet';
export { OfflineBanner } from './components/OfflineBanner';

// ── Screens ───────────────────────────────────────────────────
export { HomeScreen } from './screens/HomeScreen';
export { WizardScreen } from './screens/WizardScreen';
export { DocumentsListScreen } from './screens/DocumentsListScreen';
export { CompanyProfileScreen } from './screens/CompanyProfileScreen';
export { ClientsScreen } from './screens/ClientsScreen';
export { SettingsScreen } from './screens/SettingsScreen';

// ── Wizard Steps ──────────────────────────────────────────────
export { WizardProgress } from './components/wizard/WizardProgress';
export { StepTypeSelection } from './components/wizard/StepTypeSelection';
export { StepClientSelection } from './components/wizard/StepClientSelection';
export { StepLineItems } from './components/wizard/StepLineItems';
export { StepReviewExport } from './components/wizard/StepReviewExport';

// ── Lib ──────────────────────────────────────────────────────
export { initDatabase, getDB, saveClient, searchClients, saveDocument, getDocuments, getUnsyncedDocuments, markSynced } from './lib/sqlite';
export { shareDocument, openWhatsApp, generatePaymentReminder } from './lib/whatsapp';
export { initNetworkListener, checkNetworkStatus, getOnlineStatus, onReconnect, syncPendingDocuments } from './lib/network';
export { generatePDFBase64, printDocument } from './lib/pdf';

// ── Hooks ────────────────────────────────────────────────────
export { useNetwork } from '@/hooks/useNetwork';
export type { NetworkState, ConnectionType, UseNetworkOptions } from '@/hooks/useNetwork';
