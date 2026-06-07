'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const FAQ_ITEMS = [
  { q: 'paymentMethods', a: 'paymentMethodsAnswer' },
  { q: 'cancelAnytime', a: 'cancelAnytimeAnswer' },
  { q: 'freeTrial', a: 'freeTrialAnswer' },
  { q: 'changePlan', a: 'changePlanAnswer' },
  { q: 'support', a: 'supportAnswer' },
];

const COMPARISON_FEATURES = [
  { key: 'documentsMonth', free: '5', basic: 'Illimité', pro: 'Illimité' },
  { key: 'templates', free: 'Basiques', basic: 'Tous', pro: 'Tous + Personnalisés' },
  { key: 'pdfExport', free: false, basic: true, pro: true },
  { key: 'noWatermark', free: false, basic: true, pro: true },
  { key: 'reports', free: false, basic: false, pro: true },
  { key: 'apiAccess', free: false, basic: false, pro: true },
  { key: 'phoneSupport', free: false, basic: false, pro: true },
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

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? <CheckIcon /> : <CrossIcon />;
  }
  return <span className="text-sm text-slate-700 font-medium">{value}</span>;
}

export default function PricingPage() {
  const t = useTranslations('pricing');
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: t('freePlanName'),
      price: t('freePlanPrice'),
      period: t('perMonth'),
      features: [
        t('freeDocs'),
        t('freeTemplates'),
        t('freeWatermark'),
        t('freeSupport'),
      ],
      cta: t('freeCta'),
      highlighted: false,
    },
    {
      name: t('basicPlanName'),
      price: t('basicPlanPrice'),
      period: t('perMonth'),
      features: [
        t('basicDocs'),
        t('basicNoWatermark'),
        t('basicPdf'),
        t('basicTemplates'),
        t('basicSupport'),
      ],
      cta: t('basicCta'),
      highlighted: true,
      badge: t('popularBadge'),
    },
    {
      name: t('proPlanName'),
      price: t('proPlanPrice'),
      period: t('perMonth'),
      features: [
        t('proEverything'),
        t('proReports'),
        t('proCustom'),
        t('proApi'),
        t('proSupport'),
      ],
      cta: t('proCta'),
      highlighted: false,
    },
  ];

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
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 items-start">
            {plans.map(plan => (
              <Card
                key={plan.name}
                className={cn(
                  'relative flex flex-col',
                  plan.highlighted && 'border-blue-500 shadow-lg shadow-blue-100/50 scale-[1.02]'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-400 ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => router.push('/auth/register')}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
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
                  <th className="py-3 px-4 text-sm font-semibold text-blue-600 text-center">{t('basicPlanName')}</th>
                  <th className="py-3 pl-4 text-sm font-semibold text-slate-900 text-center">{t('proPlanName')}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map(row => (
                  <tr key={row.key} className="border-b border-slate-100">
                    <td className="py-3 pr-4 text-sm text-slate-600">{t(row.key as any)}</td>
                    <td className="py-3 px-4 text-center"><FeatureCell value={row.free} /></td>
                    <td className="py-3 px-4 text-center"><FeatureCell value={row.basic} /></td>
                    <td className="py-3 pl-4 text-center"><FeatureCell value={row.pro} /></td>
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
              <p className="text-xs text-slate-400 mt-1">&copy; {new Date().getFullYear()} CloudDevis. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-xs text-slate-400">
              <span>Conforme aux normes alg&eacute;riennes</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
