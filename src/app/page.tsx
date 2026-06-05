'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DemoEditor } from '@/components/editor/DemoEditor';

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
        <div ref={editorRef} className="max-w-6xl mx-auto px-4 min-h-screen flex flex-col">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl flex-1 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('editorBannerTitle')}</p>
              </div>
              <span className="text-[9px] text-slate-500">{t('editorBannerSubtitle')}</span>
            </div>
            <div className="px-6 py-4 flex-1 overflow-hidden">
              <DemoEditor onDownload={handleDownload} />
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSuccess(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border animate-in">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h3 className="text-2xl font-black text-slate-900">{t('successTitle')}</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">{t('successBody')}</p>
            <Button variant="outline" className="w-full" onClick={() => setShowSuccess(false)}>
                {t('successContinue')}
              </Button>
          </div>
        </div>
      )}

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPaywall(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border animate-in">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🔒</div>
            <h3 className="text-2xl font-black text-slate-900">{t('paywallTitle')}</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">{t('paywallBody')}</p>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => { setShowPaywall(false); router.push('/auth/register'); }}>
                {t('paywallCTA')}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowPaywall(false)}>
                {t('paywallLater')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {[
            { emoji: '⚡', title: t('feature1Title'), desc: t('feature1Desc') },
            { emoji: '🇩🇿', title: t('feature2Title'), desc: t('feature2Desc') },
            { emoji: '📄', title: t('feature3Title'), desc: t('feature3Desc') },
          ].map((f) => (
            <Card key={f.title} className="text-center p-6">
              <div className="text-2xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
