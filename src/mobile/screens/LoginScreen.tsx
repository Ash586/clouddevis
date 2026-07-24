'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { ApiError } from '@/mobile/lib/api';

interface LoginScreenProps {
  onBackToLanding: () => void;
  onGoToRegister: () => void;
}

export function LoginScreen({ onBackToLanding, onGoToRegister }: LoginScreenProps) {
  const { t, dir } = useMobileI18n();
  const { login } = useAuthGuard();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t('login.error.fillAll')); return; }
    setLoading(true);
    try {
      await login(email, password, rememberMe);
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
  }

  return (
    <div dir={dir} className="min-h-dvh flex items-center justify-center p-4 bg-[#F3F6FC]">
      <div className="w-full max-w-[380px] bg-white border border-[rgba(15,39,71,0.08)] rounded-xl p-7">
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 bg-[#EDF2FB] rounded-[10px] flex items-center justify-center mx-auto mb-3 text-lg font-extrabold text-[#0F2747]">CD</div>
          <h1 className="text-xl font-bold text-[#0F2747] m-0" style={{ fontFamily: "'Sora', sans-serif" }}>Rakmana</h1>
          <p className="text-[13px] text-[#5A6B85] mt-1">{t('login.title')}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[rgba(248,113,113,0.10)] text-[#f87171] text-[13px] rounded-lg py-2.5 px-3.5 text-center font-semibold mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-[11px] font-semibold text-[#5A6B85] mb-1.5">{t('login.email')}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              required
              autoComplete="email"
              className="w-full bg-[#EDF2FB] border border-[rgba(15,39,71,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[#0F2747] outline-none box-border min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="block text-[11px] font-semibold text-[#5A6B85] mb-1.5">{t('login.password')}</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={12}
                autoComplete="current-password"
                className="w-full bg-[#EDF2FB] border border-[rgba(15,39,71,0.08)] rounded-lg px-3.5 py-2.5 pr-11 text-sm text-[#0F2747] outline-none box-border min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A6B85] hover:text-[#0F2747] p-1.5 rounded-xl hover:bg-[#EDF2FB] transition"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between text-[13px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#0F2747] w-[15px] h-[15px]"
              />
              <span className="text-[#5A6B85]">{t('login.rememberMe')}</span>
            </label>
            <a href="/auth/forgot-password" className="text-[#5A6B85] font-semibold text-[13px] no-underline hover:text-[#0F2747] transition">
              {t('login.forgotPassword')}
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg text-sm font-bold cursor-pointer bg-[#2563EB] text-white min-h-[48px] transition hover:bg-[#1D4ED8] shadow-lg shadow-[rgba(37,99,235,0.25)] disabled:opacity-50 disabled:cursor-default active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {t('login.loading')}
              </span>
            ) : t('login.button')}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 text-center relative">
          <span className="text-[11px] text-[#5A6B85] bg-white px-2.5 relative z-10">ou continuer avec</span>
          <div className="absolute left-0 right-0 top-1/2 border-t border-[rgba(15,39,71,0.06)] z-0" />
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.location.href = '/api/auth/oauth/google'}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold border border-[rgba(15,39,71,0.08)] bg-transparent text-[#0F2747] hover:bg-[#EDF2FB] transition min-h-[44px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button
            onClick={() => window.location.href = '/api/auth/oauth/github'}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold border border-[rgba(15,39,71,0.08)] bg-transparent text-[#0F2747] hover:bg-[#EDF2FB] transition min-h-[44px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0F2747"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02.01 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/></svg>
            GitHub
          </button>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-[#5A6B85] mt-5">
          Pas encore de compte ?{' '}
          <button onClick={onGoToRegister} className="text-[#5A6B85] font-semibold no-underline hover:text-[#0F2747] transition bg-transparent border-none cursor-pointer text-xs">
            S'inscrire
          </button>
        </p>

        {/* Back to landing */}
        <button onClick={onBackToLanding} className="w-full mt-3 text-center text-[11px] text-[#5A6B85] hover:text-[#0F2747] transition bg-transparent border-none cursor-pointer">
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
