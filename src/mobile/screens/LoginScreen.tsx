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
