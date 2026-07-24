'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/mobile/lib/api';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface RegisterScreenProps {
  onRegister: (name: string, email: string, password: string, mode: 'artisan' | 'entreprise') => Promise<void>;
  onBackToLogin: () => void;
}

export function RegisterScreen({ onRegister, onBackToLogin }: RegisterScreenProps) {
  const { t } = useMobileI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mode, setMode] = useState<'artisan' | 'entreprise'>('artisan');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError(t('register.error.fillAll'));
      return;
    }
    if (password !== confirm) {
      setError(t('register.error.passwordMismatch'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onRegister(name.trim(), email.trim(), password, mode);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError(t('register.error.emailTaken'));
        else if (err.status === 429) setError(t('register.error.rateLimit'));
        else if (err.status >= 500) setError(t('register.error.server'));
        else setError(t('register.error.network'));
      } else {
        setError(t('register.error.network'));
      }
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirm, mode, onRegister, t]);

  const inputCls = 'w-full rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] px-4 py-3 text-sm text-[#2563EB] placeholder-[#5A6B85] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15';
  const labelCls = 'block text-sm font-medium text-[#33425C]';

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#2563EB] p-6">
      {/* Back */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm">
        <button
          onClick={onBackToLogin}
          className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          {t('register.signIn')}
        </button>
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
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
        className="mb-6 text-center text-2xl font-black text-white"
      >
        {t('register.title')}
      </motion.h1>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        noValidate
      >
        {error && (
          <div className="mb-4 rounded-lg border border-[#E8542E]/30 bg-[#E8542E]/10 p-3 text-sm font-medium text-[#E8542E]">
            {error}
          </div>
        )}

        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8542E]/10 text-[#E8542E]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className={labelCls}>{t('register.name')}</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className={cn(inputCls, 'disabled:opacity-50')}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className={labelCls}>{t('register.email')}</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              dir="ltr"
              className={cn(inputCls, 'disabled:opacity-50')}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className={labelCls}>{t('register.password')}</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                disabled={loading}
                dir="ltr"
                className={cn(inputCls, 'pr-10 disabled:opacity-50')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6B85] hover:text-[#2563EB]"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <label htmlFor="reg-confirm" className={labelCls}>{t('register.confirmPassword')}</label>
            <input
              id="reg-confirm"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              dir="ltr"
              className={cn(inputCls, 'disabled:opacity-50')}
            />
          </div>

          {/* Mode selector */}
          <div>
            <label className={cn(labelCls, 'mb-2 block')}>{t('settings.accountType')}</label>
            <div className="grid grid-cols-2 gap-3">
              {(['artisan', 'entreprise'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  disabled={loading}
                  className={cn(
                    'rounded-lg py-2.5 text-sm font-bold transition-all active:scale-[0.97]',
                    mode === m
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'border border-[rgba(15,39,71,0.09)] bg-white text-[#33425C] hover:bg-[#EDF2FB]',
                    'disabled:opacity-50',
                  )}
                >
                  {t(`register.mode${m.charAt(0).toUpperCase() + m.slice(1)}` as 'register.modeArtisan' | 'register.modeEntreprise')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#2563EB] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1D4ED8] hover:shadow-md disabled:opacity-50 active:scale-[0.97]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {t('register.loading')}
            </span>
          ) : t('register.submit')}
        </button>

        <p className="mt-5 text-center text-sm text-[#33425C]">
          {t('register.alreadyHave')}{' '}
          <button type="button" onClick={onBackToLogin} className="font-bold text-[#E8542E] hover:underline">
            {t('register.signIn')}
          </button>
        </p>
      </motion.form>
    </div>
  );
}
