'use client';

import { useUser } from '@/hooks/useUser';
import { hasFeature, type FeatureId } from '@/lib/features';
import type { PlanId } from '@/lib/pricing';

export function useFeature() {
  const { user } = useUser();

  const check = (featureId: FeatureId): boolean => {
    if (!user || !user.subscriptionStatus) return false;
    const planId = planIdFromStatus(user.subscriptionStatus);
    return hasFeature(planId, featureId);
  };

  const getPlanId = (): string => {
    if (!user || !user.subscriptionStatus) return 'free';
    return planIdFromStatus(user.subscriptionStatus);
  };

  return { check, getPlanId, user };
}

function planIdFromStatus(status: string): PlanId {
  switch (status) {
    case 'TRIAL':
    case 'PRO':
    case 'MAX':
    case 'STANDARD': return 'standard';
    case 'ENTERPRISE': return 'enterprise';
    default: return 'free';
  }
}
