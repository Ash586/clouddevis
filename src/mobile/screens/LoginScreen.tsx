'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/mobile/lib/api';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface LoginScreenProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  onBackToWelcome: () => void;
}

export function LoginScreen({ onLogin, onBackToWelcome }: LoginScreenProps) {
  const { t } = useMobileI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(t('login.error.fillAll'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogin(email.trim(), password, rememberMe);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError(t('login.error.invalid'));
        else if (err.status === 429) setError(t('login.error.rateLimit'));
        else if (err.status === 403) setError(t('login.error.suspended'));
        else setError(t('login.error.server'));
      } else {
        setError(t('login.error.network'));
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, onLogin, t]);

  const inputCls = 'w-full rounded-lg border border-[rgba(0,26,77,0.08)] bg-[#F0F4FF] px-3.5 py-2.5 text-sm text-[#001A4D] placeholder-[#718096] transition-all duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15';
  const labelCls = 'block text-xs font-bold text-[#4A5568]';

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#0052CC] via-[#001A4D] to-[#0052CC] p-5"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={onBackToWelcome}
          className="mb-4 flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/30 rounded"
        >
          <ArrowLeft size={14} />
          {t('welcome.login')}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
      >
        <svg width="30" height="30" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <rect x="148" y="110" width="200" height="260" rx="18" fill="rgba(255,255,255,0.9)"/>
          <circle cx="338" cy="338" r="44" fill="#D4A843"/>
          <path d="M318 338 L330 350 L360 322" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-5 text-center text-xl font-black text-white"
      >
        Rakmana
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
        noValidate
      >
        {error && (
          <div className="mb-3 rounded-lg border border-[#DC3545]/30 bg-[#DC3545]/8 p-2.5 text-xs font-medium text-[#DC3545]" role="alert">
            {error}
          </div>
        )}

        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0052CC]/8 text-[#0052CC]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>

        <h2 className="mb-4 text-base font-extrabold text-[#0052CC]">
          {t('login.title')}
        </h2>

        <div className="space-y-1">
          <label htmlFor="login-email" className={labelCls}>{t('login.email')}</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            disabled={loading}
            dir="ltr"
            className={cn(inputCls, 'disabled:opacity-50')}
          />
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className={labelCls}>{t('login.password')}</label>
            <button type="button" className="text-[10px] font-bold text-[#718096] hover:text-[#DC3545] transition-colors duration-150">
              {t('login.forgotPassword')}
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={Array(8).fill('\u2022').join('')}
              disabled={loading}
              dir="ltr"
              className={cn(inputCls, 'pr-9 disabled:opacity-50')}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#0052CC]/30 rounded"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <label className="mt-3 flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setRememberMe((v) => !v)}
            role="checkbox"
            aria-checked={rememberMe}
            tabIndex={0}
            className={cn(
              'flex h-4.5 w-4.5 items-center justify-center rounded border transition-all duration-150',
              rememberMe
                ? 'border-[#0052CC] bg-[#0052CC]'
                : 'border-[rgba(0,26,77,0.15)] bg-white hover:border-[#0052CC]/50',
            )}
          >
            {rememberMe && (
              <svg width="9" height="7" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-xs text-[#4A5568]">{t('login.rememberMe')}</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-[#0052CC] py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] hover:shadow-md disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0052CC]/40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {t('login.loading')}
            </span>
          ) : t('login.button')}
        </button>
      </motion.form>

      <p className="mt-4 text-[10px] text-white/40">
        Rakmana \u00b7 DGI Algeria
      </p>
    </div>
  );
}
