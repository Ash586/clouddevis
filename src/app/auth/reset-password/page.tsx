'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

function ResetForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) { setError(t('errors.passwordTooShort')); return; }
    if (password !== confirm) { setError(t('errors.passwordsNoMatch')); return; }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch {
      setError(t('errors.networkError'));
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-sm p-8 text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">{t('resetInvalid')}</h1>
          <p className="text-sm text-slate-500">{t('resetInvalidDesc')}</p>
          <a href="/auth/forgot-password" className="block text-xs text-blue-600 font-semibold mt-6 hover:underline">
            {t('resetNewLink')}
          </a>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-sm p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">{t('resetSuccess')}</h1>
          <p className="text-sm text-slate-500">{t('resetRedirect')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-lg font-bold text-slate-800">{t('resetTitle')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('resetSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 text-center font-medium">{error}</div>
          )}

          <Input label={t('resetNewPassword')} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder={t('min6Chars')} required minLength={6} />

          <Input label={t('confirmPassword')} type="password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} placeholder={t('confirmPlaceholder')} required minLength={6} />

          <Button className="w-full" type="submit">{t('resetButton')}</Button>
        </form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations('common');
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">{t('loading')}</div>}>
      <ResetForm />
    </Suspense>
  );
}
