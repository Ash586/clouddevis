import type { SessionUser } from './auth';
import type { PlanId, PlanLimit } from './pricing';
import { getPlanByStatus, PLANS } from './pricing';
import { hasFeature, type FeatureId } from './features';

export const TRIAL_DAYS = 7;

export function getPlanFromUser(user: SessionUser): { id: PlanId; limits: PlanLimit } {
  const plan = getPlanByStatus(user.subscriptionStatus);
  return { id: plan.id, limits: plan.limits };
}

export function userHasFeature(user: SessionUser, feature: FeatureId): boolean {
  const planId = getPlanFromUser(user).id;
  return hasFeature(planId, feature);
}

export function getDocLimit(user: SessionUser): number | 'unlimited' {
  if (user.subscriptionStatus === 'TRIAL') return 'unlimited';
  const plan = getPlanByStatus(user.subscriptionStatus);
  return plan.limits.docsPerMonth;
}

export function getTeamMemberLimit(user: SessionUser): number {
  if (user.subscriptionStatus === 'TRIAL') return 5;
  const plan = getPlanByStatus(user.subscriptionStatus);
  return plan.limits.teamMembers;
}

export function getStorageLimitMB(user: SessionUser): number {
  if (user.subscriptionStatus === 'TRIAL') return 10240;
  const plan = getPlanByStatus(user.subscriptionStatus);
  return plan.limits.storageMB;
}

export function canCreateDocument(user: SessionUser, currentMonthCount: number): boolean {
  if (user.subscriptionStatus === 'TRIAL') return true;
  if (user.subscriptionStatus === 'EXPIRED') return false;
  const limit = getDocLimit(user);
  if (limit === 'unlimited') return true;
  return currentMonthCount < limit;
}

export function getSubscriptionStatusLabel(status: string, locale: 'fr' | 'ar' | 'en'): string {
  const labels: Record<string, { fr: string; ar: string; en: string }> = {
    TRIAL: { fr: 'Essai', ar: 'تجربة', en: 'Trial' },
    FREE: { fr: 'Gratuit', ar: 'مجاني', en: 'Free' },
    STANDARD: { fr: 'Standard', ar: 'قياسي', en: 'Standard' },
    ENTERPRISE: { fr: 'Enterprise', ar: 'مؤسسات', en: 'Enterprise' },
    EXPIRED: { fr: 'Expiré', ar: 'منتهي', en: 'Expired' },
  };
  return labels[status]?.[locale] ?? status;
}

export function getPlanPrice(planId: PlanId): number {
  return PLANS[planId]?.price ?? 0;
}
