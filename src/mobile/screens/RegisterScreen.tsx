'use client';

// ============================================================
// Rakmana Mobile — Register Screen
// Dark navy theme · cookie-based session · mode selection
// ============================================================

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
    if (!name.trim()) {
      setError(t('register.error.nameRequired'));
      return;
    }
    if (!email.trim()) {
      setError(t('register.error.emailRequired'));
      return;
    }
    if (!password) {
      setError(t('register.error.passwordRequired'));
      return;
    }
    if (!confirm) {
      setError(t('register.error.confirmRequired'));
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
        if (err.status === 409) {
          setError(t('register.error.emailTaken'));
        } else if (err.status === 429) {
          setError(t('register.error.rateLimit'));
        } else if (err.status >= 500) {
          setError(t('register.error.server'));
        } else {
          setError(t('register.error.network'));
        }
      } else {
        setError(t('register.error.network'));
      }
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirm, mode, onRegister, t]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 bg-[var(--navy)]"
      style={{ paddingTop: 'env(safe-area-inset-top, 24px)' }}
    >
      {/* ── Back button ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm flex justify-start mb-4"
      >
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-sm text-[var(--sand-muted)] hover:text-[var(--sand)] transition-colors"
        >
          <ArrowLeft size={18} />
          {t('welcome.login')}
        </button>
      </motion.div>

      {/* ── Title ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm mb-6"
      >
        <h1 className="text-2xl font-bold text-[var(--sand)]">{t('register.title')}</h1>
      </motion.div>

      {/* ── Form card ────────────────────────────────────────── */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm bg-[var(--navy-2)] border border-[var(--border)] rounded-2xl p-6 space-y-4"
        noValidate
      >
        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
            role="alert"
          >
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-[var(--sand-muted)] mb-1.5">
            {t('register.name')}
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('register.namePh')}
            disabled={loading}
            className={cn(
              'w-full px-4 py-3 rounded-xl text-sm',
              'bg-[var(--navy-3)] text-[var(--sand)]',
              'placeholder:text-[var(--sand-muted)]',
              'border border-[var(--border)]',
              'focus:outline-none focus:border-[rgba(37,99,235,0.4)]',
              'disabled:opacity-50',
            )}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-[var(--sand-muted)] mb-1.5">
            {t('register.email')}
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('register.emailPh')}
            disabled={loading}
            className={cn(
              'w-full px-4 py-3 rounded-xl text-sm',
              'bg-[var(--navy-3)] text-[var(--sand)]',
              'placeholder:text-[var(--sand-muted)]',
              'border border-[var(--border)]',
              'focus:outline-none focus:border-[rgba(37,99,235,0.4)]',
              'disabled:opacity-50',
            )}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-[var(--sand-muted)] mb-1.5">
            {t('register.password')}
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('register.passwordPh')}
              disabled={loading}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-sm',
                'pe-12',
                'bg-[var(--navy-3)] text-[var(--sand)]',
                'placeholder:text-[var(--sand-muted)]',
                'border border-[var(--border)]',
                'focus:outline-none focus:border-[rgba(37,99,235,0.4)]',
                'disabled:opacity-50',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-[var(--sand-muted)] hover:text-[var(--sand)] transition-colors"
              tabIndex={-1}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="reg-confirm" className="block text-xs font-semibold text-[var(--sand-muted)] mb-1.5">
            {t('register.confirmPassword')}
          </label>
          <input
            id="reg-confirm"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t('register.passwordPh')}
            disabled={loading}
            className={cn(
              'w-full px-4 py-3 rounded-xl text-sm',
              'bg-[var(--navy-3)] text-[var(--sand)]',
              'placeholder:text-[var(--sand-muted)]',
              'border border-[var(--border)]',
              'focus:outline-none focus:border-[rgba(37,99,235,0.4)]',
              'disabled:opacity-50',
            )}
          />
        </div>

        {/* Mode selector */}
        <div>
          <label className="block text-xs font-semibold text-[var(--sand-muted)] mb-2">
            {t('settings.accountType')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['artisan', 'entreprise'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                disabled={loading}
                className={cn(
                  'py-3 rounded-xl text-sm font-medium transition-all',
                  mode === m
                    ? 'bg-[var(--green-2)] text-white'
                    : 'bg-[var(--navy-3)] text-[var(--sand-muted)] border border-[var(--border)]',
                  'disabled:opacity-50',
                )}
              >
                {t(`register.mode${m.charAt(0).toUpperCase() + m.slice(1)}` as 'register.modeArtisan' | 'register.modeEntreprise')}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full py-3.5 rounded-xl text-sm font-semibold text-white',
            'bg-[var(--green-2)] active:scale-[0.98] transition-transform',
            'flex items-center justify-center gap-2',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('register.loading')}
            </>
          ) : (
            t('register.submit')
          )}
        </button>

        {/* Already have account */}
        <p className="text-center text-xs text-[var(--sand-muted)]">
          {t('register.alreadyHave')}{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-[var(--green-2)] font-semibold"
          >
            {t('register.signIn')}
          </button>
        </p>
      </motion.form>
    </div>
  );
}
