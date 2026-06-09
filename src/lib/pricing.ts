export type PlanId = 'free' | 'standard' | 'pro' | 'max' | 'enterprise';

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
    price: 1900,
    priceYearly: 19000,
    description: {
      fr: 'Pour les petites entreprises en pleine croissance',
      ar: 'للشركات الصغيرة في طور النمو',
      en: 'For growing small businesses',
    },
    limits: {
      docsPerMonth: 50,
      teamMembers: 2,
      storageMB: 1024,
      templates: 'all',
      support: 'email_24h',
    },
    highlighted: true,
  },
  pro: {
    id: 'pro',
    name: { fr: 'Pro', ar: 'محترف', en: 'Pro' },
    price: 4900,
    priceYearly: 49000,
    description: {
      fr: 'Pour les entreprises moyennes aux besoins avancés',
      ar: 'للشركات المتوسطة ذات الاحتياجات المتقدمة',
      en: 'For medium businesses with advanced needs',
    },
    limits: {
      docsPerMonth: 'unlimited',
      teamMembers: 5,
      storageMB: 10240,
      templates: 'custom',
      support: 'priority_8h',
    },
  },
  max: {
    id: 'max',
    name: { fr: 'Max', ar: 'ماكس', en: 'Max' },
    price: 9900,
    priceYearly: 99000,
    description: {
      fr: 'Pour les entreprises exigeantes, performances maximales',
      ar: 'للشركات المتطلبة، أداء أقصى',
      en: 'For demanding businesses, maximum performance',
    },
    limits: {
      docsPerMonth: 'unlimited',
      teamMembers: 15,
      storageMB: 51200,
      templates: 'custom',
      support: 'priority_8h',
    },
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

export const PLAN_ORDER: PlanId[] = ['free', 'standard', 'pro', 'max', 'enterprise'];

export function getPlan(id: PlanId): Plan {
  return PLANS[id];
}

export function getPlanByStatus(status: string): Plan {
  switch (status) {
    case 'TRIAL': return PLANS.pro;
    case 'STANDARD': return PLANS.standard;
    case 'PRO': return PLANS.pro;
    case 'MAX': return PLANS.max;
    case 'ENTERPRISE': return PLANS.enterprise;
    default: return PLANS.free;
  }
}

export function formatPrice(price: number): string {
  return price.toLocaleString('fr-DZ') + ' DA';
}
