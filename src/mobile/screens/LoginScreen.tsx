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
  onGoToRegister: () => void;
}

export function LoginScreen({ onLogin, onBackToWelcome, onGoToRegister }: LoginScreenProps) {
  const { t } = useMobileI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateFields = useCallback(() => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = t('login.error.emailRequired');
    if (!password) errs.password = t('login.error.passwordRequired');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [email, password, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
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
  }, [email, password, rememberMe, onLogin, t, validateFields]);

  const inputCls = 'w-full rounded-xl border border-[rgba(0,26,77,0.08)] bg-[#F0F4FF] px-4 py-3 text-sm text-[#001A4D] placeholder-[#718096] transition-all duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15';
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
        {t('login.title')}
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
          <div className="mb-3 rounded-xl border border-[#DC3545]/30 bg-[#DC3545]/8 p-2.5 text-xs font-medium text-[#DC3545]" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="login-email" className={labelCls}>{t('login.email')}</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="vous@exemple.com"
            disabled={loading}
            dir="ltr"
            className={cn(inputCls, 'disabled:opacity-50', fieldErrors.email && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
          />
          {fieldErrors.email && (
            <p className="text-[11px] font-medium text-[#DC3545] mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className={labelCls}>{t('login.password')}</label>
            <button type="button" className="text-[10px] font-bold text-[#718096] hover:text-[#0052CC] transition-colors duration-150">
              {t('login.forgotPassword')}
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
              placeholder={Array(8).fill('\u2022').join('')}
              disabled={loading}
              dir="ltr"
              className={cn(inputCls, 'pr-10 disabled:opacity-50', fieldErrors.password && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#0052CC]/30 rounded"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-[11px] font-medium text-[#DC3545] mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <label className="mt-3 flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setRememberMe((v) => !v)}
            role="checkbox"
            aria-checked={rememberMe}
            tabIndex={0}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150',
              rememberMe
                ? 'border-[#0052CC] bg-[#0052CC]'
                : 'border-[rgba(0,26,77,0.15)] bg-white hover:border-[#0052CC]/50',
            )}
          >
            {rememberMe && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-xs text-[#4A5568]">{t('login.rememberMe')}</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-[#0052CC] py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] hover:shadow-md disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0052CC]/40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {t('login.loading')}
            </span>
          ) : t('login.button')}
        </button>

        <p className="mt-3 text-center text-xs text-[#4A5568]">
          {t('login.goToRegister')}{' '}
          <button type="button" onClick={onGoToRegister} className="font-bold text-[#0052CC] hover:underline">
            {t('welcome.register')}
          </button>
        </p>
      </motion.form>

      <p className="mt-4 text-[10px] text-white/40">
        Rakmana \u00b7 DGI Algeria
      </p>
    </div>
  );
}
