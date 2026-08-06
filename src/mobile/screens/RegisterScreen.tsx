'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/mobile/lib/api';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface RegisterScreenProps {
  onRegister: (name: string, email: string, password: string, mode: 'artisan' | 'entreprise') => Promise<void>;
  onBackToLogin: () => void;
}

function getPasswordStrength(pw: string): { level: 'weak' | 'medium' | 'strong'; key: string } {
  if (pw.length < 6) return { level: 'weak', key: 'register.strength.weak' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = (pw.length >= 12 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (score >= 3) return { level: 'strong', key: 'register.strength.strong' };
  if (score === 2) return { level: 'medium', key: 'register.strength.medium' };
  return { level: 'weak', key: 'register.strength.weak' };
}

const strengthColors = {
  weak: 'bg-[#DC3545]',
  medium: 'bg-[#F59E0B]',
  strong: 'bg-[#10B981]',
};
const strengthWidths = { weak: '33%', medium: '66%', strong: '100%' };

export function RegisterScreen({ onRegister, onBackToLogin }: RegisterScreenProps) {
  const { t } = useMobileI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mode, setMode] = useState<'artisan' | 'entreprise'>('artisan');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string; terms?: string }>({});

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const validateFields = useCallback(() => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = t('register.error.nameRequired');
    if (!email.trim()) errs.email = t('register.error.emailRequired');
    if (!password) errs.password = t('register.error.passwordRequired');
    else if (password.length < 12) errs.password = t('register.error.passwordTooShort');
    if (!confirm) errs.confirm = t('register.error.confirmRequired');
    else if (password !== confirm) errs.confirm = t('register.error.passwordMismatch');
    if (!acceptedTerms) errs.terms = t('register.error.termsRequired');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [name, email, password, confirm, acceptedTerms, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    setError('');
    setLoading(true);
    try {
      await onRegister(name.trim(), email.trim(), password, mode);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError(t('register.error.emailTaken'));
        else if (err.status === 429) setError(t('register.error.rateLimit'));
        else if (err.status >= 500) setError(t('register.error.server'));
        else if (err.status === 400) setError(err.message || t('register.error.network'));
        else setError(t('register.error.network'));
      } else {
        setError(t('register.error.network'));
      }
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirm, mode, acceptedTerms, onRegister, t, validateFields]);

  const clearField = (field: keyof typeof fieldErrors) => setFieldErrors((p) => ({ ...p, [field]: undefined }));

  const inputCls = 'w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] py-3 pl-4 pr-10 text-sm text-[#0a0e27] placeholder-[#a0aec0] transition-all duration-200 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/15';
  const labelCls = 'block text-xs font-bold text-[#4a5568] mb-1.5';
  const cairoFont = { fontFamily: 'var(--font-cairo), sans-serif' };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Hero Section */}
      <div
        className="relative flex flex-col items-center px-6 pt-14 pb-8 text-center"
        style={{
          background: 'linear-gradient(145deg, #6b21a8, #8b5cf6 60%, #a78bfa)',
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
          <Rocket size={26} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="mb-1 text-xl font-black text-white"
          style={cairoFont}
        >
          {t('register.heroTitle')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mb-5 text-xs text-white/70"
          style={cairoFont}
        >
          {t('register.heroSubtitle')}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-white/40 bg-white/10 px-5 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 active:scale-[0.97]"
          style={cairoFont}
        >
          {t('register.heroSwitch')}
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
            style={{ background: 'linear-gradient(135deg, #6b21a8, #a78bfa)' }}
          >
            R
          </div>
          <span className="text-lg font-black text-[#0a0e27]" style={cairoFont}>
            Rakmana
          </span>
        </div>

        <h2 className="mb-1 text-xl font-black text-[#0a0e27]" style={cairoFont}>
          {t('register.title')}
        </h2>
        <p className="mb-5 text-xs text-[#718096]" style={cairoFont}>
          {t('register.heroSubtitle')}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="mb-3 rounded-xl border border-[#DC3545]/30 bg-[#DC3545]/8 p-2.5 text-xs font-medium text-[#DC3545]" role="alert" style={cairoFont}>
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className={labelCls} style={cairoFont}>{t('settings.accountType')}</label>
            <div className="grid grid-cols-2 gap-2">
              {(['artisan', 'entreprise'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  disabled={loading}
                  className={cn(
                    'rounded-xl py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.97]',
                    mode === m
                      ? 'text-white shadow-sm'
                      : 'border border-[#e2e8f0] bg-white text-[#4a5568] hover:bg-[#f8fafc]',
                    'disabled:opacity-50',
                  )}
                  style={mode === m ? { background: 'linear-gradient(135deg, #6b21a8, #a78bfa)', ...cairoFont } : cairoFont}
                >
                  {t(`register.mode${m.charAt(0).toUpperCase() + m.slice(1)}` as 'register.modeArtisan' | 'register.modeEntreprise')}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="reg-name" className={labelCls} style={cairoFont}>{t('register.name')}</label>
            <div className="relative">
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearField('name'); }}
                disabled={loading}
                className={cn(inputCls, 'disabled:opacity-50', fieldErrors.name && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
              />
              <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0]" />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] font-medium text-[#DC3545]">{fieldErrors.name}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="reg-email" className={labelCls} style={cairoFont}>{t('register.email')}</label>
            <div className="relative">
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearField('email'); }}
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
            <label htmlFor="reg-password" className={labelCls} style={cairoFont}>{t('register.password')}</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearField('password'); }}
                placeholder="••••••••"
                disabled={loading}
                dir="ltr"
                className={cn(inputCls, 'disabled:opacity-50', fieldErrors.password && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
              />
              <Lock size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-[#a0aec0]" />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Masquer' : 'Afficher'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] transition-colors duration-150 hover:text-[#8b5cf6]"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] font-medium text-[#DC3545]">{fieldErrors.password}</p>
            )}
            {password.length > 0 && (
              <div className="mt-1.5">
                <div className="h-1.5 w-full rounded-full bg-[#e2e8f0]">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', strengthColors[strength.level])}
                    style={{ width: strengthWidths[strength.level] }}
                  />
                </div>
                <p className={cn('mt-0.5 text-[10px] font-bold', strength.level === 'weak' ? 'text-[#DC3545]' : strength.level === 'medium' ? 'text-[#F59E0B]' : 'text-[#10B981]')} style={cairoFont}>
                  {t(strength.key as 'register.strength.weak')}
                </p>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="reg-confirm" className={labelCls} style={cairoFont}>{t('register.confirmPassword')}</label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); clearField('confirm'); }}
                disabled={loading}
                dir="ltr"
                className={cn(inputCls, 'disabled:opacity-50', fieldErrors.confirm && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
              />
              <Lock size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-[#a0aec0]" />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] transition-colors duration-150 hover:text-[#8b5cf6]"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirm && (
              <p className="mt-1 text-[11px] font-medium text-[#DC3545]">{fieldErrors.confirm}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="flex cursor-pointer items-start gap-2.5 select-none">
              <div
                onClick={() => { setAcceptedTerms((v) => !v); clearField('terms'); }}
                role="checkbox"
                aria-checked={acceptedTerms}
                tabIndex={0}
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150',
                  acceptedTerms
                    ? 'border-[#8b5cf6] bg-[#8b5cf6]'
                    : fieldErrors.terms
                      ? 'border-[#DC3545]/50 bg-white'
                      : 'border-[#e2e8f0] bg-white hover:border-[#8b5cf6]/50',
                )}
              >
                {acceptedTerms && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-xs leading-relaxed text-[#4a5568]" style={cairoFont}>
                {t('register.terms')}
              </span>
            </label>
            {fieldErrors.terms && (
              <p className="ml-7 mt-1 text-[11px] font-medium text-[#DC3545]">{fieldErrors.terms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #6b21a8, #a78bfa)',
              fontFamily: 'var(--font-cairo), sans-serif',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {t('register.loading')}
              </span>
            ) : t('register.submit')}
          </button>

          <p className="mt-4 text-center text-xs text-[#4a5568]" style={cairoFont}>
            {t('register.alreadyHave')}{' '}
            <button type="button" onClick={onBackToLogin} className="font-bold text-[#8b5cf6] hover:underline">
              {t('register.signIn')}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
