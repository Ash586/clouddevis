'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Hammer, Truck, Sparkles, Hotel, Wrench, Heart, BookOpen, Building, Bus, Palette, Wheat, Scale, Monitor, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const SECTORS = [
  { value: 'btp', label: 'BTP', Icon: Hammer },
  { value: 'moving', label: 'Déménagement', Icon: Truck },
  { value: 'cleaning', label: 'Nettoyage', Icon: Sparkles },
  { value: 'hotel', label: 'Hôtellerie', Icon: Hotel },
  { value: 'auto', label: 'Automobile', Icon: Wrench },
  { value: 'health', label: 'Santé', Icon: Heart },
  { value: 'training', label: 'Formation', Icon: BookOpen },
  { value: 'realestate', label: 'Immobilier', Icon: Building },
  { value: 'transport', label: 'Transport', Icon: Bus },
  { value: 'craft', label: 'Artisanat', Icon: Palette },
  { value: 'agriculture', label: 'Agriculture', Icon: Wheat },
  { value: 'liberal', label: 'Libéral', Icon: Scale },
  { value: 'it', label: 'Informatique', Icon: Monitor },
];

const COUNTRIES = [
  { value: 'algeria', label: 'Algérie' },
  { value: 'tunisia', label: 'Tunisie' },
  { value: 'morocco', label: 'Maroc' },
  { value: 'france', label: 'France' },
];

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refCode = searchParams.get('ref');
  const intentPartner = searchParams.get('intent') === 'partner';
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'artisan' | 'entreprise'>('artisan');
  const [sector, setSector] = useState('btp');
  const [country, setCountry] = useState('algeria');
  const [showPw, setShowPw] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyRc, setCompanyRc] = useState('');
  const [companyNif, setCompanyNif] = useState('');
  const [companyNis, setCompanyNis] = useState('');
  const [companyAi, setCompanyAi] = useState('');
  const [companyCapital, setCompanyCapital] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSteps = mode === 'entreprise' ? 3 : 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) { setError('Veuillez remplir tous les champs'); return; }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Email invalide'); return; }
    if (password.length < 6) { setError('Mot de passe trop court (min 6 caractères)'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(), email: email.trim(), password, mode, sector, country, language: 'fr',
        companyInfo: mode === 'entreprise' ? {
          name: companyName.trim() || name.trim(),
          taxIds: { rc: companyRc.trim(), nif: companyNif.trim(), nis: companyNis.trim(), ai: companyAi.trim() },
          capital: companyCapital.trim(),
        } : undefined,
      };
      if (refCode) body.referralCode = refCode;
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Échec d\'inscription'); return; }
      if (intentPartner) {
        router.push('/dashboard/partner/apply');
      } else {
        router.push('/dashboard');
      }
    } catch { setError('Erreur réseau');
    } finally { setLoading(false); }
  }

  const strength = (pw: string) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const colors = ['var(--navy-3)', '#f87171', '#fbbf24', '#4a9eff', '#4ade80'];
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
    return { score: s, color: colors[s] || colors[0], label: labels[s] || '' };
  };
  const pwStr = strength(password);

  function canNext() {
    if (step === 1) return name.trim() && email.trim() && password.length >= 6 && password === confirmPassword;
    if (step === 2) return true;
    if (step === 3) return true;
    return false;
  }

  function nextStep() {
    if (step === 1 && !canNext()) { setError('Remplissez tous les champs correctement'); return; }
    setError('');
    if (step < totalSteps) setStep(step + 1);
  }

  function prevStep() { if (step > 1) setStep(step - 1); setError(''); }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--navy)]">
      <div className="w-full max-w-[420px] bg-[var(--navy-2)] border border-[rgba(245,237,214,0.08)] rounded-xl p-6 sm:p-5.5">
        <div className="text-center mb-5">
          <div className="w-11 h-11 bg-[var(--navy-3)] rounded-[10px] flex items-center justify-center mx-auto mb-3 text-lg font-extrabold text-[var(--sand)]">CD</div>
          <h1 className="text-xl font-bold text-[var(--sand)] m-0">CloudDevis</h1>
          <p className="text-[13px] text-[var(--sand-muted)] mt-1">Créez votre compte</p>
        </div>

        {refCode && (
          <div className="bg-[var(--green-glow)] text-[var(--green-3)] text-[12px] font-semibold text-center rounded-lg py-2 px-3 mb-4 border border-[rgba(0,149,77,0.2)]">
            Invitation partenaire appliquée : {refCode}
          </div>
        )}

        {error && (
          <div className="bg-[rgba(248,113,113,0.10)] text-[#f87171] text-[13px] rounded-lg py-2.5 px-3.5 text-center font-semibold mb-4">
            {error}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${step >= s ? 'bg-[var(--green-2)] text-white' : 'bg-[var(--navy-4)] text-[var(--sand-muted)]'}`}>
                {step > s ? <Check size={12} /> : s}
              </div>
              {s < totalSteps && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? 'bg-[var(--green-2)]' : 'bg-[var(--navy-4)]'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Step 1: Compte */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Nom complet</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" required
                  className="w-full bg-[var(--navy-3)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@email.com" required
                  className="w-full bg-[var(--navy-3)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 caractères" required minLength={6}
                    className="w-full bg-[var(--navy-3)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--sand-muted)] hover:text-[var(--sand)] p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center transition">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-1.5">
                    <div className="flex gap-1 mb-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex-1 h-[3px] rounded-sm transition-colors" style={{ background: i <= pwStr.score ? pwStr.color : 'var(--navy-3)' }} />
                      ))}
                    </div>
                    <p className="text-[10px] font-semibold m-0" style={{ color: pwStr.color }}>{pwStr.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Confirmer le mot de passe</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Répéter le mot de passe" required minLength={6}
                  className="w-full bg-[var(--navy-3)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" />
              </div>
            </>
          )}

          {/* Step 2: Sécurité */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Type de compte</label>
                <div className="flex gap-1.5">
                  {(['artisan', 'entreprise'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold border transition min-h-[44px] ${mode === m ? 'bg-[var(--navy-3)] text-[var(--sand)] border-[rgba(245,237,214,0.15)]' : 'bg-transparent text-[var(--sand-muted)] border-[rgba(245,237,214,0.08)] hover:bg-[var(--navy-4)]'}`}>
                      {m === 'artisan' ? 'Artisan' : 'Entreprise'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Secteur d&apos;activité</label>
                <select value={sector} onChange={e => setSector(e.target.value)}
                  className="w-full bg-[var(--navy-3)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none cursor-pointer min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]">
                  {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Pays</label>
                <select value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full bg-[var(--navy-3)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none cursor-pointer min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]">
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Step 3: Entreprise (conditional) */}
          {step === 3 && mode === 'entreprise' && (
            <div className="bg-[var(--navy-3)] rounded-lg p-3.5 space-y-3">
              <p className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider m-0">Informations entreprise</p>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Raison sociale</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nom de l'entreprise"
                  className="w-full bg-[var(--navy-2)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">RC</label><input type="text" value={companyRc} onChange={e => setCompanyRc(e.target.value)} placeholder="00-00-0000000" className="w-full bg-[var(--navy-2)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" /></div>
                <div><label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">NIF</label><input type="text" value={companyNif} onChange={e => setCompanyNif(e.target.value)} placeholder="000000000000000" className="w-full bg-[var(--navy-2)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" /></div>
                <div><label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">NIS</label><input type="text" value={companyNis} onChange={e => setCompanyNis(e.target.value)} placeholder="000000000000000" className="w-full bg-[var(--navy-2)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" /></div>
                <div><label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">AI</label><input type="text" value={companyAi} onChange={e => setCompanyAi(e.target.value)} placeholder="000000000000000" className="w-full bg-[var(--navy-2)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" /></div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--sand-muted)] mb-1.5">Capital</label>
                <input type="text" value={companyCapital} onChange={e => setCompanyCapital(e.target.value)} placeholder="1 000 000"
                  className="w-full bg-[var(--navy-2)] border border-[rgba(245,237,214,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--sand)] outline-none box-border min-h-[44px] focus:ring-2 focus:ring-[var(--green-2)]" />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-2 mt-1">
            {step > 1 && (
              <button type="button" onClick={prevStep}
                className="flex items-center justify-center gap-1 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold bg-[var(--navy-4)] text-[var(--sand-muted)] border border-[rgba(245,237,214,0.08)] transition hover:bg-[var(--navy-3)] active:scale-[0.98]">
                <ChevronLeft size={16} /> Retour
              </button>
            )}
            {step < totalSteps ? (
              <button type="button" onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] rounded-lg text-sm font-bold bg-[var(--green-2)] text-white border-none cursor-pointer transition hover:bg-[var(--green-3)] active:scale-[0.98] shadow-lg shadow-[rgba(0,122,64,0.3)]">
                Suivant <ChevronRight size={16} />
              </button>
            ) : (
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 min-h-[44px] rounded-lg text-sm font-bold border border-[rgba(245,237,214,0.08)] cursor-pointer bg-[var(--navy-3)] text-[var(--sand)] transition hover:bg-[var(--navy-4)] disabled:opacity-50 disabled:cursor-default active:scale-[0.98]">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Inscription...
                  </span>
                ) : 'Créer mon compte'}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-xs text-[var(--sand-muted)] mt-4">
          Déjà un compte ?{' '}
          <a href="/auth/login" className="text-[var(--sand-muted)] font-semibold no-underline hover:text-[var(--sand)] transition">Se connecter</a>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy)]">
        <Loader2 size={28} className="animate-spin text-[var(--sand-muted)]" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
