'use client';

import { useFeature } from '@/hooks/useFeature';
import { getFeatureLabel, type FeatureId } from '@/lib/features';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface FeatureGateProps {
  featureId: FeatureId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLock?: boolean;
}

export function FeatureGate({ featureId, children, fallback, showLock = true }: FeatureGateProps) {
  const { check } = useFeature();
  const t = useTranslations('subscription');
  const router = useRouter();

  if (check(featureId)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  if (!showLock) return null;

  return (
    <div className="relative group">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-[var(--navy-2)]/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-[rgba(245,237,214,0.1)] max-w-xs">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-xs font-medium text-[var(--sand)] mb-2">
            {t('featureLocked') || 'Cette fonctionnalité est verrouillée'}
          </p>
          <p className="text-[10px] text-[var(--sand-muted)] mb-3">
            {t('featureLockedDesc') || 'Passez à un forfait supérieur pour y accéder'}
          </p>
          <button onClick={() => router.push('/pricing')} className="inline-block bg-[var(--green-2)] text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-[var(--green-3)] transition">
            {t('upgrade') || 'Voir les offres →'}
          </button>
        </div>
      </div>
    </div>
  );
}
