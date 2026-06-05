'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSent(true);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm p-6 sm:p-8 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-lg font-bold text-slate-800 mb-2">{t('forgotTitle')}</h1>
        {sent ? (
          <p className="text-sm text-slate-500">{t('forgotSuccess')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 text-center font-medium">{error}</div>
            )}
            <p className="text-sm text-slate-500 mb-4 text-center">{t('forgotInstruction')}</p>
            <Input label={t('emailLabel')} type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')} required />
            <Button className="w-full py-2 sm:py-2.5" type="submit" disabled={loading}>{loading ? t('forgotLoading') : t('forgotButton')}</Button>
          </form>
        )}
        <a href="/auth/login" className="block text-xs text-blue-600 font-semibold mt-6 hover:underline">{t('forgotBack')}</a>
      </Card>
    </div>
  );
}
