'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'artisan' | 'entreprise'>('artisan');
  const [sector, setSector] = useState('btp');
  const [country, setCountry] = useState('dz');
  const [language, setLanguage] = useState('fr');
  const [companyName, setCompanyName] = useState('');
  const [companyRc, setCompanyRc] = useState('');
  const [companyNif, setCompanyNif] = useState('');
  const [companyNis, setCompanyNis] = useState('');
  const [companyAi, setCompanyAi] = useState('');
  const [companyCapital, setCompanyCapital] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const SECTOR_OPTIONS = [
    { value: 'btp', label: `🏗️ ${t('sectors.btp')}` },
    { value: 'moving', label: `🚛 ${t('sectors.moving')}` },
    { value: 'cleaning', label: `🧹 ${t('sectors.cleaning')}` },
    { value: 'hotel', label: `🏨 ${t('sectors.hotel')}` },
    { value: 'auto', label: `🔧 ${t('sectors.auto')}` },
    { value: 'health', label: `🏥 ${t('sectors.health')}` },
    { value: 'training', label: `📚 ${t('sectors.training')}` },
    { value: 'realestate', label: `🏠 ${t('sectors.realestate')}` },
    { value: 'transport', label: `🚌 ${t('sectors.transport')}` },
    { value: 'craft', label: `🎨 ${t('sectors.craft')}` },
    { value: 'agriculture', label: `🌾 ${t('sectors.agriculture')}` },
    { value: 'liberal', label: `⚖️ ${t('sectors.liberal')}` },
    { value: 'it', label: `💻 ${t('sectors.it')}` },
  ];

  const COUNTRY_OPTIONS = [
    { value: 'dz', label: `🇩🇿 ${t('countries.dz')}` },
    { value: 'tn', label: `🇹🇳 ${t('countries.tn')}` },
    { value: 'ma', label: `🇲🇦 ${t('countries.ma')}` },
    { value: 'fr', label: `🇫🇷 ${t('countries.fr')}` },
  ];

  const LANGUAGE_OPTIONS = [
    { value: 'fr', label: t('languageOptions.fr') },
    { value: 'ar', label: t('languageOptions.ar') },
    { value: 'en', label: t('languageOptions.en') },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError(t('errors.fillAllFields'));
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    if (password.length < 6) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errors.passwordsNoMatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), email: email.trim(), password, mode, sector, country, language,
          companyInfo: mode === 'entreprise' ? {
            name: companyName.trim() || name.trim(),
            taxIds: { rc: companyRc.trim(), nif: companyNif.trim(), nis: companyNis.trim(), ai: companyAi.trim() },
            capital: companyCapital.trim(),
          } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t('errors.registerFailed')); return; }
      router.push('/dashboard');
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: 'Faible', color: 'bg-red-500' };
    if (score <= 2) return { score, label: 'Moyen', color: 'bg-amber-500' };
    if (score <= 3) return { score, label: 'Bon', color: 'bg-blue-500' };
    return { score, label: 'Fort', color: 'bg-emerald-500' };
  };
  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">CloudDevis</span>
          <p className="text-sm text-slate-500 mt-2">{t('registerTitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 text-center font-medium">
              {error}
            </div>
          )}

          <Input label={t('fullNameLabel')} value={name}
            onChange={(e) => setName(e.target.value)} placeholder={t('fullNamePlaceholder')} required />

          <Input label={t('emailLabel')} type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')} required />

          <div>
            <Input label={t('passwordLabel')} type="password" showPasswordToggle value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder={t('min6Chars')} required minLength={6} />
            {password.length > 0 && (
              <div className="mt-1.5 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-300', i <= strength.score ? strength.color : 'bg-slate-200')} />
                  ))}
                </div>
                <p className="text-[10px] font-medium text-slate-400">{strength.label}</p>
              </div>
            )}
          </div>

          <Input label={t('confirmPassword')} type="password" showPasswordToggle value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('confirmPlaceholder')} required minLength={6} />

          <Select label={t('accountType')} value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            options={[
              { value: 'artisan', label: `👤 ${t('artisanOption')}` },
              { value: 'entreprise', label: `🏢 ${t('companyOption')}` },
            ]} />

          {mode === 'entreprise' && (
            <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{t('companyInfo')}</p>
              <Input label={t('companyName')} value={companyName}
                onChange={(e) => setCompanyName(e.target.value)} placeholder={t('companyNamePlaceholder')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input label="RC" value={companyRc}
                  onChange={(e) => setCompanyRc(e.target.value)} placeholder="Ex: 00-00-0000000" />
                <Input label="NIF" value={companyNif}
                  onChange={(e) => setCompanyNif(e.target.value)} placeholder="Ex: 000000000000000" />
                <Input label="NIS" value={companyNis}
                  onChange={(e) => setCompanyNis(e.target.value)} placeholder="Ex: 000000000000000" />
                <Input label="AI" value={companyAi}
                  onChange={(e) => setCompanyAi(e.target.value)} placeholder="Ex: 000000000000000" />
              </div>
              <Input label={t('companyCapital')} value={companyCapital}
                onChange={(e) => setCompanyCapital(e.target.value)} placeholder="Ex: 1 000 000" />
            </div>
          )}

          <Select label={t('sectorLabel')} value={sector}
            onChange={(e) => setSector(e.target.value)} options={SECTOR_OPTIONS} />

          <Select label={t('countryLabel')} value={country}
            onChange={(e) => setCountry(e.target.value)} options={COUNTRY_OPTIONS} />

          <Select label={t('languageLabel')} value={language}
            onChange={(e) => setLanguage(e.target.value)} options={LANGUAGE_OPTIONS} />

          <Button className="w-full py-2 sm:py-2.5" type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {t('registerLoading')}
              </span>
            ) : t('registerButton')}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          {t('alreadyAccount')}{' '}
          <a href="/auth/login" className="text-blue-600 font-semibold hover:underline">{t('loginLink')}</a>
        </p>
      </Card>
    </div>
  );
}
