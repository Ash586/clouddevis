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

  const inputCls = 'w-full rounded-lg border border-[rgba(0,26,77,0.08)] bg-[#F0F4FF] px-3.5 py-2.5 text-sm text-[#001A4D] placeholder-[#718096] transition-all duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15';
  const labelCls = 'block text-xs font-bold text-[#4A5568]';

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#0052CC] via-[#001A4D] to-[#0052CC] p-5"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm">
        <button
          onClick={onBackToLogin}
          className="mb-4 flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          {t('register.signIn')}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
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
        className="mb-4 text-center text-xl font-black text-white"
      >
        {t('register.title')}
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

        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#DC3545]/8 text-[#DC3545]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>

        <div className="space-y-2.5">
          <div className="space-y-1">
            <label htmlFor="reg-name" className={labelCls}>{t('register.name')}</label>
            <input id="reg-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} className={cn(inputCls, 'disabled:opacity-50')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="reg-email" className={labelCls}>{t('register.email')}</label>
            <input id="reg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} dir="ltr" className={cn(inputCls, 'disabled:opacity-50')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="reg-password" className={labelCls}>{t('register.password')}</label>
            <div className="relative">
              <input id="reg-password" type={showPw ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ caract\u00e8res" disabled={loading} dir="ltr" className={cn(inputCls, 'pr-9 disabled:opacity-50')} />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Masquer' : 'Afficher'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC] transition-colors duration-150"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="reg-confirm" className={labelCls}>{t('register.confirmPassword')}</label>
            <input id="reg-confirm" type={showPw ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} dir="ltr" className={cn(inputCls, 'disabled:opacity-50')} />
          </div>
          <div>
            <label className={cn(labelCls, 'mb-1.5 block')}>{t('settings.accountType')}</label>
            <div className="grid grid-cols-2 gap-2">
              {(['artisan', 'entreprise'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  disabled={loading}
                  className={cn(
                    'rounded-lg py-2 text-xs font-bold transition-all duration-200 active:scale-[0.97]',
                    mode === m
                      ? 'bg-[#0052CC] text-white shadow-sm'
                      : 'border border-[rgba(0,26,77,0.08)] bg-white text-[#4A5568] hover:bg-[#E6F0FF]',
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
          className="mt-4 w-full rounded-lg bg-[#0052CC] py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {t('register.loading')}
            </span>
          ) : t('register.submit')}
        </button>

        <p className="mt-3 text-center text-xs text-[#4A5568]">
          {t('register.alreadyHave')}{' '}
          <button type="button" onClick={onBackToLogin} className="font-bold text-[#DC3545] hover:underline">
            {t('register.signIn')}
          </button>
        </p>
      </motion.form>
    </div>
  );
}
