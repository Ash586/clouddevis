import type { PlanId } from './pricing';

export type FeatureId =
  | 'documents:unlimited'
  | 'documents:50'
  | 'documents:5'
  | 'team:members'
  | 'templates:custom'
  | 'templates:all'
  | 'reports:advanced'
  | 'reports:basic'
  | 'api:access'
  | 'storage:large'
  | 'support:priority'
  | 'support:dedicated'
  | 'export:pdf:clean'
  | 'projects:management'
  | 'inventory:basic'
  | 'inventory:advanced'
  | 'branding:custom'
  | 'offline:sync'
  | 'analytics:ai'
  | 'integrations:custom';

export const PLAN_FEATURES: Record<PlanId, FeatureId[]> = {
  free: [
    'documents:5',
    'export:pdf:clean',
  ],
  standard: [
    'documents:50',
    'export:pdf:clean',
    'templates:all',
    'reports:basic',
    'team:members',
    'storage:large',
    'branding:custom',
  ],
  pro: [
    'documents:unlimited',
    'export:pdf:clean',
    'templates:custom',
    'reports:advanced',
    'api:access',
    'team:members',
    'storage:large',
    'support:priority',
    'projects:management',
    'inventory:basic',
    'offline:sync',
  ],
  max: [
    'documents:unlimited',
    'export:pdf:clean',
    'templates:custom',
    'reports:advanced',
    'api:access',
    'team:members',
    'storage:large',
    'support:priority',
    'projects:management',
    'inventory:advanced',
    'offline:sync',
    'analytics:ai',
  ],
  enterprise: [
    'documents:unlimited',
    'export:pdf:clean',
    'templates:custom',
    'reports:advanced',
    'api:access',
    'team:members',
    'storage:large',
    'support:dedicated',
    'projects:management',
    'inventory:advanced',
    'offline:sync',
    'analytics:ai',
    'integrations:custom',
  ],
};

export function hasFeature(planId: PlanId, feature: FeatureId): boolean {
  return PLAN_FEATURES[planId]?.includes(feature) ?? false;
}

export function getFeatureLabel(feature: FeatureId, locale: 'fr' | 'ar' | 'en'): string {
  const labels: Record<FeatureId, { fr: string; ar: string; en: string }> = {
    'documents:unlimited': { fr: 'Documents illimités', ar: 'مستندات غير محدودة', en: 'Unlimited documents' },
    'documents:50': { fr: '50 documents/mois', ar: '50 مستند/شهر', en: '50 documents/month' },
    'documents:5': { fr: '5 documents/mois', ar: '5 مستندات/شهر', en: '5 documents/month' },
    'team:members': { fr: 'Membres d\'équipe', ar: 'أعضاء الفريق', en: 'Team members' },
    'templates:custom': { fr: 'Modèles personnalisés', ar: 'قوالب مخصصة', en: 'Custom templates' },
    'templates:all': { fr: 'Tous les modèles', ar: 'كل القوالب', en: 'All templates' },
    'reports:advanced': { fr: 'Rapports avancés', ar: 'تقارير متقدمة', en: 'Advanced reports' },
    'reports:basic': { fr: 'Rapports de base', ar: 'تقارير أساسية', en: 'Basic reports' },
    'api:access': { fr: 'Accès API', ar: 'وصول API', en: 'API access' },
    'storage:large': { fr: 'Stockage étendu', ar: 'مساحة تخزين كبيرة', en: 'Large storage' },
    'support:priority': { fr: 'Support prioritaire', ar: 'دعم ذو أولوية', en: 'Priority support' },
    'support:dedicated': { fr: 'Support dédié 24/7', ar: 'دعم مخصص 24/7', en: 'Dedicated 24/7 support' },
    'export:pdf:clean': { fr: 'Export PDF sans filigrane', ar: 'تصدير PDF بدون علامة مائية', en: 'PDF export without watermark' },
    'projects:management': { fr: 'Gestion de projets', ar: 'إدارة المشاريع', en: 'Project management' },
    'inventory:basic': { fr: 'Inventaire de base', ar: 'مخزون أساسي', en: 'Basic inventory' },
    'inventory:advanced': { fr: 'Inventaire avancé', ar: 'مخزون متقدم', en: 'Advanced inventory' },
    'branding:custom': { fr: 'Personnalisation de marque', ar: 'تخصيص العلامة التجارية', en: 'Custom branding' },
    'offline:sync': { fr: 'Synchronisation hors-ligne', ar: 'مزامنة بدون إنترنت', en: 'Offline sync' },
    'analytics:ai': { fr: 'Analyses IA', ar: 'تحليلات بالذكاء الاصطناعي', en: 'AI analytics' },
    'integrations:custom': { fr: 'Intégrations personnalisées', ar: 'تكاملات مخصصة', en: 'Custom integrations' },
  };
  return labels[feature]?.[locale] ?? feature;
}
