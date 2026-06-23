'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { track, AUTH_EVENTS } from '@/lib/analytics';
import { useTheme } from '@/contexts/ThemeContext';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get('redirect') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(searchParams.get('error') || '');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const safeRedirect = redirectTo.startsWith('/dashboard') ? redirectTo : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Échec de connexion'); return; }
      track(AUTH_EVENTS.LOGIN_SUCCESS, { method: data.method || 'password' });
      router.push(safeRedirect || '/dashboard');
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  const errorId = 'login-error';
  const hasError = !!(error || (
    error === 'oauth_canceled' ? 'Connexion annulée' :
    error === 'oauth_invalid_state' ? 'Erreur de sécurité OAuth' :
    error === 'oauth_failed' ? 'Échec de connexion OAuth' :
    error === 'oauth_invalid_provider' ? 'Fournisseur non supporté' :
    error === 'oauth_error' ? 'Erreur OAuth' :
    null
  ));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--navy)]">
      <div className="w-full max-w-[380px] bg-[var(--navy-2)] border border-[rgba(15,39,71,0.08)] rounded-xl p-7 sm:p-6">
        <div className="text-center mb-6">
          <div className="w-11 h-11 bg-[var(--navy-3)] rounded-[10px] flex items-center justify-center mx-auto mb-3 text-lg font-extrabold text-[var(--sand)]">CD</div>
          <h1 className="text-xl font-bold text-[var(--sand)] m-0">CloudDevis</h1>
          <p className="text-[13px] text-[var(--sand-muted)] mt-1">Connectez-vous à votre compte</p>
        </div>

        <div id={errorId} role="alert" aria-live="polite" aria-relevant="additions text">
          {hasError && (
            <div className={`text-[13px] rounded-lg py-2.5 px-3.5 text-center font-semibold mb-4 ${
              error === 'oauth_canceled' || error === 'oauth_invalid_state' || error === 'oauth_failed' || error === 'oauth_invalid_provider' || error === 'oauth_error'
                ? 'bg-[rgba(251,191,36,0.10)] text-[#fbbf24]'
                : 'bg-[rgba(248,113,113,0.10)] text-[#f87171]'
            }`}>
              {error === 'oauth_canceled' ? 'Connexion annulée' :
               error === 'oauth_invalid_state' ? 'Erreur de sécurité OAuth' :
               error === 'oauth_failed' ? 'Échec de connexion OAuth' :
               error === 'oauth_invalid_provider' ? 'Fournisseur non supporté' :
               error === 'oauth_error' ? 'Erreur OAuth' :
               error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="login-email" className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Email</label>
            <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@email.com" required autoComplete="email"
              aria-invalid={hasError ? 'true' : undefined}
              aria-describedby={hasError ? errorId : undefined}
              className="w-full bg-[var(--navy-3)] border border-[rgba(15,39,71,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--green-2)]" />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Mot de passe</label>
            <div className="relative">
              <input id="login-password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete="current-password"
                aria-invalid={hasError ? 'true' : undefined}
                aria-describedby={hasError ? errorId : undefined}
                className="w-full bg-[var(--navy-3)] border border-[rgba(15,39,71,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--green-2)]" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--sand-muted)] hover:text-[var(--sand)] p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center transition rounded-xl hover:bg-[var(--navy-4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-glow)]">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                className="accent-[var(--sand)] w-[15px] h-[15px]" />
              <span className="text-[var(--sand-muted)]">Se souvenir de moi</span>
            </label>
            <a href="/auth/forgot-password" className="text-[var(--sand-muted)] font-semibold text-[13px] no-underline hover:text-[var(--sand)] transition">
              Mot de passe oublié ?
            </a>
          </div>

          <div className="flex gap-2.5 items-center">
            <button type="button" onClick={toggleTheme}
              className="w-11 h-11 rounded-[10px] flex items-center justify-center cursor-pointer shrink-0 transition bg-[var(--navy-3)] border border-[rgba(15,39,71,0.08)] text-[var(--green-3)] hover:bg-[var(--navy-4)]"
              aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg text-sm font-bold border border-[rgba(15,39,71,0.08)] cursor-pointer bg-[var(--navy-3)] text-[var(--sand)] min-h-[44px] transition hover:bg-[var(--navy-4)] disabled:opacity-50 disabled:cursor-default active:scale-[0.98]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </div>
        </form>

        <div className="my-5 text-center relative">
          <span className="text-[11px] text-[var(--sand-muted)] bg-[var(--navy-2)] px-2.5 relative z-10">ou continuer avec</span>
          <div className="absolute left-0 right-0 top-1/2 border-t border-[rgba(15,39,71,0.06)] z-0" />
        </div>

        <div className="flex flex-col gap-2">
          <a href={`/api/auth/oauth/google${safeRedirect ? `?redirect=${encodeURIComponent(safeRedirect)}` : ''}`}
            aria-label="Continuer avec Google"
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold border border-[rgba(15,39,71,0.08)] bg-transparent text-[var(--sand)] no-underline hover:bg-[var(--navy-3)] transition min-h-[44px]">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </a>
          <a href={`/api/auth/oauth/github${safeRedirect ? `?redirect=${encodeURIComponent(safeRedirect)}` : ''}`}
            aria-label="Continuer avec GitHub"
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold border border-[rgba(15,39,71,0.08)] bg-transparent text-[var(--sand)] no-underline hover:bg-[var(--navy-3)] transition min-h-[44px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--sand)" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02.01 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/></svg>
            GitHub
          </a>
        </div>

        <p className="text-center text-xs text-[var(--sand-muted)] mt-5">
          Pas encore de compte ?{' '}
          <a href="/auth/register" className="text-[var(--sand-muted)] font-semibold no-underline hover:text-[var(--sand)] transition">S&apos;inscrire</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy)]">
        <Loader2 size={28} className="animate-spin text-[var(--sand-muted)]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
