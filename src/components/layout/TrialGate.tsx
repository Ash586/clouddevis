'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useUser } from '@/hooks/useUser';
import { SUBSCRIPTIONS_ENABLED } from '@/lib/features';
import { PLANS, PLAN_ORDER, formatPrice } from '@/lib/pricing';

export function TrialGate({ children }: { children: React.ReactNode }) {
  const s = useTranslations('subscription');
  const { showToast } = useToast();
  const { user, loading } = useUser();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 503) { showToast(json.note || 'Bientôt disponible', 'info'); setSubscribing(null); return; }
        throw new Error(json.error);
      }
      if (!json.url) { showToast('Erreur de redirection', 'error'); setSubscribing(null); return; }
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = json.url;
    } catch (err: unknown) {
      showToast(String((err instanceof Error ? err.message : null) ?? err ?? 'Erreur'), 'error');
    }
    setSubscribing(null);
  };

  // Subscriptions disabled during development → everyone has full free access.
  if (!SUBSCRIPTIONS_ENABLED) return <>{children}</>;

  if (loading) return null;
  if (!user) return <>{children}</>;

  const isTrial = user.subscriptionStatus === 'TRIAL';
  const isFree = user.subscriptionStatus === 'FREE' || user.subscriptionStatus === 'EXPIRED';

  const trialEndDate = user.trialStartAt
    ? new Date(new Date(user.trialStartAt).getTime() + 7 * 86400000)
    : null;
  const trialEndDateStr = trialEndDate
    ? trialEndDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;
  const trialDaysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / 86400000))
    : 7;

  return (
    <>
      {isTrial ? (
        <>{children}</>
      ) : isFree ? (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <Card className="max-w-sm p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-lg font-bold text-[var(--sand)] mb-2">{s('accessLimited') || 'Accès limité'}</h2>
            <p className="text-sm text-[var(--sand-muted)] mb-6">{s('trialExpired') || 'Votre période d\'essai a expiré. Choisissez un forfait pour continuer.'}</p>
            <Button onClick={() => setShowUpgrade(true)}>{s('seePlans') || 'Voir les offres'}</Button>
          </Card>
        </div>
      ) : (
        <>{children}</>
      )}

      <Modal open={showUpgrade} onClose={() => setShowUpgrade(false)} title={s('choosePlan') || 'Choisissez votre offre'}>
        <div className="space-y-3 p-2 max-h-[60vh] overflow-y-auto">
          {PLAN_ORDER.filter(id => id !== 'enterprise').map(id => {
            const plan = PLANS[id];
            return (
              <Card key={id} className={`p-4 cursor-pointer hover:ring-2 hover:ring-[var(--green-glow)] transition ${plan.highlighted ? 'border-[var(--green-2)] bg-[rgba(37,99,235,0.05)] ring-2 ring-[rgba(37,99,235,0.15)]' : 'border-[rgba(15,39,71,0.08)]'}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[var(--sand)] text-sm">{plan.name.fr}</h3>
                  {plan.highlighted && <span className="text-[10px] font-bold text-[var(--green-3)] bg-[var(--green-glow)] px-2 py-0.5 rounded-full">{s('popular') || 'Populaire'}</span>}
                </div>
                <p className="text-2xl font-black text-[var(--green-3)] mt-1">{formatPrice(plan.price)}<span className="text-sm font-normal text-[var(--sand-muted)]"> {s('perMonth') || '/mois'}</span></p>
                <ul className="text-[11px] text-[var(--sand-muted)] mt-2 space-y-1">
                  {(plan.limits.docsPerMonth === 'unlimited'
                    ? [s('unlimitedDocs') || 'Documents illimités']
                    : [s('docsLimit', { count: plan.limits.docsPerMonth }) || `${plan.limits.docsPerMonth} documents/mois`]
                  ).map((l, i) => <li key={i}>✓ {l}</li>)}
                  <li>✓ {s('teamLimit', { count: plan.limits.teamMembers }) || `${plan.limits.teamMembers} utilisateurs`}</li>
                  <li>✓ {s('storageLimit', { mb: plan.limits.storageMB >= 1024 ? `${plan.limits.storageMB / 1024} Go` : `${plan.limits.storageMB} Mo` }) || ''}</li>
                  <li>✓ {s('support_' + plan.limits.support) || plan.limits.support}</li>
                </ul>
                {id !== 'free' && (
                  <Button size="sm" className="mt-3 w-full" onClick={() => handleSubscribe(id)} disabled={subscribing === id}>
                    {subscribing === id ? '...' : (s('subscribe') || 'Souscrire')}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
