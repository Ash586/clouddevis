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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#2A6B52] via-[#1C5E42] to-[#2A6B52] p-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-xl"
      >
        <svg width="56" height="56" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <rect x="148" y="110" width="200" height="260" rx="18" fill="rgba(255,255,255,0.9)"/>
          <path d="M298 110 L348 160 L298 160 Z" fill="rgba(255,255,255,0.3)"/>
          <rect x="173" y="190" width="120" height="8" rx="4" fill="rgba(42,107,82,0.6)"/>
          <rect x="173" y="214" width="80" height="6" rx="3" fill="rgba(42,107,82,0.3)"/>
          <rect x="173" y="238" width="100" height="6" rx="3" fill="rgba(42,107,82,0.3)"/>
          <rect x="173" y="290" width="140" height="1.5" rx="1" fill="rgba(42,107,82,0.15)"/>
          <rect x="173" y="308" width="140" height="28" rx="8" fill="rgba(42,107,82,0.1)"/>
          <circle cx="338" cy="338" r="52" fill="#D6B462"/>
          <circle cx="338" cy="338" r="44" fill="white"/>
          <path d="M318 338 L330 350 L360 322" stroke="#2A6B52" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </motion.div>

      {/* Brand */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-2 text-center text-3xl font-black text-white"
      >
        Rakmana
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-10 text-center text-sm text-white/70"
      >
        {t('welcome.subtitle')}
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-sm space-y-3"
      >
        <button
          onClick={onLogin}
          className="w-full rounded-xl bg-white py-3.5 text-base font-bold text-[#2A6B52] shadow-lg transition-all hover:bg-white/90 active:scale-[0.98]"
        >
          {t('welcome.login')}
        </button>
        <button
          onClick={onRegister}
          className="w-full rounded-xl border-2 border-white/25 bg-white/10 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.98]"
        >
          {t('welcome.register')}
        </button>
      </motion.div>

      {/* Footer */}
      <p className="mt-10 text-[11px] text-white/30">
        Rakmana · DGI Algeria Compliant
      </p>
    </div>
  );
}
