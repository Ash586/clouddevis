'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useUser } from '@/hooks/useUser';

export function TrialGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations('trial');
  const { user, loading } = useUser();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (loading) return null;

  if (!user) return <>{children}</>;

  const isTrialActive = user.subscriptionStatus === 'TRIAL';

  function handleBlocked() {
    setShowUpgrade(true);
  }

  return (
    <>
      {isTrialActive ? (
        <div>
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
            <span className="text-xs font-medium text-amber-700">
              {t('trialBanner')}&ensp;
              <button onClick={() => setShowUpgrade(true)} className="underline font-semibold">{t('subscribe')}</button>
            </span>
          </div>
          {children}
        </div>
      ) : user.subscriptionStatus === 'LIMITED' ? (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <Card className="max-w-sm p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">{t('accessLimited')}</h2>
            <p className="text-sm text-slate-500 mb-6">{t('trialExpired')}</p>
            <Button onClick={() => setShowUpgrade(true)}>{t('seePlans')}</Button>
          </Card>
        </div>
      ) : (
        <>{children}</>
      )}

      <Modal open={showUpgrade} onClose={() => setShowUpgrade(false)} title={t('choosePlan')}>
        <div className="space-y-4 p-2">
          <Card className="p-4 border-blue-200">
            <h3 className="font-bold text-slate-800">{t('planBasic')}</h3>
            <p className="text-2xl font-black text-blue-600 mt-1">{t('planBasicPrice')}<span className="text-sm font-normal text-slate-400">{t('planBasicPerMonth')}</span></p>
            <ul className="text-xs text-slate-500 mt-3 space-y-1">
              <li>✓ {t('planBasicUnlimited')}</li>
              <li>✓ {t('planBasicCompliance')}</li>
              <li>✓ {t('planBasicPdf')}</li>
            </ul>
          </Card>
          <Card className="p-4 border-blue-400 bg-blue-50/50">
            <h3 className="font-bold text-slate-800">{t('planPro')}</h3>
            <p className="text-2xl font-black text-blue-600 mt-1">{t('planProPrice')}<span className="text-sm font-normal text-slate-400">{t('planProPerMonth')}</span></p>
            <ul className="text-xs text-slate-500 mt-3 space-y-1">
              <li>✓ {t('planProEverything')}</li>
              <li>✓ {t('planProStats')}</li>
              <li>✓ {t('planProExport')}</li>
            </ul>
          </Card>
          <Button className="w-full" onClick={() => setShowUpgrade(false)}>{t('subscribeSoon')}</Button>
        </div>
      </Modal>
    </>
  );
}
