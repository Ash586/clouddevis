'use client';

// ============================================================
// CloudDevis — Post-OAuth Onboarding
// First Google/GitHub login lands here: one screen, one choice —
// Artisan or Entreprise — so each user only sees what they need.
// The account already exists (mode defaults to ARTISAN); picking
// a card PUTs the mode then continues to the app. Never blocking:
// a discreet skip link keeps the default.
// ============================================================

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Hammer, Building2, ArrowRight, Loader2 } from 'lucide-react';

type Mode = 'ARTISAN' | 'ENTREPRISE';

const CARDS: Array<{
  mode: Mode;
  icon: typeof Hammer;
  title: string;
  desc: string;
  points: string[];
}> = [
  {
    mode: 'ARTISAN',
    icon: Hammer,
    title: 'Artisan',
    desc: 'Je travaille à mon compte',
    points: ['Devis et factures simplifiés', 'NIF personnel (11 chiffres)', 'Interface allégée'],
  },
  {
    mode: 'ENTREPRISE',
    icon: Building2,
    title: 'Entreprise',
    desc: 'Je gère une société',
    points: ['NIF, RC, NIS, AI complets', 'RIB et coordonnées bancaires', 'Tous les types de documents'],
  },
];

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromMobile = searchParams.get('from') === 'mobile';
  const destination = fromMobile ? '/mobile' : '/dashboard';

  const [saving, setSaving] = useState<Mode | null>(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // Must be authenticated (the OAuth callback just set the cookie).
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.status !== 200) router.replace('/auth/login');
        else setChecking(false);
      })
      .catch(() => router.replace('/auth/login'));
  }, [router]);

  async function choose(mode: Mode) {
    if (saving) return;
    setSaving(mode);
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error('save failed');
      router.push(destination);
    } catch {
      setError('Impossible d’enregistrer votre choix. Réessayez.');
      setSaving(null);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy)]">
        <Loader2 size={28} className="animate-spin text-[var(--green-2)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--navy)]">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--green-2)] flex items-center justify-center">
            <span className="text-white font-bold text-lg">CD</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--sand)]">Bienvenue sur CloudDevis 👋</h1>
          <p className="text-sm text-[var(--sand-muted)] mt-1.5">
            Une dernière question pour adapter l’application à votre activité
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Type de compte">
          {CARDS.map(({ mode, icon: Icon, title, desc, points }) => (
            <button
              key={mode}
              type="button"
              onClick={() => choose(mode)}
              disabled={saving !== null}
              className="group text-left p-5 rounded-2xl bg-[var(--navy-2)] border border-[rgba(15,39,71,0.08)] hover:border-[var(--green-2)] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[var(--green-2)] outline-none"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--blue-bg)] flex items-center justify-center mb-3">
                {saving === mode
                  ? <Loader2 size={22} className="animate-spin text-[var(--green-2)]" />
                  : <Icon size={22} className="text-[var(--green-2)]" />}
              </div>
              <p className="text-[15px] font-bold text-[var(--sand)]">{title}</p>
              <p className="text-xs text-[var(--sand-muted)] mt-0.5 mb-3">{desc}</p>
              <ul className="space-y-1">
                {points.map((p) => (
                  <li key={p} className="text-[11px] text-[var(--sand-muted)] flex items-start gap-1.5">
                    <span className="text-[var(--green-2)] mt-px">·</span>{p}
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--green-2)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Choisir <ArrowRight size={13} className="rtl:rotate-180" />
              </span>
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-400 text-center mt-4">{error}</p>}

        <p className="text-[11px] text-[var(--sand-muted)] text-center mt-6">
          Vous pourrez changer à tout moment depuis votre profil.{' '}
          <button
            type="button"
            onClick={() => router.push(destination)}
            className="underline hover:text-[var(--sand)] transition-colors"
          >
            Passer cette étape
          </button>
        </p>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--navy)]">
          <Loader2 size={28} className="animate-spin text-[var(--green-2)]" />
        </div>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
}
