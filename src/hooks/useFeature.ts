'use client';

import { useUser } from '@/hooks/useUser';
import { hasFeature, type FeatureId } from '@/lib/features';

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

function planIdFromStatus(status: string): 'free' | 'standard' | 'pro' | 'max' | 'enterprise' {
  switch (status) {
    case 'TRIAL': return 'pro';
    case 'STANDARD': return 'standard';
    case 'PRO': return 'pro';
    case 'MAX': return 'max';
    case 'ENTERPRISE': return 'enterprise';
    default: return 'free';
  }
}
