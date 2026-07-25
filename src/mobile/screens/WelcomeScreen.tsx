'use client';

import { motion } from 'framer-motion';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function WelcomeScreen({ onLogin, onRegister }: WelcomeScreenProps) {
  const { t } = useMobileI18n();

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#0052CC] via-[#001A4D] to-[#0052CC] p-6"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-xl"
      >
        <svg width="48" height="48" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <rect x="148" y="110" width="200" height="260" rx="18" fill="rgba(255,255,255,0.9)"/>
          <path d="M298 110 L348 160 L298 160 Z" fill="rgba(255,255,255,0.3)"/>
          <rect x="173" y="190" width="120" height="8" rx="4" fill="rgba(0,82,204,0.6)"/>
          <rect x="173" y="214" width="80" height="6" rx="3" fill="rgba(0,82,204,0.3)"/>
          <rect x="173" y="238" width="100" height="6" rx="3" fill="rgba(0,82,204,0.3)"/>
          <rect x="173" y="290" width="140" height="1.5" rx="1" fill="rgba(0,82,204,0.15)"/>
          <rect x="173" y="308" width="140" height="28" rx="8" fill="rgba(0,82,204,0.1)"/>
          <circle cx="338" cy="338" r="52" fill="#D4A843"/>
          <circle cx="338" cy="338" r="44" fill="white"/>
          <path d="M318 338 L330 350 L360 322" stroke="#0052CC" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="mb-1.5 text-center text-2xl font-black text-white"
      >
        Rakmana
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="mb-8 text-center text-xs text-white/60"
      >
        {t('welcome.subtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="w-full max-w-sm space-y-2.5"
      >
        <button
          onClick={onLogin}
          className="w-full rounded-xl bg-white py-3 text-sm font-bold text-[#0052CC] shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {t('welcome.login')}
        </button>
        <button
          onClick={onRegister}
          className="w-full rounded-xl border-2 border-white/20 bg-white/10 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {t('welcome.register')}
        </button>
      </motion.div>

      <p className="mt-8 text-[10px] text-white/25">
        Rakmana \u00b7 DGI Algeria Compliant
      </p>
    </div>
  );
}
