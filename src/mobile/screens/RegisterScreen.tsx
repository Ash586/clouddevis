'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
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
  const score = (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (pw.length >= 8 && score >= 2) return { level: 'strong', key: 'register.strength.strong' };
  return { level: 'medium', key: 'register.strength.medium' };
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
        else setError(t('register.error.network'));
      } else {
        setError(t('register.error.network'));
      }
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirm, mode, acceptedTerms, onRegister, t, validateFields]);

  const clearField = (field: keyof typeof fieldErrors) => setFieldErrors((p) => ({ ...p, [field]: undefined }));

  const inputCls = 'w-full rounded-xl border border-[rgba(0,26,77,0.08)] bg-[#F0F4FF] px-4 py-3 text-sm text-[#001A4D] placeholder-[#718096] transition-all duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15';
  const labelCls = 'block text-xs font-bold text-[#4A5568]';

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#0052CC] via-[#001A4D] to-[#0052CC] p-5"
      style={{ paddingTop: 'max(1.5rem, var(--sat, env(safe-area-inset-top)))', paddingBottom: 'var(--sab, env(safe-area-inset-bottom, 0px))' }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm">
        <button
          onClick={onBackToLogin}
          className="mb-4 flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={14} />
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
          <div className="mb-3 rounded-xl border border-[#DC3545]/30 bg-[#DC3545]/8 p-2.5 text-xs font-medium text-[#DC3545]" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-2.5">
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
                    'rounded-xl py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.97]',
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

          <div>
            <label htmlFor="reg-name" className={labelCls}>{t('register.name')}</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => { setName(e.target.value); clearField('name'); }}
              disabled={loading}
              className={cn(inputCls, 'disabled:opacity-50', fieldErrors.name && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
            />
            {fieldErrors.name && (
              <p className="text-[11px] font-medium text-[#DC3545] mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className={labelCls}>{t('register.email')}</label>
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
            {fieldErrors.email && (
              <p className="text-[11px] font-medium text-[#DC3545] mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className={labelCls}>{t('register.password')}</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearField('password'); }}
                placeholder="8+ caractères"
                disabled={loading}
                dir="ltr"
                className={cn(inputCls, 'pr-10 disabled:opacity-50', fieldErrors.password && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Masquer' : 'Afficher'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC] transition-colors duration-150"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] font-medium text-[#DC3545] mt-1">{fieldErrors.password}</p>
            )}
            {password.length > 0 && (
              <div className="mt-1.5">
                <div className="h-1.5 w-full rounded-full bg-[rgba(0,26,77,0.06)]">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', strengthColors[strength.level])}
                    style={{ width: strengthWidths[strength.level] }}
                  />
                </div>
                <p className={cn('mt-0.5 text-[10px] font-bold', strength.level === 'weak' ? 'text-[#DC3545]' : strength.level === 'medium' ? 'text-[#F59E0B]' : 'text-[#10B981]')}>
                  {t(strength.key as 'register.strength.weak')}
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="reg-confirm" className={labelCls}>{t('register.confirmPassword')}</label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); clearField('confirm'); }}
                disabled={loading}
                dir="ltr"
                className={cn(inputCls, 'pr-10 disabled:opacity-50', fieldErrors.confirm && 'border-[#DC3545]/50 focus:border-[#DC3545] focus:ring-[#DC3545]/15')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC] transition-colors duration-150"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirm && (
              <p className="text-[11px] font-medium text-[#DC3545] mt-1">{fieldErrors.confirm}</p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => { setAcceptedTerms((v) => !v); clearField('terms'); }}
                role="checkbox"
                aria-checked={acceptedTerms}
                tabIndex={0}
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150',
                  acceptedTerms
                    ? 'border-[#0052CC] bg-[#0052CC]'
                    : fieldErrors.terms
                      ? 'border-[#DC3545]/50 bg-white'
                      : 'border-[rgba(0,26,77,0.15)] bg-white hover:border-[#0052CC]/50',
                )}
              >
                {acceptedTerms && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-[#4A5568] leading-relaxed">
                {t('register.terms')}
              </span>
            </label>
            {fieldErrors.terms && (
              <p className="text-[11px] font-medium text-[#DC3545] mt-1 ml-7">{fieldErrors.terms}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-[#0052CC] py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] hover:shadow-md disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0052CC]/40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {t('register.loading')}
            </span>
          ) : t('register.submit')}
        </button>

        <p className="mt-3 text-center text-xs text-[#4A5568]">
          {t('register.alreadyHave')}{' '}
          <button type="button" onClick={onBackToLogin} className="font-bold text-[#0052CC] hover:underline">
            {t('register.signIn')}
          </button>
        </p>
      </motion.form>
    </div>
  );
}
