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
        <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="22" fill="rgba(255,255,255,0.95)"/>
          <text x="50" y="68" fontSize="54" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle" fill="#0052CC">R</text>
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
          className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-[#0052CC] shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {t('welcome.login')}
        </button>
        <button
          onClick={onRegister}
          className="w-full rounded-2xl border-2 border-white/20 bg-white/10 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {t('welcome.register')}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8 w-full max-w-sm"
      >
        <svg viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full opacity-[0.12]">
          <rect x="40" y="10" width="120" height="80" rx="8" fill="white"/>
          <rect x="52" y="24" width="60" height="5" rx="2.5" fill="#0052CC"/>
          <rect x="52" y="35" width="40" height="3.5" rx="1.75" fill="#0052CC" opacity="0.5"/>
          <rect x="52" y="44" width="85" height="1" rx="0.5" fill="#0052CC" opacity="0.25"/>
          <rect x="52" y="52" width="85" height="1" rx="0.5" fill="#0052CC" opacity="0.25"/>
          <rect x="52" y="60" width="85" height="1" rx="0.5" fill="#0052CC" opacity="0.25"/>
          <rect x="52" y="70" width="50" height="3.5" rx="1.75" fill="#D4A843" opacity="0.7"/>
          <rect x="180" y="15" width="100" height="70" rx="8" fill="white"/>
          <rect x="192" y="28" width="50" height="4" rx="2" fill="#0052CC"/>
          <rect x="192" y="38" width="70" height="1" rx="0.5" fill="#0052CC" opacity="0.25"/>
          <rect x="192" y="45" width="70" height="1" rx="0.5" fill="#0052CC" opacity="0.25"/>
          <rect x="192" y="52" width="70" height="1" rx="0.5" fill="#0052CC" opacity="0.25"/>
          <rect x="192" y="62" width="35" height="3" rx="1.5" fill="#D4A843" opacity="0.7"/>
        </svg>
      </motion.div>

      <p className="mt-4 text-[10px] text-white/25">
        Rakmana v1.0 \u00b7 DGI Algeria
      </p>
    </div>
  );
}
