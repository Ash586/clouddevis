'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
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

          <Input label={t('passwordLabel')} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder={t('min6Chars')} required minLength={6} />

          <Input label={t('confirmPassword')} type="password" value={confirmPassword}
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
            {loading ? t('registerLoading') : t('registerButton')}
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
