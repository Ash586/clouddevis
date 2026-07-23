'use client';

// ============================================================
// Rakmana Mobile — Welcome / Landing Screen
// Brand + two CTAs: Login and Create Account
// ============================================================

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
      className="min-h-screen flex flex-col items-center justify-center px-5 bg-[var(--navy)]"
      style={{ paddingTop: 'env(safe-area-inset-top, 24px)' }}
    >
      {/* ── Brand ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-12"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5 shadow-xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d3d24 0%, #0f5132 100%)' }}
        >
          <svg width="50" height="50" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <rect x="148" y="110" width="200" height="260" rx="18" fill="#22c55e"/>
            <path d="M298 110 L348 160 L298 160 Z" fill="rgba(0,0,0,0.18)"/>
            <rect x="173" y="190" width="120" height="8" rx="4" fill="rgba(255,255,255,0.9)"/>
            <rect x="173" y="214" width="80" height="6" rx="3" fill="rgba(255,255,255,0.5)"/>
            <rect x="173" y="238" width="100" height="6" rx="3" fill="rgba(255,255,255,0.5)"/>
            <rect x="173" y="290" width="140" height="1.5" rx="1" fill="rgba(255,255,255,0.2)"/>
            <rect x="173" y="308" width="140" height="28" rx="8" fill="rgba(255,255,255,0.12)"/>
            <circle cx="338" cy="338" r="52" fill="#0d3d24"/>
            <circle cx="338" cy="338" r="44" fill="#4ade80"/>
            <path d="M318 338 L330 350 L360 322" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-[var(--sand)]" style={{ fontFamily: 'serif' }}>
          {t('welcome.title')}
        </h1>
        <p className="text-base text-[var(--sand-muted)] mt-2 text-center max-w-[260px]">
          {t('welcome.subtitle')}
        </p>
      </motion.div>

      {/* ── CTA Buttons ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-sm space-y-3"
      >
        {/* Primary — Login */}
        <button
          onClick={onLogin}
          className="w-full py-4 rounded-xl text-base font-semibold text-white bg-[var(--green-2)] active:scale-[0.98] transition-transform"
        >
          {t('welcome.login')}
        </button>

        {/* Secondary — Register */}
        <button
          onClick={onRegister}
          className="w-full py-4 rounded-xl text-base font-semibold text-[var(--sand)] bg-[var(--navy-2)] border border-[var(--border)] active:scale-[0.98] transition-transform"
        >
          {t('welcome.register')}
        </button>
      </motion.div>

      {/* Footer */}
      <p className="mt-12 text-[11px] text-[var(--sand-muted)]/50">
        Rakmana · DGI Algeria Compliant
      </p>
    </div>
  );
}
