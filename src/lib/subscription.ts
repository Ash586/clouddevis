import type { SessionUser } from './auth';
import type { PlanId, PlanLimit } from './pricing';
import { getPlanByStatus, PLANS } from './pricing';
import { hasFeature, SUBSCRIPTIONS_ENABLED, type FeatureId } from './features';

export const TRIAL_DAYS = 7;

/** Free-tier beta cap: max documents a FREE user may create per calendar day. */
export const FREE_TIER_DAILY_LIMIT = 2;

/**
 * Bounds (in UTC instants) of "today" on the Algeria calendar (Africa/Algiers is
 * UTC+1 year-round, no DST). Used so the free-tier daily counter — and the
 * "come back tomorrow" reset — align with the user's local midnight, not UTC.
 */
export function algiersDayWindow(now: Date): { gte: Date; lt: Date } {
  const DZ_OFFSET_MS = 60 * 60 * 1000; // UTC+1
  const dz = new Date(now.getTime() + DZ_OFFSET_MS);
  const dzMidnightAsUtc = Date.UTC(dz.getUTCFullYear(), dz.getUTCMonth(), dz.getUTCDate());
  const gte = new Date(dzMidnightAsUtc - DZ_OFFSET_MS);
  const lt = new Date(gte.getTime() + 24 * 60 * 60 * 1000);
  return { gte, lt };
}

/**
 * Whether a FREE user has hit the daily beta cap. Inert while subscriptions are
 * disabled (returns false), so it changes nothing until the master switch is on.
 */
export function freeTierBlocksToday(subscriptionStatus: string, todayCount: number): boolean {
  if (!SUBSCRIPTIONS_ENABLED) return false;
  if (subscriptionStatus !== 'FREE') return false;
  return todayCount >= FREE_TIER_DAILY_LIMIT;
}

export function getPlanFromUser(user: SessionUser): { id: PlanId; limits: PlanLimit } {
  const plan = getPlanByStatus(user.subscriptionStatus);
  return { id: plan.id, limits: plan.limits };
}

export function userHasFeature(user: SessionUser, feature: FeatureId): boolean {
  const planId = getPlanFromUser(user).id;
  return hasFeature(planId, feature);
}

export function getDocLimit(user: SessionUser): number | 'unlimited' {
  if (!SUBSCRIPTIONS_ENABLED) return 'unlimited';
  if (user.subscriptionStatus === 'TRIAL') return 'unlimited';
  const plan = getPlanByStatus(user.subscriptionStatus);
  return plan.limits.docsPerMonth;
}

export function getTeamMemberLimit(user: SessionUser): number {
  if (!SUBSCRIPTIONS_ENABLED) return Number.MAX_SAFE_INTEGER;
  if (user.subscriptionStatus === 'TRIAL') return 5;
  const plan = getPlanByStatus(user.subscriptionStatus);
  return plan.limits.teamMembers;
}

export function getStorageLimitMB(user: SessionUser): number {
  if (!SUBSCRIPTIONS_ENABLED) return Number.MAX_SAFE_INTEGER;
  if (user.subscriptionStatus === 'TRIAL') return 10240;
  const plan = getPlanByStatus(user.subscriptionStatus);
  return plan.limits.storageMB;
}

export function canCreateDocument(user: SessionUser, currentMonthCount: number): boolean {
  if (!SUBSCRIPTIONS_ENABLED) return true;
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
