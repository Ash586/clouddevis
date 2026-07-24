'use client';

import { useState } from 'react';
import { Globe, Building2, FileText, Trash2, LogOut, Moon, Smartphone, ChevronRight } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { useUserStore, type MobileLocale } from '@/stores/userStore';

interface SettingsScreenProps {
  onNavigate?: (target: string) => void;
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { t, dir } = useMobileI18n();
  const { logout } = useAuthGuard();
  const mode = useUserStore((s) => s.mode);
  const locale = useUserStore((s) => s.locale);
  const setLocale = useUserStore((s) => s.setLocale);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const handleClearData = async () => {
    localStorage.clear();
    setShowClearConfirm(false);
    await logout();
  };

  const LOCALES: { key: MobileLocale; label: string; flag: string }[] = [
    { key: 'fr', label: 'Français', flag: '🇫🇷' },
    { key: 'ar', label: 'العربية', flag: '🇩🇿' },
    { key: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div dir={dir} className="min-h-dvh bg-[#F3F6FC] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(15,39,71,0.08)] px-5 py-4">
        <h1 className="text-lg font-extrabold text-[#0F2747]">{t('settings.title')}</h1>
      </div>

      <main className="px-5 pt-5 max-w-lg mx-auto space-y-4">
        {/* Account type */}
        <div className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(37,99,235,0.1)] flex items-center justify-center">
              <Smartphone size={18} className="text-[#2563EB]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0F2747]">{t('settings.accountType')}</p>
              <p className="text-[11px] text-[#5A6B85]">{t('settings.accountTypeHint')}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${mode === 'entreprise' ? 'bg-[rgba(37,99,235,0.1)] text-[#2563EB]' : 'bg-amber-400/10 text-amber-600'}`}>
              {mode === 'entreprise' ? t('settings.modeEntreprise') : t('settings.modeArtisan')}
            </span>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDF2FB] flex items-center justify-center">
              <Globe size={18} className="text-[#5A6B85]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0F2747]">{t('settings.language')}</p>
            </div>
          </div>
          <div className="border-t border-[rgba(15,39,71,0.06)]">
            {LOCALES.map((l) => (
              <button key={l.key} type="button" onClick={() => setLocale(l.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#EDF2FB] ${locale === l.key ? 'font-bold text-[#2563EB] bg-[rgba(37,99,235,0.04)]' : 'text-[#0F2747]'}`}>
                <span className="text-base">{l.flag}</span>
                <span className="flex-1 text-start">{l.label}</span>
                {locale === l.key && <span className="text-[#2563EB] text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Company */}
        <button type="button" onClick={() => onNavigate?.('company')}
          className="w-full rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4 flex items-center gap-3 hover:bg-[#EDF2FB] transition text-start">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Building2 size={18} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0F2747]">{t('settings.company')}</p>
          </div>
          <ChevronRight size={16} className="text-[#5A6B85]" />
        </button>

        {/* Clear data */}
        <button type="button" onClick={() => setShowClearConfirm(true)}
          className="w-full rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4 flex items-center gap-3 hover:bg-[#EDF2FB] transition text-start">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0F2747]">{t('settings.clearData')}</p>
          </div>
          <ChevronRight size={16} className="text-[#5A6B85]" />
        </button>

        {/* Logout */}
        <button type="button" onClick={handleLogout} disabled={loggingOut}
          className="w-full rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4 flex items-center gap-3 hover:bg-red-50 transition text-start disabled:opacity-50">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <LogOut size={18} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-600">{loggingOut ? t('settings.loggingOut') : t('settings.logout')}</p>
          </div>
        </button>

        {/* Version */}
        <p className="text-center text-[11px] text-[#5A6B85] pt-4">{t('settings.version')} — v1.1.0</p>
      </main>

      {/* Clear confirm bottom sheet */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom">
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-[#0F2747] text-center mb-1">{t('settings.clearConfirmTitle')}</p>
            <p className="text-xs text-[#5A6B85] text-center mb-5">{t('settings.clearConfirmBody')}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 rounded-xl border border-[rgba(15,39,71,0.1)] text-sm font-bold text-[#0F2747] hover:bg-[#EDF2FB] transition">
                {t('settings.cancel')}
              </button>
              <button type="button" onClick={handleClearData} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition">
                {t('settings.deleteAll')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
