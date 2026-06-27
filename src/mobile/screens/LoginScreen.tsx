'use client';

// ============================================================
// CloudDevis Mobile — Login Screen
// Dark navy theme · cookie-based session · CSRF via Origin header
// ============================================================

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/mobile/lib/api';

interface LoginScreenProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogin(email.trim(), password, rememberMe);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Email ou mot de passe incorrect');
        } else if (err.status === 429) {
          setError('Trop de tentatives. Réessayez dans 1 minute.');
        } else if (err.status === 403) {
          setError('Compte suspendu. Contactez le support.');
        } else {
          setError('Erreur serveur. Réessayez plus tard.');
        }
      } else {
        setError('Erreur réseau. Vérifiez votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, onLogin]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 bg-[var(--navy)]"
      style={{ paddingTop: 'env(safe-area-inset-top, 24px)' }}
    >
      {/* ── Brand ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--green-2)] flex items-center justify-center mb-4 shadow-lg">
          <FileText size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--sand)]">CloudDevis</h1>
        <p className="text-sm text-[var(--sand-muted)] mt-1">
          Connectez-vous à votre compte
        </p>
      </motion.div>

      {/* ── Form card ────────────────────────────────────────── */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)] rounded-2xl p-6 space-y-4"
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

        {/* Email */}
        <div>
          <label
            htmlFor="mobile-email"
            className="block text-xs font-semibold text-[var(--sand-muted)] mb-1.5"
          >
            Adresse email
          </label>
          <input
            id="mobile-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            disabled={loading}
            className={cn(
              'w-full px-4 py-3 rounded-xl text-sm',
              'bg-[var(--navy-3)] text-[var(--sand)]',
              'placeholder:text-[var(--sand-muted)]',
              'border border-[rgba(15,39,71,0.06)]',
              'focus:outline-none focus:border-[rgba(37,99,235,0.4)]',
              'disabled:opacity-50',
            )}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="mobile-password"
            className="block text-xs font-semibold text-[var(--sand-muted)] mb-1.5"
          >
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="mobile-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className={cn(
                'w-full px-4 py-3 pr-12 rounded-xl text-sm',
                'bg-[var(--navy-3)] text-[var(--sand)]',
                'placeholder:text-[var(--sand-muted)]',
                'border border-[rgba(15,39,71,0.06)]',
                'focus:outline-none focus:border-[rgba(37,99,235,0.4)]',
                'disabled:opacity-50',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--sand-muted)] hover:text-[var(--sand)] transition-colors"
              tabIndex={-1}
              aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setRememberMe((v) => !v)}
            className={cn(
              'w-5 h-5 rounded-md border flex items-center justify-center transition-colors',
              rememberMe
                ? 'bg-[var(--green-2)] border-[var(--green-2)]'
                : 'bg-[var(--navy-3)] border-[rgba(15,39,71,0.12)]',
            )}
            role="checkbox"
            aria-checked={rememberMe}
            tabIndex={0}
            onKeyDown={(e) => e.key === ' ' && setRememberMe((v) => !v)}
          >
            {rememberMe && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-[var(--sand-muted)]">Se souvenir de moi (30 jours)</span>
        </label>

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
              Connexion en cours…
            </>
          ) : (
            'Se connecter'
          )}
        </button>

        {/* Forgot password — opens web browser */}
        <p className="text-center text-xs text-[var(--sand-muted)]">
          Mot de passe oublié ?{' '}
          <a
            href="https://clouddevis.vercel.app/auth/reset-password"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--green-2)] underline underline-offset-2"
          >
            Réinitialiser
          </a>
        </p>
      </motion.form>

      {/* Footer */}
      <p className="mt-8 text-[11px] text-[var(--sand-muted)]/50">
        CloudDevis · Conforme DGI Algérie
      </p>
    </div>
  );
}
