'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PLANS, PLAN_ORDER, formatPrice } from '@/lib/pricing';
import { Check, ChevronDown, X } from 'lucide-react';

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

const COMPARISON_SECTIONS = [
  { title: 'Documents', keys: ['documentsMonth', 'templates'] },
  { title: 'PDF', keys: ['pdfExport', 'noWatermark'] },
  { title: 'Équipe', keys: ['teamMembers'] },
  { title: 'Rapports', keys: ['reports'] },
];

export default function PricingPage() {
  const t = useTranslations('pricing');
  const tc = useTranslations('common');
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openCompSection, setOpenCompSection] = useState<string | null>(null);

  const displayPlans = PLAN_ORDER.filter(id => id !== 'enterprise');

  function renderCheck(val: boolean | string) {
    if (typeof val === 'boolean') {
      return val ? <Check size={16} className="text-emerald-500 shrink-0" /> : <X size={16} className="text-slate-300 shrink-0" />;
    }
    return <span className="text-sm text-slate-700 font-medium">{val}</span>;
  }

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 items-stretch">
            {displayPlans.map(id => {
              const plan = PLANS[id];
              if (!plan) return null;
              const nameKey = id === 'free' ? 'freePlanName' : id === 'standard' ? 'standardPlanName' : id === 'pro' ? 'proPlanName' : 'maxPlanName';
              const tName = t(nameKey as string);
              return (
                <Card key={id} className={cn('relative flex flex-col', plan.highlighted && 'border-blue-500 shadow-lg shadow-blue-100/50 md:scale-[1.02]')}>
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
                      <Check size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-slate-600">
                        {plan.limits.docsPerMonth === 'unlimited' ? (t('maxDocs') || 'Illimité') : ((t('standardDocs') || '').replace('50', String(plan.limits.docsPerMonth)) || `${plan.limits.docsPerMonth} docs`)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-slate-600">{plan.limits.teamMembers} {plan.limits.teamMembers > 1 ? 'utilisateurs' : 'utilisateur'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-slate-600">{plan.limits.storageMB >= 1024 ? `${plan.limits.storageMB / 1024} Go` : `${plan.limits.storageMB} Mo`}</span>
                    </li>
                  </ul>
                  <Button
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    className="w-full min-h-[44px]"
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
              <Button variant="secondary" className="mt-3 min-h-[44px]" onClick={() => router.push('/enterprise')}>
                {t('enterpriseCtaBtn')}
              </Button>
            </Card>
          </div>
        </section>

        {/* Comparison — table on desktop, accordion on mobile */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-8">
            {t('comparisonTitle')}
          </h2>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
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
                    <td className="py-3 pr-4 text-sm text-slate-600">{t(row.key as string)}</td>
                    {(['free', 'standard', 'pro', 'max'] as const).map(col => (
                      <td key={col} className="py-3 px-4 text-center">
                        {renderCheck(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile accordion */}
          <div className="md:hidden space-y-2">
            {COMPARISON_SECTIONS.map(section => (
              <div key={section.title} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenCompSection(openCompSection === section.title ? null : section.title)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left min-h-[44px]"
                >
                  <span className="text-sm font-semibold text-slate-800">{section.title}</span>
                  <ChevronDown size={16} className={cn('text-slate-400 transition-transform shrink-0', openCompSection === section.title && 'rotate-180')} />
                </button>
                {openCompSection === section.title && (
                  <div className="px-4 pb-3 space-y-2">
                    {section.keys.map(key => {
                      const row = COMPARISON_FEATURES.find(r => r.key === key);
                      if (!row) return null;
                      return (
                        <div key={key} className="flex items-center justify-between py-2 border-t border-slate-100 first:border-0">
                          <span className="text-xs text-slate-600">{t(row.key as string)}</span>
                          <div className="flex items-center gap-3">
                            {(['free', 'standard', 'pro', 'max'] as const).map(col => (
                              <div key={col} className="w-12 text-center" title={t(`${col}PlanName` as string)}>
                                {renderCheck(row[col])}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 w-12">Free</span>
                      <span className="text-[10px] text-blue-600 w-12 text-center">Std</span>
                      <span className="text-[10px] text-slate-700 w-12 text-center">Pro</span>
                      <span className="text-[10px] text-slate-700 w-12 text-center">Max</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
                  className="w-full flex items-center justify-between px-5 py-4 text-left min-h-[44px]"
                >
                  <span className="text-sm font-semibold text-slate-800">{t(item.q as string)}</span>
                  <ChevronDown
                    className={cn('w-4 h-4 text-slate-400 transition-transform shrink-0 ml-4', openFaq === i && 'rotate-180')}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-500 leading-relaxed">{t(item.a as string)}</p>
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
