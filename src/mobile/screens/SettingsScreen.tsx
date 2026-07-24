'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, LogOut, Building, Users, Trash2, Bug, ChevronRight, Info, Smartphone, Shield } from 'lucide-react';
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
    <div className="rounded-xl border border-[#E8E1CE] bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F4F6FA]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A6B52]/5 text-[#2A6B52]">
          <Icon size={16} />
        </div>
        <span className="text-sm font-bold text-[#2A6B52]">{title}</span>
      </div>
      {children}
    </div>
  );

  const Row = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={cn('flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[#FBF8F2] border-b border-[#F4F6FA] last:border-0', className)}
    >
      {children}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-dvh bg-[#F4F6FA] pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#E8E1CE]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-[#D6B462] via-[#B5402C] to-[#2A6B52]" />
        <div className="px-4 py-3">
          <h1 className="text-lg font-extrabold text-[#2A6B52]">{t('settings.title')}</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Account */}
        <Section icon={Info} title={t('settings.accountType')}>
          <Row>
            <div>
              <span className="text-sm text-[#4A5268]">{t('settings.accountTypeHint')}</span>
              <div className="mt-0.5 text-sm font-bold text-[#2A6B52]">
                {locale === 'ar' ? 'حرفي' : locale === 'en' ? 'Artisan' : 'Artisan'}
              </div>
            </div>
          </Row>
        </Section>

        {/* Language */}
        <Section icon={Globe} title={t('settings.language')}>
          {languages.map((lang) => (
            <Row key={lang.code} onClick={() => setLocale(lang.code)}>
              <span className="text-sm text-[#4A5268]">{lang.label}</span>
              {locale === lang.code && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2A6B52]">
                  <svg width="10" height="8" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </Row>
          ))}
        </Section>

        {/* Company */}
        <Section icon={Building} title={t('settings.company')}>
          <Row>
            <span className="text-sm text-[#4A5268]">{t('settings.company')}</span>
            <ChevronRight size={16} className="text-[#9AA1B4]" />
          </Row>
        </Section>

        {/* Support */}
        <Section icon={Bug} title={t('settings.support')}>
          <Row>
            <span className="text-sm text-[#4A5268]">{t('settings.supportHint')}</span>
            <ChevronRight size={16} className="text-[#9AA1B4]" />
          </Row>
        </Section>

        {/* Full site */}
        <Section icon={Smartphone} title={t('settings.fullSite')}>
          <Row onClick={() => { window.location.href = '/dashboard'; }}>
            <span className="text-sm text-[#4A5268]">{t('settings.fullSiteHint')}</span>
            <ChevronRight size={16} className="text-[#9AA1B4]" />
          </Row>
        </Section>

        {/* Version */}
        <div className="text-center text-xs text-[#9AA1B4]">
          {t('settings.version')} 1.2.0
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full rounded-xl border border-[#B5402C]/30 bg-[#B5402C]/5 py-3.5 text-sm font-bold text-[#B5402C] transition-all hover:bg-[#B5402C]/10 active:scale-[0.99] disabled:opacity-50"
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut size={16} />
            {loggingOut ? t('settings.loggingOut') : t('settings.logout')}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
