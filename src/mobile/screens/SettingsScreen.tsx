'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, LogOut, Building, Trash2, Bug, ChevronRight, Info, Smartphone } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import type { MobileLocale } from '@/stores/userStore';

interface SettingsScreenProps {
  onLogout: () => void;
}

export function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const { t, locale } = useMobileI18n();
  const setLocale = useUserStore((s) => s.setLocale);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await onLogout();
  };

  const languages: { code: MobileLocale; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
  ];

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[#F5F7FA]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0052CC]/8 text-[#0052CC]">
          <Icon size={14} />
        </div>
        <span className="text-xs font-bold text-[#0052CC]">{title}</span>
      </div>
      {children}
    </div>
  );

  const Row = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={cn('flex w-full items-center justify-between px-3.5 py-3 text-left transition-colors duration-150 hover:bg-[#E6F0FF] border-b border-[#F5F7FA] last:border-0', className)}
    >
      {children}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-dvh bg-[#F8FAFD] pb-24"
    >
      <div className="sticky z-10 bg-white/95 backdrop-blur border-b border-[rgba(0,26,77,0.06)]" style={{ top: 'var(--sat, env(safe-area-inset-top, 0px))' }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#001A4D] via-[#0052CC] to-[#001A4D]" />
        <div className="px-4 py-2.5">
          <h1 className="text-base font-extrabold text-[#001A4D]">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <Section icon={Info} title={t('settings.accountType')}>
          <Row>
            <div>
              <span className="text-xs text-[#718096]">{t('settings.accountTypeHint')}</span>
              <div className="mt-0.5 text-xs font-bold text-[#001A4D]">
                {locale === 'ar' ? 'حرفي' : locale === 'en' ? 'Artisan' : 'Artisan'}
              </div>
            </div>
          </Row>
        </Section>

        <Section icon={Globe} title={t('settings.language')}>
          {languages.map((lang) => (
            <Row key={lang.code} onClick={() => setLocale(lang.code)}>
              <span className="text-xs text-[#4A5568]">{lang.label}</span>
              {locale === lang.code && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#0052CC]">
                  <svg width="9" height="7" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </Row>
          ))}
        </Section>

        <Section icon={Building} title={t('settings.company')}>
          <Row>
            <span className="text-xs text-[#4A5568]">{t('settings.company')}</span>
            <ChevronRight size={14} className="text-[#718096]" />
          </Row>
        </Section>

        <Section icon={Bug} title={t('settings.support')}>
          <Row>
            <span className="text-xs text-[#718096]">{t('settings.supportHint')}</span>
            <ChevronRight size={14} className="text-[#718096]" />
          </Row>
        </Section>

        <Section icon={Smartphone} title={t('settings.fullSite')}>
          <Row onClick={() => { window.location.href = '/dashboard'; }}>
            <span className="text-xs text-[#718096]">{t('settings.fullSiteHint')}</span>
            <ChevronRight size={14} className="text-[#718096]" />
          </Row>
        </Section>

        <div className="text-center text-[10px] text-[#718096]">
          {t('settings.version')} 1.2.0
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full rounded-xl border border-[#DC3545]/20 bg-[#DC3545]/5 py-3 text-xs font-bold text-[#DC3545] transition-all duration-200 hover:bg-[#DC3545]/10 active:scale-[0.99] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#DC3545]/30"
        >
          <span className="flex items-center justify-center gap-1.5">
            <LogOut size={14} />
            {loggingOut ? t('settings.loggingOut') : t('settings.logout')}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
