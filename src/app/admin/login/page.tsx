'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, LockKeyhole, Eye, EyeOff, Loader2 } from 'lucide-react';

const ACCENT = '#3b6fe0';
const ACCENT_2 = '#2563eb';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, string> = { email, password };
      if (redirectParam) body.redirect = redirectParam;

      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.status === 429) {
        setError('Trop de tentatives. Réessayez dans une minute.');
        return;
      }

      if (!res.ok) {
        setError('Identifiants incorrects ou accès non autorisé');
        return;
      }

      const target = data.redirect || '/admin';
      router.push(target);
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(120% 120% at 50% 0%, #0e1424 0%, #0a0d16 45%, #070910 100%)' }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[420px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(59,111,224,0.18) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
      {/* Fine grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(#9fb3e0 1px, transparent 1px), linear-gradient(90deg, #9fb3e0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div
        className={`relative w-full max-w-[380px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div
          className="rounded-2xl p-7 sm:p-8"
          style={{
            background: 'linear-gradient(180deg, rgba(22,28,42,0.85) 0%, rgba(15,19,30,0.85) 100%)',
            border: '1px solid rgba(96,128,200,0.16)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="text-center mb-7">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
              style={{
                background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
                boxShadow: `0 10px 30px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
            >
              <LockKeyhole className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(59,111,224,0.1)', border: '1px solid rgba(59,111,224,0.2)' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: ACCENT }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#9fb3e0' }}>
                Espace sécurisé
              </span>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight" style={{ color: '#eef2fa' }}>
              CloudDevis <span style={{ color: ACCENT }}>Admin</span>
            </h1>
            <p className="text-[12.5px] mt-1.5" style={{ color: '#6b7794' }}>
              Accès réservé à l&apos;équipe CloudDevis
            </p>
          </div>

          {error && (
            <div
              className="mb-4 text-[12px] text-center font-semibold rounded-xl py-2.5 px-3"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#fca5a5',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#8b97b4' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@clouddevis.io"
                autoComplete="username"
                disabled={loading}
                className="w-full px-3.5 text-sm rounded-xl outline-none transition-all min-h-[46px] disabled:opacity-40 focus:border-[#3b6fe0]"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(96,128,200,0.18)',
                  color: '#e7ecf6',
                }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#8b97b4' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full px-3.5 text-sm rounded-xl outline-none transition-all min-h-[46px] disabled:opacity-40 focus:border-[#3b6fe0]"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(96,128,200,0.18)',
                    color: '#e7ecf6',
                    paddingRight: 46,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg flex items-center justify-center transition disabled:opacity-40 hover:bg-white/5"
                  style={{ width: 40, height: 40, background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7794' }}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[48px] active:scale-[0.98] hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
                color: '#fff',
                border: 'none',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accéder au tableau de bord'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] mt-6 flex items-center justify-center gap-1.5" style={{ color: '#4a5470' }}>
          <ShieldCheck className="w-3 h-3" />
          Session sécurisée · 12h max · Connexion chiffrée
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#070910' }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#3b6fe0' }} />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
