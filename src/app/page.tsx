'use client';

import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const DemoEditor = lazy(() => import('@/components/editor/DemoEditor').then(m => ({ default: m.DemoEditor })));

const DEMO_KEY = 'clouddevis_demo_date';

function isDemoUsedToday(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_KEY) === new Date().toDateString();
}

function markDemoUsedToday() {
  localStorage.setItem(DEMO_KEY, new Date().toDateString());
}

export default function HomePage() {
  const t = useTranslations('home');
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleTryEditor = () => {
    if (mounted && isDemoUsedToday()) {
      setShowPaywall(true);
    } else {
      setShowEditor(true);
      setTimeout(() => editorRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleDownload = () => {
    if (isDemoUsedToday()) {
      setShowPaywall(true);
    } else {
      markDemoUsedToday();
      setShowSuccess(true);
    }
  };

  return (
    <>
      <Navbar />
      <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-12">
        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-4 sm:mb-6">
          🇩🇿 {t('heroBadge')}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4 sm:mb-6 px-2 sm:px-0">
          {t('heroTitle1')}<br />
          <span className="text-blue-600">{t('heroTitle2')}</span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2 sm:px-0">
          {t('heroSubtitle')}
        </p>
        <div className="flex justify-center">
          <Button size="lg" onClick={handleTryEditor}>
            {mounted && isDemoUsedToday() ? t('ctaTryNow') : t('ctaFree')}
          </Button>
        </div>
      </section>

      {showEditor && (
        <div ref={editorRef} className="max-w-6xl mx-auto px-4 h-[calc(100vh-16px)] overflow-hidden flex flex-col">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl flex-1 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('editorBannerTitle')}</p>
              </div>
              <span className="text-[9px] text-slate-500">{t('editorBannerSubtitle')}</span>
            </div>
            <div className="px-6 py-4 flex-1 overflow-hidden">
              <Suspense fallback={<div className="space-y-3"><Skeleton className="h-8 w-32" /><Skeleton className="h-64 w-full" /><Skeleton className="h-8 w-48" /></div>}>
                <DemoEditor onDownload={handleDownload} />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSuccess(false)} />
          <div className="relative bg-white sm:rounded-3xl rounded-t-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border animate-in sm:mx-4">
            <div className="flex justify-center sm:hidden pt-1 pb-2"><div className="w-10 h-1 rounded-full bg-slate-300" /></div>
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t('successTitle')}</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">{t('successBody')}</p>
            <Button variant="outline" className="w-full min-h-[44px]" onClick={() => setShowSuccess(false)}>
                {t('successContinue')}
              </Button>
          </div>
        </div>
      )}

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPaywall(false)} />
          <div className="relative bg-white sm:rounded-3xl rounded-t-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border animate-in sm:mx-4">
            <div className="flex justify-center sm:hidden pt-1 pb-2"><div className="w-10 h-1 rounded-full bg-slate-300" /></div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t('paywallTitle')}</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">{t('paywallBody')}</p>
            <div className="space-y-3">
              <Button className="w-full min-h-[44px]" onClick={() => { setShowPaywall(false); router.push('/auth/register'); }}>
                {t('paywallCTA')}
              </Button>
              <Button variant="ghost" className="w-full min-h-[44px]" onClick={() => setShowPaywall(false)}>
                {t('paywallLater')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {[
            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>, title: t('feature1Title'), desc: t('feature1Desc') },
            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>, title: t('feature2Title'), desc: t('feature2Desc') },
            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, title: t('feature3Title'), desc: t('feature3Desc') },
          ].map((f) => (
            <Card key={f.title} className="text-center p-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">{f.icon}</div>
              <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">{t('pricingTitle') || 'Des tarifs adaptés à votre activité'}</h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">{t('pricingSubtitle') || 'Commencez gratuitement, passez à une formule supérieure quand vous êtes prêt.'}</p>
        </div>
        <div className="text-center">
          <Button size="lg" onClick={() => router.push('/pricing')}>
            {t('viewPricing') || 'Voir les tarifs'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center sm:text-left">
              <span className="text-lg font-black text-blue-600 tracking-tight">CloudDevis</span>
              <p className="text-xs text-slate-400 mt-1">© {new Date().getFullYear()} CloudDevis. {t('footerRights')}</p>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Service</h3>
              <ul className="space-y-2">
                <li><a href="/pricing" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Tarifs</a></li>
                <li><a href="/auth/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Connexion</a></li>
                <li><a href="/auth/register" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Inscription</a></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Légal</h3>
              <ul className="space-y-2">
                <li><a href="/legal/cgu" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">CGU</a></li>
                <li><a href="/legal/privacy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Confidentialité</a></li>
                <li><a href="/legal/mentions" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Mentions Légales</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
