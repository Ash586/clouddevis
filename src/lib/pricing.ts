export type PlanId = 'free' | 'standard' | 'enterprise';

export interface PlanLimit {
  docsPerMonth: number | 'unlimited';
  teamMembers: number;
  storageMB: number;
  templates: 'basic' | 'all' | 'custom';
  support: 'email_48h' | 'email_24h' | 'priority_8h' | 'dedicated_24_7';
}

export interface Plan {
  id: PlanId;
  name: { fr: string; ar: string; en: string };
  price: number;
  priceYearly: number;
  description: { fr: string; ar: string; en: string };
  limits: PlanLimit;
  highlighted?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: { fr: 'Gratuit', ar: 'مجاني', en: 'Free' },
    price: 0,
    priceYearly: 0,
    description: {
      fr: 'Pour les très petites entreprises qui démarrent',
      ar: 'للشركات الصغيرة جداً التي تبدأ',
      en: 'For very small businesses just starting out',
    },
    limits: {
      docsPerMonth: 5,
      teamMembers: 1,
      storageMB: 100,
      templates: 'basic',
      support: 'email_48h',
    },
  },
  standard: {
    id: 'standard',
    name: { fr: 'Standard', ar: 'قياسي', en: 'Standard' },
    price: 690,
    priceYearly: 6900,
    description: {
      fr: 'Pour les entreprises qui veulent aller plus loin',
      ar: 'للشركات التي تريد المزيد',
      en: 'For businesses that want more',
    },
    limits: {
      docsPerMonth: 'unlimited',
      teamMembers: 5,
      storageMB: 10240,
      templates: 'all',
      support: 'email_24h',
    },
    highlighted: true,
  },
  enterprise: {
    id: 'enterprise',
    name: { fr: 'Enterprise', ar: 'مؤسسات', en: 'Enterprise' },
    price: 14900,
    priceYearly: 149000,
    description: {
      fr: 'Solution sur mesure pour les grandes organisations',
      ar: 'حل مخصص للمؤسسات الكبيرة',
      en: 'Tailored solution for large organizations',
    },
    limits: {
      docsPerMonth: 'unlimited',
      teamMembers: 999,
      storageMB: 999999,
      templates: 'custom',
      support: 'dedicated_24_7',
    },
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'standard', 'enterprise'];

export function getPlan(id: PlanId): Plan {
  return PLANS[id] || PLANS.free;
}

export function getPlanByStatus(status: string): Plan {
  switch (status) {
    case 'TRIAL':
    case 'STANDARD':
    case 'PRO':
    case 'MAX':
      return PLANS.standard;
    case 'ENTERPRISE': return PLANS.enterprise;
    default: return PLANS.free;
  }
}

export function formatPrice(price: number): string {
  return price.toLocaleString('fr-DZ') + ' DA';
}
