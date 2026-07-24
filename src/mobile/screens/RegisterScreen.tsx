'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useAuthGuard } from '@/mobile/lib/useAuthGuard';
import { ApiError } from '@/mobile/lib/api';

interface RegisterScreenProps {
  onBackToLogin: () => void;
}

const SECTORS = [
  { value: 'btp', label: 'BTP' },
  { value: 'moving', label: 'Déménagement' },
  { value: 'cleaning', label: 'Nettoyage' },
  { value: 'hotel', label: 'Hôtellerie' },
  { value: 'auto', label: 'Automobile' },
  { value: 'health', label: 'Santé' },
  { value: 'training', label: 'Formation' },
  { value: 'realestate', label: 'Immobilier' },
  { value: 'transport', label: 'Transport' },
  { value: 'craft', label: 'Artisanat' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'liberal', label: 'Libéral' },
  { value: 'it', label: 'Informatique' },
];

export function RegisterScreen({ onBackToLogin }: RegisterScreenProps) {
  const { t, dir } = useMobileI18n();
  const { register } = useAuthGuard();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState<'artisan' | 'entreprise'>('artisan');
  const [sector, setSector] = useState('btp');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSteps = mode === 'entreprise' ? 3 : 2;

  const pwStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const colors = ['#EDF2FB', '#f87171', '#fbbf24', '#4a9eff', '#4ade80'];
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
    return { score: s, color: colors[s] || colors[0], label: labels[s] || '' };
  };
  const pwStr = pwStrength(password);

  function canNext() {
    if (step === 1) return name.trim() && email.trim() && password.length >= 12 && password === confirmPassword;
    return true;
  }

  function nextStep() {
    if (step === 1) {
      if (!name.trim()) { setError('Veuillez saisir votre nom complet'); return; }
      if (!email.trim() || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Adresse email invalide'); return; }
      if (password.length < 12) { setError('Mot de passe trop court — minimum 12 caractères'); return; }
      if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    }
    setError('');
    if (step < totalSteps) setStep((s) => s + 1);
  }

  function prevStep() {
    if (step > 1) { setStep((s) => s - 1); setError(''); }
  }

  async function handleSubmit() {
    if (step < totalSteps) return;
    setError('');
    if (!name.trim() || !email.trim() || !password) { setError('Veuillez remplir tous les champs'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, mode);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError(t('register.error.emailTaken'));
        else if (err.status === 429) setError(t('register.error.rateLimit'));
        else if (err.status >= 500) setError(t('register.error.server'));
        else setError(t('register.error.network'));
      } else {
        setError(t('register.error.network'));
      }
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full bg-[#EDF2FB] border border-[rgba(15,39,71,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[#0F2747] outline-none box-border min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#2563EB]';
  const labelCls = 'block text-[11px] font-semibold text-[#5A6B85] mb-1.5';

  return (
    <div dir={dir} className="min-h-dvh flex items-center justify-center p-4 bg-[#F3F6FC]">
      <div className="w-full max-w-[420px] bg-white border border-[rgba(15,39,71,0.08)] rounded-xl p-6">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-xl flex items-center justify-center mx-auto mb-3 text-lg font-extrabold text-white shadow-lg shadow-[rgba(37,99,235,0.25)]">CD</div>
          <h1 className="text-xl font-bold text-[#0F2747] m-0" style={{ fontFamily: "'Sora', sans-serif" }}>Rakmana</h1>
          <p className="text-[13px] text-[#5A6B85] mt-1">{t('register.title')}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[rgba(248,113,113,0.10)] text-[#f87171] text-[13px] rounded-lg py-2.5 px-3.5 text-center font-semibold mb-4">
            {error}
          </div>
        )}

        {/* Step indicator */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all', step >= s ? 'bg-[#2563EB] text-white' : 'bg-[#DCE6F5] text-[#5A6B85]')}>
                  {step > s ? <Check size={12} /> : s}
                </div>
                {s < totalSteps && <div className={cn('flex-1 h-0.5 rounded-full transition-all', step > s ? 'bg-[#2563EB]' : 'bg-[#DCE6F5]')} />}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex-1 text-center text-[10px] font-semibold" style={{ color: step === s ? '#2563EB' : '#5A6B85' }}>
                {s === 1 ? 'Compte' : s === 2 ? (mode === 'entreprise' ? 'Société' : 'Profil') : 'Société'}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {/* Step 1: Account */}
          {step === 1 && (
            <>
              <div>
                <label htmlFor="reg-name" className={labelCls}>{t('register.name')}</label>
                <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" autoComplete="name" className={inputCls} />
              </div>
              <div>
                <label htmlFor="reg-email" className={labelCls}>{t('register.email')}</label>
                <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@email.com" autoComplete="email" className={inputCls} />
              </div>
              <div>
                <label htmlFor="reg-password" className={labelCls}>{t('register.password')}</label>
                <div className="relative">
                  <input id="reg-password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 12 caractères" minLength={12} autoComplete="new-password" className={cn(inputCls, 'pr-11')} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A6B85] hover:text-[#0F2747] p-1.5 rounded-xl hover:bg-[#EDF2FB] transition">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-1.5">
                    <div className="flex gap-1 mb-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex-1 h-[3px] rounded-sm transition-colors" style={{ background: i <= pwStr.score ? pwStr.color : '#EDF2FB' }} />
                      ))}
                    </div>
                    <p className="text-[10px] font-semibold m-0" style={{ color: pwStr.color }}>{pwStr.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="reg-confirm" className={labelCls}>{t('register.confirmPassword')}</label>
                <input id="reg-confirm" type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Répéter le mot de passe" minLength={12} autoComplete="new-password" className={inputCls} />
              </div>
            </>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <>
              <div>
                <label className={labelCls}>Type de compte</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'artisan' as const, icon: '🔨', title: 'Artisan', subtitle: 'Indépendant', features: ['Simple & rapide', 'Nom + téléphone'] },
                    { value: 'entreprise' as const, icon: '🏢', title: 'Entreprise', subtitle: 'SARL · EURL · SPA', features: ['RC, NIF, NIS, AI', 'Conformité DGI'] },
                  ]).map((m) => (
                    <button key={m.value} type="button" onClick={() => setMode(m.value)}
                      className={cn('text-left p-3 rounded-xl border-2 transition', mode === m.value ? 'border-[#2563EB] bg-[rgba(37,99,235,0.06)]' : 'border-[rgba(15,39,71,0.08)] bg-[#EDF2FB]')}>
                      <div className="text-xl mb-1">{m.icon}</div>
                      <div className={cn('text-[13px] font-bold mb-0.5', mode === m.value ? 'text-[#1D4ED8]' : 'text-[#0F2747]')}>{m.title}</div>
                      <div className="text-[9px] text-[#5A6B85] mb-2">{m.subtitle}</div>
                      <ul className="space-y-0.5">
                        {m.features.map((f) => (
                          <li key={f} className="text-[9px] text-[#5A6B85] flex items-center gap-1">
                            <span className={mode === m.value ? 'text-[#1D4ED8]' : ''}>✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="reg-sector" className={labelCls}>Secteur d&apos;activité</label>
                <select id="reg-sector" value={sector} onChange={(e) => setSector(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                  {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Step 3: Enterprise info */}
          {step === 3 && mode === 'entreprise' && (
            <div className="bg-[#EDF2FB] rounded-lg p-3.5 space-y-3">
              <div className="flex items-start gap-2 bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.15)] rounded-lg p-2.5">
                <span className="text-base shrink-0">🏛️</span>
                <div>
                  <p className="text-[10px] font-bold text-[#1D4ED8] m-0">Ces informations apparaîtront sur tous vos documents</p>
                  <p className="text-[9px] text-[#5A6B85] mt-0.5 m-0">RC · NIF · NIS · AI — requis par la DGI</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#5A6B85] uppercase tracking-wider m-0">Informations entreprise</p>
              <div>
                <label className={labelCls}>Raison sociale</label>
                <input type="text" placeholder="Nom de l'entreprise" autoComplete="organization" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>RC</label><input type="text" placeholder="00-00-0000000" className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>NIF</label><input type="text" placeholder="000000000000000" className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>NIS</label><input type="text" placeholder="0000000000" className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>AI</label><input type="text" placeholder="0000000000" className={inputCls} dir="ltr" /></div>
              </div>
              <div>
                <label className={labelCls}>Capital</label>
                <input type="text" placeholder="1 000 000" className={inputCls} dir="ltr" />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-2 mt-1">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="flex items-center justify-center gap-1 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold bg-[#DCE6F5] text-[#5A6B85] border border-[rgba(15,39,71,0.08)] transition hover:bg-[#EDF2FB] active:scale-[0.98]">
                <ChevronLeft size={16} /> Retour
              </button>
            )}
            {step < totalSteps ? (
              <button type="button" onClick={nextStep} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] rounded-lg text-sm font-bold bg-[#2563EB] text-white border-none cursor-pointer transition hover:bg-[#1D4ED8] active:scale-[0.98] shadow-lg shadow-[rgba(37,99,235,0.3)]">
                Suivant <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" disabled={loading} onClick={handleSubmit} className="flex-1 py-2.5 min-h-[44px] rounded-lg text-sm font-bold border border-[rgba(15,39,71,0.08)] cursor-pointer bg-[#EDF2FB] text-[#0F2747] transition hover:bg-[#DCE6F5] disabled:opacity-50 disabled:cursor-default active:scale-[0.98]">
                {loading ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Inscription...</span>
                ) : 'Créer mon compte'}
              </button>
            )}
          </div>
        </div>

        {/* Login link */}
        <p className="text-center text-xs text-[#5A6B85] mt-4">
          {t('register.alreadyHave')}{' '}
          <button onClick={onBackToLogin} className="text-[#5A6B85] font-semibold no-underline hover:text-[#0F2747] transition bg-transparent border-none cursor-pointer text-xs">
            {t('register.signIn')}
          </button>
        </p>
      </div>
    </div>
  );
}
