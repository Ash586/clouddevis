'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PLANS, PLAN_ORDER, formatPrice } from '@/lib/pricing';

const FAQ_ITEMS = [
  { q: 'paymentMethods', a: 'paymentMethodsAnswer' },
  { q: 'cancelAnytime', a: 'cancelAnytimeAnswer' },
  { q: 'freeTrial', a: 'freeTrialAnswer' },
  { q: 'changePlan', a: 'changePlanAnswer' },
  { q: 'support', a: 'supportAnswer' },
];

const COMPARISON_FEATURES = [
  { key: 'documentsMonth', free: '5', standard: '50', pro: 'Illimité', max: 'Illimité' },
  { key: 'templates', free: 'Basiques', standard: 'Tous', pro: 'Tous', max: 'Personnalisés' },
  { key: 'pdfExport', free: false, standard: true, pro: true, max: true },
  { key: 'noWatermark', free: false, standard: true, pro: true, max: true },
  { key: 'teamMembers', free: '1', standard: '2', pro: '5', max: '15' },
  { key: 'reports', free: false, standard: false, pro: true, max: true },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function PricingPage() {
  const t = useTranslations('pricing');
  const tc = useTranslations('common');
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const displayPlans = PLAN_ORDER.filter(id => id !== 'enterprise');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="text-center px-4 pt-12 sm:pt-20 pb-8 sm:pb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">
            {t('heroSubtitle')}
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid md:grid-cols-4 gap-3 sm:gap-4 items-stretch">
            {displayPlans.map(id => {
              const plan = PLANS[id];
              const nameKey = id === 'free' ? 'freePlanName' : id === 'standard' ? 'standardPlanName' : id === 'pro' ? 'proPlanName' : 'maxPlanName';
              const tName = t(nameKey as any);
              return (
                <Card key={id} className={cn('relative flex flex-col', plan.highlighted && 'border-blue-500 shadow-lg shadow-blue-100/50 scale-[1.02]')}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {t('popularBadge')}
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-4 pt-2">
                    <h3 className="text-base font-bold text-slate-900">{tName}</h3>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">{formatPrice(plan.price)}</span>
                      <span className="text-xs text-slate-400 ml-1">{t('perMonth')}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{plan.description.fr}</p>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1 text-xs">
                    <li className="flex items-start gap-2">
                      <CheckIcon />
                      <span className="text-slate-600">
                        {plan.limits.docsPerMonth === 'unlimited' ? (t('maxDocs') || 'Illimité') : (t('standardDocs').replace('50', String(plan.limits.docsPerMonth)) || `${plan.limits.docsPerMonth} docs`)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon />
                      <span className="text-slate-600">{plan.limits.teamMembers} {plan.limits.teamMembers > 1 ? 'utilisateurs' : 'utilisateur'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon />
                      <span className="text-slate-600">{plan.limits.storageMB >= 1024 ? `${plan.limits.storageMB / 1024} Go` : `${plan.limits.storageMB} Mo`}</span>
                    </li>
                  </ul>
                  <Button
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => router.push('/auth/register')}
                  >
                    {t('freeCta')}
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Enterprise CTA */}
          <div className="mt-6">
            <Card className="p-5 border-red-200 bg-red-50/30 text-center">
              <h3 className="font-bold text-slate-800">{t('enterpriseCta')}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Solution sur mesure pour les grandes organisations avec support dédié 24/7.</p>
              <Button variant="secondary" className="mt-3" onClick={() => router.push('/enterprise')}>
                {t('enterpriseCtaBtn')}
              </Button>
            </Card>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-8">
            {t('comparisonTitle')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 text-sm font-semibold text-slate-500">{t('feature')}</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900 text-center">{t('freePlanName')}</th>
                  <th className="py-3 px-4 text-sm font-semibold text-blue-600 text-center">{t('standardPlanName')}</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900 text-center">{t('proPlanName')}</th>
                  <th className="py-3 pl-4 text-sm font-semibold text-slate-900 text-center">{t('maxPlanName')}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map(row => (
                  <tr key={row.key} className="border-b border-slate-100">
                    <td className="py-3 pr-4 text-sm text-slate-600">{t(row.key as any)}</td>
                    {(['free', 'standard', 'pro', 'max'] as const).map(col => {
                      const val = row[col];
                      return (
                        <td key={col} className="py-3 px-4 text-center">
                          {typeof val === 'boolean'
                            ? (val ? <CheckIcon /> : <CrossIcon />)
                            : <span className="text-sm text-slate-700 font-medium">{val}</span>
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-8">
            {t('faqTitle')}
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <Card key={i} className="!p-0 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800">{t(item.q as any)}</span>
                  <svg
                    className={cn('w-4 h-4 text-slate-400 transition-transform shrink-0 ml-4', openFaq === i && 'rotate-180')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-500 leading-relaxed">{t(item.a as any)}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-lg font-black text-blue-600 tracking-tight">CloudDevis</span>
              <p className="text-xs text-slate-400 mt-1">&copy; {new Date().getFullYear()} CloudDevis. {tc('footer.allRightsReserved')}</p>
            </div>
            <div className="flex gap-6 text-xs text-slate-400">
              <span>{tc('footer.algerianCompliance')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
