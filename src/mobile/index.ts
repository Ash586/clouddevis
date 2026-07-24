// Rakmana Mobile — Main Entry Point
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
export { MobileShell } from './components/MobileShell';
export { BottomTabs } from './components/BottomTabs';
export type { TabId } from './components/BottomTabs';
export { HomeHeader } from './components/HomeHeader';
export { StatCards } from './components/StatCards';
export { RecentDocuments } from './components/RecentDocuments';
export { DocumentRow } from './components/DocumentRow';
export { FAB } from './components/FAB';
export { OfflineBanner } from './components/OfflineBanner';
export { UpdateBanner } from './components/UpdateBanner';
export { PushToast } from './components/PushToast';
export { OnboardingScreen } from './components/OnboardingScreen';
export { BiometricLockScreen } from './components/BiometricLockScreen';

// ── Screens ───────────────────────────────────────────────────
export { WelcomeScreen } from './screens/WelcomeScreen';
export { LoginScreen } from './screens/LoginScreen';
export { RegisterScreen } from './screens/RegisterScreen';
export { HomeScreen } from './screens/HomeScreen';
export { CreateScreen } from './screens/CreateScreen';
export { DocumentsListScreen } from './screens/DocumentsListScreen';
export { CompanyProfileScreen } from './screens/CompanyProfileScreen';
export { ClientsScreen } from './screens/ClientsScreen';
export { SettingsScreen } from './screens/SettingsScreen';

// ── Lib ──────────────────────────────────────────────────────
export { shareDocument, openWhatsApp, generatePaymentReminder } from './lib/whatsapp';
export { generatePDFBase64, printDocument } from './lib/pdf';
export { checkNetworkStatus } from './lib/network';

// ── Hooks ────────────────────────────────────────────────────
export { useNetwork } from '@/hooks/useNetwork';
export type { NetworkState, ConnectionType, UseNetworkOptions } from '@/hooks/useNetwork';
