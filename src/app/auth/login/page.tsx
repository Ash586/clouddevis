'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t('errors.emailRequired')); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t('errors.loginFailed')); return; }
      router.push('/dashboard');
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">CloudDevis</span>
          <p className="text-sm text-slate-500 mt-2">{t('loginTitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 text-center font-medium">{error}</div>
          )}

          <Input label={t('emailLabel')} type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')} required />

          <Input label={t('passwordLabel')} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder={t('passwordPlaceholder')} required />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-slate-500">{t('rememberMe')}</span>
            </label>
            <a href="/auth/forgot-password" className="text-blue-600 font-semibold hover:underline">
              {t('forgotPassword')}
            </a>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? t('loginLoading') : t('loginButton')}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="relative text-center">
            <span className="text-xs text-slate-400 bg-white px-2 relative z-10">{t('orDivider')}</span>
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
          </div>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/api/auth/oauth/google'}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t('googleLogin')}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/api/auth/oauth/github'}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#333" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02.01 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/></svg>
            {t('githubLogin')}
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {t('noAccount')}{' '}
          <a href="/auth/register" className="text-blue-600 font-semibold hover:underline">{t('signupLink')}</a>
        </p>
      </Card>
    </div>
  );
}
