'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { TrialGate } from '@/components/layout/TrialGate';
import { useToast } from '@/components/ui/toast';
import { PLANS, PLAN_ORDER, formatPrice } from '@/lib/pricing';

interface SubscriptionData {
  status: string;
  plan: { id: string; name: { fr: string }; price: number; limits: { docsPerMonth: number | string; teamMembers: number; storageMB: number } };
  usage: { docsThisMonth: number; docsLimit: number | string; storageBytes: number; storageLimitMB: number };
  trialDaysRemaining: number;
  subscriptionEndAt: string | null;
}

export default function SubscriptionPage() {
  const t = useTranslations('subscription');
  const tc = useTranslations('common');
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
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
      window.location.href = json.url;
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    }
    setSubscribing(null);
  };

  useEffect(() => {
    fetch('/api/subscription')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-400">{tc('loading')}</div>
      </div>
    </>
  );

  const plan = data?.plan;
  const usage = data?.usage;
  const currentPlanId = data?.status === 'TRIAL' ? 'pro' : (data?.plan?.id || 'free');
  const statusBadge: Record<string, { variant: 'success' | 'info' | 'warning' | 'default'; label: string }> = {
    TRIAL: { variant: 'warning', label: t('statusTrial') || 'Essai' },
    FREE: { variant: 'default', label: t('statusFree') || 'Gratuit' },
    STANDARD: { variant: 'info', label: t('statusStandard') || 'Standard' },
    PRO: { variant: 'success', label: t('statusPro') || 'Pro' },
    MAX: { variant: 'success', label: t('statusMax') || 'Max' },
  };
  const badge = statusBadge[data?.status || 'FREE'] || { variant: 'default' as any, label: data?.status || 'FREE' };

  const pctUsed = usage?.docsLimit === 'unlimited' ? 0 : ((usage?.docsThisMonth || 0) / (usage?.docsLimit as number || 1)) * 100;

  function WiseTransferSection({ formatPrice: fp }: { formatPrice: (n: number) => string }) {
    const [wise, setWise] = useState<{ configured: boolean; beneficiary: string; iban: string; bic: string; bank: string; currency: string; instructions: string } | null>(null);
    useEffect(() => {
      fetch('/api/subscribe/wise').then(r => r.ok ? r.json() : null).then(setWise).catch(() => {});
    }, []);
    if (!wise?.configured) return null;
    return (
      <Card className="p-5 border-emerald-200 bg-emerald-50/30">
        <h3 className="font-bold text-slate-800 mb-2">💳 Paiement par virement Wise</h3>
        <p className="text-xs text-slate-500 mb-3">{wise.instructions}</p>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-xs space-y-1 text-slate-700">
          <p><span className="font-bold text-slate-500">Bénéficiaire :</span> {wise.beneficiary}</p>
          <p><span className="font-bold text-slate-500">IBAN :</span> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">{wise.iban}</code></p>
          {wise.bic && <p><span className="font-bold text-slate-500">BIC :</span> {wise.bic}</p>}
          <p><span className="font-bold text-slate-500">Banque :</span> {wise.bank}</p>
          <p><span className="font-bold text-slate-500">Devise :</span> {wise.currency}</p>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Envoyez le reçu du virement à support@clouddevis.io pour activation sous 24-48h.</p>
      </Card>
    );
  }

  return (
    <>
      <Navbar />
      <TrialGate>
      <div className="min-h-screen bg-[#f0f4f8] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Current Plan */}
          <Card className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-lg font-black text-slate-900">{t('mySubscription') || 'Mon abonnement'}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">
                    {plan?.name?.fr || currentPlanId}
                  </span>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              </div>
              {data?.status === 'TRIAL' && data?.trialDaysRemaining > 0 && (
                <div className="text-right">
                  <p className="text-xs text-amber-600 font-bold">{data.trialDaysRemaining} {t('daysLeft') || 'jours restants'}</p>
                </div>
              )}
            </div>

            {/* Usage bar */}
            {usage && usage.docsLimit !== 'unlimited' && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{t('docsUsed') || 'Documents utilisés'}</span>
                  <span>{usage.docsThisMonth} / {usage.docsLimit}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pctUsed > 80 ? 'bg-red-500' : pctUsed > 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(pctUsed, 100)}%` }} />
                </div>
              </div>
            )}

            {/* Storage & Team */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-lg font-black text-slate-900">{usage?.docsThisMonth || 0}</p>
                <p className="text-[10px] text-slate-500">{t('statDocs') || 'Documents'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-lg font-black text-slate-900">{plan?.limits?.teamMembers || 1}</p>
                <p className="text-[10px] text-slate-500">{t('teamLimit', { count: plan?.limits?.teamMembers || 1 }) || 'Utilisateurs'}</p>
              </div>
            </div>
          </Card>

          {/* All Plans */}
          <h2 className="text-sm font-bold text-slate-700">{t('choosePlan') || 'Choisissez votre offre'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLAN_ORDER.filter(id => id !== 'enterprise').map(id => {
              const p = PLANS[id];
              const isCurrent = currentPlanId === id;
              return (
                <Card key={id} className={`p-4 relative ${isCurrent ? 'ring-2 ring-blue-500 border-blue-500' : p.highlighted ? 'border-blue-300' : ''}`}>
                  {p.highlighted && !isCurrent && (
                    <span className="absolute -top-2 right-3 text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{t('popular') || 'Populaire'}</span>
                  )}
                  <h3 className="font-bold text-slate-800 text-sm">{p.name.fr}</h3>
                  <p className="text-xl font-black text-blue-600 mt-1">{formatPrice(p.price)}<span className="text-xs font-normal text-slate-400"> {t('perMonth') || '/mois'}</span></p>
                  <ul className="text-[11px] text-slate-500 mt-3 space-y-1">
                    <li>✓ {p.limits.docsPerMonth === 'unlimited' ? (t('unlimitedDocs') || 'Documents illimités') : (t('docsLimit', { count: p.limits.docsPerMonth }) || `${p.limits.docsPerMonth} docs`)}</li>
                    <li>✓ {t('teamLimit', { count: p.limits.teamMembers }) || `${p.limits.teamMembers} utilisateurs`}</li>
                    <li>✓ {p.limits.storageMB >= 1024 ? `${p.limits.storageMB / 1024} Go` : `${p.limits.storageMB} Mo`}</li>
                  </ul>
                  {isCurrent ? (
                    <Badge variant="info" className="mt-3 w-full justify-center">{t('currentPlan') || 'Plan actuel'}</Badge>
                  ) : (
                    <Button size="sm" className="mt-3 w-full" onClick={() => handleSubscribe(id)} disabled={subscribing === id}>
                      {subscribing === id ? '...' : (t('switchPlan') || 'Souscrire')}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Enterprise CTA */}
          <Card className="p-5 border-red-200 bg-red-50/30">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-slate-800">{t('enterpriseTitle') || 'Vous avez besoin de plus ?'}</h3>
                <p className="text-xs text-slate-500 mt-1">{t('enterpriseDesc') || 'Solution sur mesure pour les grandes organisations.'}</p>
              </div>
              <Button variant="secondary" onClick={() => router.push('/enterprise')}>
                {t('contactEnterprise') || 'Nous contacter'}
              </Button>
            </div>
          </Card>

          {/* Wise Transfer */}
          <WiseTransferSection formatPrice={formatPrice} />
        </div>
      </div>
      </TrialGate>
    </>
  );
}
