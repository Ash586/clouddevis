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

  const inputCls = 'w-full rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] px-4 py-3 text-sm text-[#2563EB] placeholder-[#5A6B85] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15';
  const labelCls = 'block text-sm font-medium text-[#33425C]';

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#2563EB] p-6">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={onBackToWelcome}
          className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          {t('welcome.login')}
        </button>
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
      >
        <svg width="36" height="36" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <rect x="148" y="110" width="200" height="260" rx="18" fill="rgba(255,255,255,0.9)"/>
          <circle cx="338" cy="338" r="44" fill="#D4A843"/>
          <path d="M318 338 L330 350 L360 322" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 text-center text-2xl font-black text-white"
      >
        Rakmana
      </motion.h1>

      {/* Form card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        noValidate
      >
        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-[#E8542E]/30 bg-[#E8542E]/10 p-3 text-sm font-medium text-[#E8542E]">
            {error}
          </div>
        )}

        {/* Icon header */}
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB]/5 text-[#2563EB]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>

        <h2 className="mb-5 text-lg font-extrabold text-[#2563EB]">
          {t('login.title')}
        </h2>

        {/* Email */}
        <div className="space-y-1.5">
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

        {/* Password */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className={labelCls}>{t('login.password')}</label>
            <button type="button" className="text-xs font-medium text-[#5A6B85] hover:text-[#E8542E] transition-colors">
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
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              disabled={loading}
              dir="ltr"
              className={cn(inputCls, 'pr-10 disabled:opacity-50')}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6B85] hover:text-[#2563EB] transition-colors"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label className="mt-4 flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setRememberMe((v) => !v)}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded border transition-colors',
              rememberMe
                ? 'border-[#2563EB] bg-[#2563EB]'
                : 'border-[rgba(15,39,71,0.09)] bg-white',
            )}
          >
            {rememberMe && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-[#33425C]">{t('login.rememberMe')}</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#2563EB] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1D4ED8] hover:shadow-md disabled:opacity-50 active:scale-[0.97]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {t('login.loading')}
            </span>
          ) : t('login.button')}
        </button>
      </motion.form>

      <p className="mt-6 text-sm text-white/50">
        Rakmana Â· DGI Algeria
      </p>
    </div>
  );
}
