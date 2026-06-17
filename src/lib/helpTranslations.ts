export type HelpLang = 'fr' | 'ar' | 'en';

export const HELP_T = {
  fr: {
    // Header
    title: 'Centre d\'aide CloudDevis',
    subtitle: 'Trouvez des réponses à vos questions, consultez nos tutoriels et guides complets.',
    searchPlaceholder: 'Rechercher un article...',

    // Nav
    helpCenter: 'Centre d\'aide',
    cgu: 'CGU',
    home: 'Accueil',

    // Categories
    exploreByCategory: 'Explorer par catégorie',
    popularArticles: 'Articles populaires',
    noResults: 'Aucun résultat pour',
    contactSupport: 'Contacter le support',

    // Category titles
    catGettingStarted: 'Démarrage rapide',
    catGettingStartedDesc: 'Premiers pas avec CloudDevis',
    catDocuments: 'Créer des documents',
    catDocumentsDesc: 'Devis, factures, proformas',
    catBilling: 'Facturation & paiement',
    catBillingDesc: 'Gestion des paiements',
    catLegal: 'Conformité légale',
    catLegalDesc: 'NIF, RC, TVA, Timbre fiscal',
    catTroubleshooting: 'Résolution de problèmes',
    catTroubleshootingDesc: 'Aide et dépannage',
    catAccount: 'Compte & paramètres',
    catAccountDesc: 'Profil, sécurité, équipe',

    // Common
    articles: 'articles',
    readTime: 'min',
    readMore: 'En savoir plus',
    previous: 'Précédent',
    next: 'Suivant',
    of: 'de',
    backTo: 'Retour à',

    // FAQ
    faqTitle: 'Questions fréquentes',
    faqSubtitle: 'Trouvez rapidement des réponses à vos questions',
    faqNoAnswer: 'Vous n\'avez pas trouvé votre réponse ?',

    // Contact
    contactTitle: 'Vous n\'avez pas trouvé votre réponse ?',
    contactDesc: 'Notre équipe de support est disponible pour vous aider. Nous répondons généralement sous 24 heures.',
    emailUs: 'support@clouddevis.com',

    // Categories data
    categories: {
      'getting-started': { title: 'Démarrage rapide', desc: 'Premiers pas avec CloudDevis', icon: '🚀' },
      'documents': { title: 'Créer des documents', desc: 'Devis, factures, proformas', icon: '📄' },
      'billing': { title: 'Facturation & paiement', desc: 'Gestion des paiements', icon: '💰' },
      'legal': { title: 'Conformité légale', desc: 'NIF, RC, TVA, Timbre fiscal', icon: '⚖️' },
      'troubleshooting': { title: 'Résolution de problèmes', desc: 'Aide et dépannage', icon: '🔧' },
      'account': { title: 'Compte & paramètres', desc: 'Profil, sécurité, équipe', icon: '👤' },
    },

    // FAQ data
    faq: {
      general: {
        title: 'Général',
        items: [
          { q: 'Qu\'est-ce que CloudDevis ?', a: 'CloudDevis est un outil en ligne de création de devis et factures conforme à la réglementation algérienne.' },
          { q: 'Puis-je utiliser CloudDevis gratuitement ?', a: 'Oui ! La version gratuite permet de créer 5 documents par mois avec toutes les fonctionnalités de base.' },
          { q: 'CloudDevis est-il sécurisé ?', a: 'Oui. Nous utilisons HTTPS, le chiffrement TLS 1.3 et des cookies sécurisés.' },
          { q: 'Fonctionne-t-il sur mobile ?', a: 'Oui, CloudDevis est entièrement responsive sur tous les appareils.' },
        ],
      },
      documents: {
        title: 'Documents',
        items: [
          { q: 'Quels types de documents puis-je créer ?', a: '7 types : Devis, Facture, Proforma, Bon de Commande, Bon de Réception, Intervention et Attachement.' },
          { q: 'Comment créer un devis ?', a: 'Allez dans l\'éditeur, remplissez vos informations, ajoutez le client et les lignes. Le total est calculé automatiquement.' },
          { q: 'Comment exporter en PDF ?', a: 'Cliquez sur "PDF" dans la barre d\'outils ou utilisez Ctrl+P.' },
        ],
      },
      fiscalite: {
        title: 'Fiscalité',
        items: [
          { q: 'Comment fonctionne le Timbre Fiscal ?', a: '1% du montant TTC, applicable aux factures > 10 000 DA. Min 5 DA, Max 2 500 DA. Les devis en sont exclus.' },
          { q: 'Quel taux de TVA appliquer ?', a: '19% (normal) ou 9% (réduit). Sélectionnez le taux dans les paramètres.' },
          { q: 'Ma facture est-elle conforme ?', a: 'Oui, si elle contient toutes les mentions obligatoires. CloudDevis génère des factures 100% conformes.' },
        ],
      },
      compte: {
        title: 'Compte',
        items: [
          { q: 'Comment modifier mes informations ?', a: 'Allez dans Paramètres > Informations. Modifiez nom, adresse, numéros fiscaux, logo.' },
          { q: 'Comment protéger mon compte ?', a: 'Mot de passe fort (12+ caractères), déconnexion automatique, vérifiez vos sessions.' },
          { q: 'Puis-je exporter mes données ?', a: 'Oui. Paramètres > Confidentialité > Exporter mes données.' },
        ],
      },
      problemes: {
        title: 'Problèmes',
        items: [
          { q: 'J\'ai oublié mon mot de passe', a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion et suivez les instructions.' },
          { q: 'L\'application est lente', a: 'Videz le cache, désactivez les extensions, utilisez Chrome ou Firefox à jour.' },
          { q: 'Comment contacter le support ?', a: 'Email à support@clouddevis.com avec description et captures d\'écran. Réponse sous 24h.' },
        ],
      },
    },
  },

  ar: {
    // Header
    title: 'مركز مساعدة CloudDevis',
    subtitle: 'ابحث عن إجابات لأسئلتك، واستعرض دروسنا التعليمية والأدلة الشاملة.',
    searchPlaceholder: 'ابحث عن مقال...',

    // Nav
    helpCenter: 'مركز المساعدة',
    cgu: 'شروط الاستخدام',
    home: 'الرئيسية',

    // Categories
    exploreByCategory: 'استكشف حسب الفئة',
    popularArticles: 'المقالات الشائعة',
    noResults: 'لا توجد نتائج لـ',
    contactSupport: 'تواصل مع الدعم',

    // Category titles
    catGettingStarted: 'البدء السريع',
    catGettingStartedDesc: 'الخطوات الأولى مع CloudDevis',
    catDocuments: 'إنشاء الوثائق',
    catDocumentsDesc: 'عروض أسعار، فواتير، برومو',
    catBilling: 'الفواتير والدفع',
    catBillingDesc: 'إدارة المدفوعات',
    catLegal: 'الامتثال القانوني',
    catLegalDesc: 'NIF, RC, TVA, الطابع الضريبي',
    catTroubleshooting: 'حل المشاكل',
    catTroubleshootingDesc: 'المساعدة وحل الأخطاء',
    catAccount: 'الحساب والإعدادات',
    catAccountDesc: 'الملف الشخصي والأمان',

    // Common
    articles: 'مقالات',
    readTime: 'دقيقة',
    readMore: 'اقرأ المزيد',
    previous: 'السابق',
    next: 'التالي',
    of: 'من',
    backTo: 'العودة إلى',

    // FAQ
    faqTitle: 'الأسئلة الشائعة',
    faqSubtitle: 'ابحث بسرعة عن إجابات لأسئلتك',
    faqNoAnswer: 'لم تجد إجابتك؟',

    // Contact
    contactTitle: 'لم تجد إجابتك؟',
    contactDesc: 'فريق الدعم متاح لمساعدتك. نرد عادةً خلال 24 ساعة.',
    emailUs: 'support@clouddevis.com',

    // Categories data
    categories: {
      'getting-started': { title: 'البدء السريع', desc: 'الخطوات الأولى مع CloudDevis', icon: '🚀' },
      'documents': { title: 'إنشاء الوثائق', desc: 'عروض أسعار، فواتير، برومو', icon: '📄' },
      'billing': { title: 'الفواتير والدفع', desc: 'إدارة المدفوعات', icon: '💰' },
      'legal': { title: 'الامتثال القانوني', desc: 'NIF, RC, TVA, الطابع الضريبي', icon: '⚖️' },
      'troubleshooting': { title: 'حل المشاكل', desc: 'المساعدة وحل الأخطاء', icon: '🔧' },
      'account': { title: 'الحساب والإعدادات', desc: 'الملف الشخصي والأمان', icon: '👤' },
    },

    // FAQ data
    faq: {
      general: {
        title: 'عام',
        items: [
          { q: 'ما هو CloudDevis؟', a: 'CloudDevis هو أداة إلكترونية لإنشاء عروض أسعار وفواتير متوافقة مع التنظيم الجزائري.' },
          { q: 'هل يمكنني استخدام CloudDevis مجاناً؟', a: 'نعم! النسخة المجانية تسمح بإنشاء 5 وثائق شهرياً مع جميع الميزات الأساسية.' },
          { q: 'هل CloudDevis آمن؟', a: 'نعم. نستخدم HTTPS وتشفير TLS 1.3 وملفات تعريف ارتباط آمنة.' },
          { q: 'هل يعمل على الهاتف؟', a: 'نعم، CloudDevis متجاوب بالكامل على جميع الأجهزة.' },
        ],
      },
      documents: {
        title: 'الوثائق',
        items: [
          { q: 'ما أنواع الوثائق المتاحة؟', a: '7 أنواع: عرض سعر، فاتورة، برومو، أمر شراء، إيصال استقبال، تدخل، مرفق.' },
          { q: 'كيف أنشئ عرض سعر؟', a: 'اذهب إلى المحرر، أكمل معلوماتك، أضف العميل والبنود. يتم حساب الإجمالي تلقائياً.' },
          { q: 'كيف أصدّر PDF؟', a: 'انقر على "PDF" في شريط الأدوات أو استخدم Ctrl+P.' },
        ],
      },
      fiscalite: {
        title: 'الضرائب',
        items: [
          { q: 'كيف يعمل الطابع الضريبي؟', a: '1% من المبلغ الشامل، يُطبق على الفواتير التي تزيد عن 10,000 دج. الحد الأدنى 5 دج، الأقصى 2,500 دج.' },
          { q: 'ما معدل TVA المطبق؟', a: '19% (عادي) أو 9% (مخفض). حدد المعدل في إعدادات الوثيقة.' },
          { q: 'هل فاتوري متوافقة قانونياً؟', a: 'نعم، إذا كانت تحتوي على جميع الإلزامات. CloudDevis ينشئ فواتير متوافقة 100%.' },
        ],
      },
      compte: {
        title: 'الحساب',
        items: [
          { q: 'كيف أعدّل معلوماتي؟', a: 'اذهب إلى الإعدادات > المعلومات. عدّل الاسم والعنوان والأرقام والشعار.' },
          { q: 'كيف أحمي حسابي؟', a: 'كلمة مرور قوية (12+ حرف)، تسجيل خروج تلقائي، تحقق من الجلسات النشطة.' },
          { q: 'هل يمكنني تصدير بياناتي؟', a: 'نعم. الإعدادات > الخصوصية > تصدير بياناتي.' },
        ],
      },
      problemes: {
        title: 'المشاكل',
        items: [
          { q: 'نسيت كلمة المرور', a: 'انقر "نسيت كلمة المرور" في صفحة تسجيل الدخول واتبع التعليمات.' },
          { q: 'التطبيق بطيء', a: 'امسح ذاكرة التخزين المؤقت، عطل الإضافات، استخدم Chrome أو Firefox محدّث.' },
          { q: 'كيف أتواصل مع الدعم؟', a: 'أرسل إيميل إلى support@clouddevis.com مع الوصف واللقطات. الرد خلال 24 ساعة.' },
        ],
      },
    },
  },

  en: {
    // Header
    title: 'CloudDevis Help Center',
    subtitle: 'Find answers to your questions, browse tutorials and comprehensive guides.',
    searchPlaceholder: 'Search for an article...',

    // Nav
    helpCenter: 'Help Center',
    cgu: 'Terms',
    home: 'Home',

    // Categories
    exploreByCategory: 'Browse by category',
    popularArticles: 'Popular articles',
    noResults: 'No results for',
    contactSupport: 'Contact support',

    // Category titles
    catGettingStarted: 'Getting Started',
    catGettingStartedDesc: 'First steps with CloudDevis',
    catDocuments: 'Creating Documents',
    catDocumentsDesc: 'Quotes, invoices, proformas',
    catBilling: 'Billing & Payments',
    catBillingDesc: 'Payment management',
    catLegal: 'Legal Compliance',
    catLegalDesc: 'NIF, RC, VAT, Stamp Duty',
    catTroubleshooting: 'Troubleshooting',
    catTroubleshootingDesc: 'Help and debugging',
    catAccount: 'Account & Settings',
    catAccountDesc: 'Profile, security, team',

    // Common
    articles: 'articles',
    readTime: 'min',
    readMore: 'Read more',
    previous: 'Previous',
    next: 'Next',
    of: 'of',
    backTo: 'Back to',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Quickly find answers to your questions',
    faqNoAnswer: 'Didn\'t find your answer?',

    // Contact
    contactTitle: 'Didn\'t find your answer?',
    contactDesc: 'Our support team is available to help you. We typically respond within 24 hours.',
    emailUs: 'support@clouddevis.com',

    // Categories data
    categories: {
      'getting-started': { title: 'Getting Started', desc: 'First steps with CloudDevis', icon: '🚀' },
      'documents': { title: 'Creating Documents', desc: 'Quotes, invoices, proformas', icon: '📄' },
      'billing': { title: 'Billing & Payments', desc: 'Payment management', icon: '💰' },
      'legal': { title: 'Legal Compliance', desc: 'NIF, RC, VAT, Stamp Duty', icon: '⚖️' },
      'troubleshooting': { title: 'Troubleshooting', desc: 'Help and debugging', icon: '🔧' },
      'account': { title: 'Account & Settings', desc: 'Profile, security, team', icon: '👤' },
    },

    // FAQ data
    faq: {
      general: {
        title: 'General',
        items: [
          { q: 'What is CloudDevis?', a: 'CloudDevis is an online tool for creating quotes and invoices compliant with Algerian regulations.' },
          { q: 'Can I use CloudDevis for free?', a: 'Yes! The free plan allows creating 5 documents per month with all basic features.' },
          { q: 'Is CloudDevis secure?', a: 'Yes. We use HTTPS, TLS 1.3 encryption, and secure cookies.' },
          { q: 'Does it work on mobile?', a: 'Yes, CloudDevis is fully responsive on all devices.' },
        ],
      },
      documents: {
        title: 'Documents',
        items: [
          { q: 'What document types can I create?', a: '7 types: Quote, Invoice, Proforma, Purchase Order, Receipt, Intervention, and Attachment.' },
          { q: 'How do I create a quote?', a: 'Go to the editor, fill in your info, add the client and line items. Totals are calculated automatically.' },
          { q: 'How do I export to PDF?', a: 'Click "PDF" in the toolbar or use Ctrl+P.' },
        ],
      },
      fiscalite: {
        title: 'Tax',
        items: [
          { q: 'How does Stamp Duty work?', a: '1% of TTC amount, applicable to invoices > 10,000 DA. Min 5 DA, Max 2,500 DA. Quotes are excluded.' },
          { q: 'Which VAT rate to apply?', a: '19% (standard) or 9% (reduced). Select the rate in document settings.' },
          { q: 'Is my invoice legally compliant?', a: 'Yes, if it contains all mandatory mentions. CloudDevis generates 100% compliant invoices.' },
        ],
      },
      compte: {
        title: 'Account',
        items: [
          { q: 'How do I update my information?', a: 'Go to Settings > Information. Edit company name, address, tax IDs, logo.' },
          { q: 'How do I protect my account?', a: 'Strong password (12+ chars), auto-logout, check active sessions regularly.' },
          { q: 'Can I export my data?', a: 'Yes. Settings > Privacy > Export my data.' },
        ],
      },
      problemes: {
        title: 'Issues',
        items: [
          { q: 'I forgot my password', a: 'Click "Forgot password" on the login page and follow the instructions.' },
          { q: 'The app is slow', a: 'Clear cache, disable extensions, use updated Chrome or Firefox.' },
          { q: 'How to contact support?', a: 'Email support@clouddevis.com with description and screenshots. Response within 24h.' },
        ],
      },
    },
  },
} as const;

export function hT(lang: HelpLang, key: string): string {
  const t = HELP_T[lang];
  const keys = key.split('.');
  let val: unknown = t;
  for (const k of keys) {
    if (val && typeof val === 'object') val = (val as Record<string, unknown>)[k];
    else return key;
  }
  return typeof val === 'string' ? val : key;
}
