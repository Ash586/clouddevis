'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, LockKeyhole, Eye, EyeOff, Loader2 } from 'lucide-react';

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
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0b0d12' }}
    >
      <div
        className={`w-full max-w-[360px] transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      >
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(107,128,178,0.08)', border: '1px solid rgba(107,128,178,0.12)' }}
          >
            <LockKeyhole className="w-6 h-6" style={{ color: '#6b80b2' }} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4" style={{ color: '#6b80b2' }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: '#6b80b2' }}
            >
              Admin sécurisé
            </span>
          </div>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: '#c8cdd8' }}
          >
            CloudDevis Admin
          </h1>
          <p
            className="text-[12px] mt-1"
            style={{ color: '#505870' }}
          >
            Accès réservé à l&apos;équipe CloudDevis
          </p>
        </div>

        {error && (
          <div
            className="mb-4 text-[12px] text-center font-semibold rounded-lg py-2.5 px-3"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              className="block text-[11px] font-semibold mb-1.5"
              style={{ color: '#505870' }}
            >
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
              className="w-full px-3.5 text-sm rounded-lg outline-none transition-all min-h-[44px] disabled:opacity-40"
              style={{
                background: '#131720',
                border: '1px solid rgba(107,128,178,0.12)',
                color: '#c8cdd8',
              }}
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold mb-1.5"
              style={{ color: '#505870' }}
            >
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
                className="w-full px-3.5 text-sm rounded-lg outline-none transition-all min-h-[44px] disabled:opacity-40"
                style={{
                  background: '#131720',
                  border: '1px solid rgba(107,128,178,0.12)',
                  color: '#c8cdd8',
                  paddingRight: 44,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                style={{ width: 44, height: 44, background: 'transparent', border: 'none', cursor: 'pointer', color: '#505870' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all duration-200 min-h-[44px] active:scale-[0.98]"
            style={{
              background: '#6b80b2',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrer'}
          </button>
        </form>

        <p className="text-center text-[11px] mt-6" style={{ color: '#3a4058' }}>
          Session sécurisée · 12h max
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0d12' }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#505870' }} />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
