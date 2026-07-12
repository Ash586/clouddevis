// ============================================================
// Rakmana Mobile — i18n
// Lightweight translation hook for the mobile client-only app.
// Reads locale from userStore (reactive, persisted).
// ============================================================

import { useUserStore, type MobileLocale } from '@/stores/userStore';

// ── Translations ─────────────────────────────────────────────

type TranslationKeys =
  | 'nav.home' | 'nav.documents' | 'nav.company' | 'nav.settings'
  | 'stats.thisMonth' | 'stats.docsCreated' | 'stats.revenue' | 'stats.revenueSub'
  | 'stats.clients' | 'stats.clientsSub' | 'stats.drafts' | 'stats.draftsSub'
  | 'stats.unpaid' | 'stats.unpaidSub'
  | 'docs.title' | 'docs.empty' | 'docs.emptyHint' | 'docs.searchPlaceholder'
  | 'docs.filterAll' | 'docs.filterDevis' | 'docs.filterFacture'
  | 'docs.filterPaid' | 'docs.filterPending' | 'docs.filterMonth'
  | 'settings.title' | 'settings.accountType' | 'settings.accountTypeHint'
  | 'settings.language' | 'settings.tva' | 'settings.autoSync'
  | 'settings.localData' | 'settings.documents' | 'settings.clients' | 'settings.company'
  | 'settings.clearData' | 'settings.clearConfirmTitle' | 'settings.clearConfirmBody'
  | 'settings.cancel' | 'settings.deleteAll' | 'settings.logout' | 'settings.loggingOut'
  | 'settings.saved' | 'settings.cleared' | 'settings.modeEntreprise'
  | 'settings.modeArtisan' | 'settings.modeError' | 'settings.version'
  | 'settings.support' | 'settings.supportHint'
  | 'settings.deleteAccount' | 'settings.deleteAccountConfirmTitle'
  | 'settings.deleteAccountConfirmBody' | 'settings.deleteAccountError'
  | 'settings.deleteAccounting'
  | 'fab.facture' | 'fab.devis' | 'fab.duplicate'
  | 'common.artisan' | 'common.entreprise';

type Translations = Record<TranslationKeys, string>;

const TRANSLATIONS: Record<MobileLocale, Translations> = {
  fr: {
    'nav.home': 'Accueil',
    'nav.documents': 'Documents',
    'nav.company': 'Société',
    'nav.settings': 'Réglages',
    'stats.thisMonth': 'Ce mois',
    'stats.docsCreated': 'documents créés',
    'stats.revenue': "Chiffre d'affaires",
    'stats.revenueSub': 'DA total TTC',
    'stats.clients': 'Clients',
    'stats.clientsSub': 'enregistrés',
    'stats.drafts': 'Brouillons',
    'stats.draftsSub': 'en attente',
    'stats.unpaid': 'Impayés',
    'stats.unpaidSub': 'factures en attente',
    'docs.title': 'Mes documents',
    'docs.empty': 'Aucun document',
    'docs.emptyHint': 'Créez votre premier document',
    'docs.searchPlaceholder': 'Rechercher…',
    'docs.filterAll': 'Tout',
    'docs.filterDevis': 'Devis',
    'docs.filterFacture': 'Facture',
    'docs.filterPaid': 'Payé',
    'docs.filterPending': 'En attente',
    'docs.filterMonth': 'Ce mois',
    'settings.title': 'Réglages',
    'settings.accountType': 'Type de compte',
    'settings.accountTypeHint': 'Adapte les champs et documents affichés',
    'settings.language': 'Langue',
    'settings.tva': 'TVA par défaut',
    'settings.autoSync': 'Synchronisation automatique',
    'settings.localData': 'Données locales',
    'settings.documents': 'Documents',
    'settings.clients': 'Clients',
    'settings.company': 'Société',
    'settings.clearData': 'Effacer toutes les données',
    'settings.clearConfirmTitle': 'Supprimer toutes les données ?',
    'settings.clearConfirmBody': 'Cette action est irréversible. Tous les documents, clients et paramètres seront supprimés.',
    'settings.cancel': 'Annuler',
    'settings.deleteAll': 'Supprimer tout',
    'settings.logout': 'Se déconnecter',
    'settings.loggingOut': 'Déconnexion…',
    'settings.saved': 'Paramètre enregistré ✓',
    'settings.cleared': 'Toutes les données ont été effacées',
    'settings.modeEntreprise': 'Mode Entreprise activé ✓',
    'settings.modeArtisan': 'Mode Artisan activé ✓',
    'settings.modeError': 'Impossible de changer le mode',
    'settings.version': 'Conformes DGI Algérie',
    'settings.support': 'Support & aide',
    'settings.supportHint': 'Contacter l\'équipe Rakmana',
    'settings.deleteAccount': 'Supprimer mon compte',
    'settings.deleteAccountConfirmTitle': 'Supprimer définitivement votre compte ?',
    'settings.deleteAccountConfirmBody': 'Cette action est irréversible. Toutes vos données (documents, clients, société) seront supprimées du serveur.',
    'settings.deleteAccountError': 'Erreur lors de la suppression',
    'settings.deleteAccounting': 'Suppression…',
    'fab.facture': 'Facture',
    'fab.devis': 'Devis',
    'fab.duplicate': 'Dupliquer',
    'common.artisan': '🔨 Artisan',
    'common.entreprise': '🏢 Entreprise',
  },

  ar: {
    'nav.home': 'الرئيسية',
    'nav.documents': 'الوثائق',
    'nav.company': 'الشركة',
    'nav.settings': 'الإعدادات',
    'stats.thisMonth': 'هذا الشهر',
    'stats.docsCreated': 'وثيقة منشأة',
    'stats.revenue': 'رقم الأعمال',
    'stats.revenueSub': 'دج شامل الضريبة',
    'stats.clients': 'العملاء',
    'stats.clientsSub': 'مسجلون',
    'stats.drafts': 'المسودات',
    'stats.draftsSub': 'في الانتظار',
    'stats.unpaid': 'غير مدفوعة',
    'stats.unpaidSub': 'فواتير في الانتظار',
    'docs.title': 'وثائقي',
    'docs.empty': 'لا توجد وثائق',
    'docs.emptyHint': 'أنشئ وثيقتك الأولى',
    'docs.searchPlaceholder': 'بحث…',
    'docs.filterAll': 'الكل',
    'docs.filterDevis': 'عرض سعر',
    'docs.filterFacture': 'فاتورة',
    'docs.filterPaid': 'مدفوع',
    'docs.filterPending': 'في الانتظار',
    'docs.filterMonth': 'هذا الشهر',
    'settings.title': 'الإعدادات',
    'settings.accountType': 'نوع الحساب',
    'settings.accountTypeHint': 'يكيّف الحقول والوثائق المعروضة',
    'settings.language': 'اللغة',
    'settings.tva': 'نسبة الضريبة الافتراضية',
    'settings.autoSync': 'المزامنة التلقائية',
    'settings.localData': 'البيانات المحلية',
    'settings.documents': 'الوثائق',
    'settings.clients': 'العملاء',
    'settings.company': 'الشركة',
    'settings.clearData': 'مسح جميع البيانات',
    'settings.clearConfirmTitle': 'حذف جميع البيانات؟',
    'settings.clearConfirmBody': 'هذا الإجراء لا يمكن التراجع عنه. ستُحذف جميع الوثائق والعملاء والإعدادات.',
    'settings.cancel': 'إلغاء',
    'settings.deleteAll': 'حذف الكل',
    'settings.logout': 'تسجيل الخروج',
    'settings.loggingOut': 'جاري الخروج…',
    'settings.saved': 'تم حفظ الإعداد ✓',
    'settings.cleared': 'تم مسح جميع البيانات',
    'settings.modeEntreprise': 'تم تفعيل وضع الشركة ✓',
    'settings.modeArtisan': 'تم تفعيل وضع الحرفي ✓',
    'settings.modeError': 'تعذّر تغيير الوضع',
    'settings.version': 'متوافق مع المديرية العامة للضرائب',
    'settings.support': 'الدعم والمساعدة',
    'settings.supportHint': 'تواصل مع فريق رقمنة',
    'settings.deleteAccount': 'حذف حسابي',
    'settings.deleteAccountConfirmTitle': 'حذف حسابك نهائياً؟',
    'settings.deleteAccountConfirmBody': 'هذا الإجراء لا يمكن التراجع عنه. ستُحذف جميع بياناتك (وثائق، عملاء، شركة) من الخادم.',
    'settings.deleteAccountError': 'خطأ أثناء الحذف',
    'settings.deleteAccounting': 'جاري الحذف…',
    'fab.facture': 'فاتورة',
    'fab.devis': 'عرض سعر',
    'fab.duplicate': 'نسخ',
    'common.artisan': '🔨 حرفي',
    'common.entreprise': '🏢 شركة',
  },

  en: {
    'nav.home': 'Home',
    'nav.documents': 'Documents',
    'nav.company': 'Company',
    'nav.settings': 'Settings',
    'stats.thisMonth': 'This month',
    'stats.docsCreated': 'docs created',
    'stats.revenue': 'Revenue',
    'stats.revenueSub': 'DA incl. tax',
    'stats.clients': 'Clients',
    'stats.clientsSub': 'registered',
    'stats.drafts': 'Drafts',
    'stats.draftsSub': 'pending',
    'stats.unpaid': 'Unpaid',
    'stats.unpaidSub': 'invoices pending',
    'docs.title': 'My documents',
    'docs.empty': 'No documents',
    'docs.emptyHint': 'Create your first document',
    'docs.searchPlaceholder': 'Search…',
    'docs.filterAll': 'All',
    'docs.filterDevis': 'Quote',
    'docs.filterFacture': 'Invoice',
    'docs.filterPaid': 'Paid',
    'docs.filterPending': 'Pending',
    'docs.filterMonth': 'This month',
    'settings.title': 'Settings',
    'settings.accountType': 'Account type',
    'settings.accountTypeHint': 'Adapts the fields and documents shown',
    'settings.language': 'Language',
    'settings.tva': 'Default VAT rate',
    'settings.autoSync': 'Automatic sync',
    'settings.localData': 'Local data',
    'settings.documents': 'Documents',
    'settings.clients': 'Clients',
    'settings.company': 'Company',
    'settings.clearData': 'Clear all data',
    'settings.clearConfirmTitle': 'Delete all data?',
    'settings.clearConfirmBody': 'This action is irreversible. All documents, clients and settings will be deleted.',
    'settings.cancel': 'Cancel',
    'settings.deleteAll': 'Delete all',
    'settings.logout': 'Log out',
    'settings.loggingOut': 'Logging out…',
    'settings.saved': 'Setting saved ✓',
    'settings.cleared': 'All data cleared',
    'settings.modeEntreprise': 'Enterprise mode enabled ✓',
    'settings.modeArtisan': 'Artisan mode enabled ✓',
    'settings.modeError': 'Failed to change mode',
    'settings.version': 'DGI Algeria compliant',
    'settings.support': 'Support & help',
    'settings.supportHint': 'Contact the Rakmana team',
    'settings.deleteAccount': 'Delete my account',
    'settings.deleteAccountConfirmTitle': 'Permanently delete your account?',
    'settings.deleteAccountConfirmBody': 'This action is irreversible. All your data (documents, clients, company) will be deleted from the server.',
    'settings.deleteAccountError': 'Error during deletion',
    'settings.deleteAccounting': 'Deleting…',
    'fab.facture': 'Invoice',
    'fab.devis': 'Quote',
    'fab.duplicate': 'Duplicate',
    'common.artisan': '🔨 Artisan',
    'common.entreprise': '🏢 Enterprise',
  },
};

// ── Hook ─────────────────────────────────────────────────────

export function useMobileI18n() {
  const locale = useUserStore((s) => s.locale);
  const dict = TRANSLATIONS[locale];

  const t = (key: TranslationKeys): string => dict[key] ?? key;
  const dir: 'rtl' | 'ltr' = locale === 'ar' ? 'rtl' : 'ltr';

  return { t, dir, locale };
}

// Imperative version for use outside React (notify calls, etc.)
export function getMobileT(locale: MobileLocale) {
  const dict = TRANSLATIONS[locale];
  return (key: TranslationKeys): string => dict[key] ?? key;
}
