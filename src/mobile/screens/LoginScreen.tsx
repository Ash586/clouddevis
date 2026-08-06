'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, FileText } from 'lucide-react';
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

  const inputCls = 'w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] py-3 pl-4 pr-10 text-sm text-[#0a0e27] placeholder-[#a0aec0] transition-all duration-200 focus:border-[#0052d4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052d4]/15';
  const labelCls = 'block text-xs font-bold text-[#4a5568] mb-1.5';
  const cairoFont = { fontFamily: 'var(--font-cairo), sans-serif' };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Hero Section */}
      <div
        className="relative flex flex-col items-center px-6 pt-14 pb-8 text-center"
        style={{
          background: 'linear-gradient(145deg, #0033a0, #0052d4 60%, #1a75ff)',
        }}
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
          style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
        >
          <FileText size={26} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="mb-1 text-xl font-black text-white"
          style={cairoFont}
        >
          {t('login.heroTitle')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mb-5 text-xs text-white/70"
          style={cairoFont}
        >
          {t('login.heroSubtitle')}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          onClick={onGoToRegister}
          className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-white/40 bg-white/10 px-5 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 active:scale-[0.97]"
          style={cairoFont}
        >
          {t('login.heroSwitch')}
        </motion.button>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        {/* Logo */}
        <div className="mb-5 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
            style={{ background: 'linear-gradient(135deg, #0033a0, #1a75ff)' }}
          >
            R
          </div>
          <span className="text-lg font-black text-[#0a0e27]" style={cairoFont}>
            Rakmana
          </span>
        </div>

        <h2 className="mb-1 text-xl font-black text-[#0a0e27]" style={cairoFont}>
          {t('login.title')}
        </h2>
        <p className="mb-5 text-xs text-[#718096]" style={cairoFont}>
          {t('login.heroSubtitle')}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="mb-3 rounded-xl border border-[#DC3545]/30 bg-[#DC3545]/8 p-2.5 text-xs font-medium text-[#DC3545]" role="alert" style={cairoFont}>
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="login-email" className={labelCls} style={cairoFont}>{t('login.email')}</label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="you@company.com"
                disabled={loading}
                dir="ltr"
                className={cn(inputCls, 'disabled:opacity-50', fieldErrors.email && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
              />
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0]" />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] font-medium text-[#DC3545]">{fieldErrors.email}</p>
            )}
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className={labelCls} style={cairoFont}>{t('login.password')}</label>
              <button type="button" className="text-[10px] font-bold text-[#0052d4] transition-colors duration-150 hover:text-[#0033a0]" style={cairoFont}>
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
                placeholder="••••••••"
                disabled={loading}
                dir="ltr"
                className={cn(inputCls, 'disabled:opacity-50', fieldErrors.password && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
              />
              <Lock size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-[#a0aec0]" />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] transition-colors duration-150 hover:text-[#0052d4]"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] font-medium text-[#DC3545]">{fieldErrors.password}</p>
            )}
          </div>

          <label className="mb-4 flex cursor-pointer items-center gap-2.5 select-none">
            <div
              onClick={() => setRememberMe((v) => !v)}
              role="checkbox"
              aria-checked={rememberMe}
              tabIndex={0}
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150',
                rememberMe
                  ? 'border-[#0052d4] bg-[#0052d4]'
                  : 'border-[#e2e8f0] bg-white hover:border-[#0052d4]/50',
              )}
            >
              {rememberMe && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-xs text-[#4a5568]" style={cairoFont}>{t('login.rememberMe')}</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #0033a0, #1a75ff)',
              fontFamily: 'var(--font-cairo), sans-serif',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {t('login.loading')}
              </span>
            ) : t('login.button')}
          </button>

          <p className="mt-4 text-center text-xs text-[#4a5568]" style={cairoFont}>
            {t('login.goToRegister')}{' '}
            <button type="button" onClick={onGoToRegister} className="font-bold text-[#0052d4] hover:underline">
              {t('welcome.register')}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
