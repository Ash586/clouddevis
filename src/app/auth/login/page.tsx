'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(searchParams.get('error') || '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Échec de connexion'); return; }
      router.push('/dashboard');
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
    background: '#282c38', border: '0.5px solid rgba(255,255,255,0.08)',
    color: '#e8ebf0', outline: 'none', boxSizing: 'border-box',
  };

  const oauthError =
    error === 'oauth_canceled' ? 'Connexion annulée' :
    error === 'oauth_invalid_state' ? 'Erreur de sécurité OAuth' :
    error === 'oauth_failed' ? 'Échec de connexion OAuth' :
    error === 'oauth_invalid_provider' ? 'Fournisseur non supporté' :
    error === 'oauth_error' ? 'Erreur OAuth' :
    null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#0b0d12' }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, background: '#1d202a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 18, fontWeight: 800, color: '#e8ebf0' }}>CD</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>CloudDevis</h1>
          <p style={{ fontSize: 13, color: '#656a73', marginTop: 4 }}>Connectez-vous à votre compte</p>
        </div>

        {(error || oauthError) && (
          <div style={{
            background: oauthError ? 'rgba(251,191,36,0.10)' : 'rgba(248,113,113,0.10)',
            color: oauthError ? '#fbbf24' : '#f87171',
            fontSize: 13, borderRadius: 8, padding: '10px 14px', textAlign: 'center', fontWeight: 600, marginBottom: 16,
          }}>
            {oauthError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#656a73', display: 'block', marginBottom: 5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@email.com" required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#656a73', display: 'block', marginBottom: 5 }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={inputStyle} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#656a73', fontSize: 13 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: '#e8ebf0', width: 15, height: 15 }} />
              <span style={{ color: '#a1a5ad' }}>Se souvenir de moi</span>
            </label>
            <a href="/auth/forgot-password" style={{ color: '#a1a5ad', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              Mot de passe oublié ?
            </a>
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 700,
              border: '0.5px solid rgba(255,255,255,0.08)', cursor: loading ? 'default' : 'pointer',
              background: '#1d202a', color: '#e8ebf0', opacity: loading ? 0.5 : 1,
            }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid #e8ebf0', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Connexion...
              </span>
            ) : 'Se connecter'}
          </button>
        </form>

        <div style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
          <span style={{ fontSize: 11, color: '#656a73', background: '#14171e', padding: '0 10px', position: 'relative', zIndex: 1 }}>ou continuer avec</span>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '0.5px solid rgba(255,255,255,0.06)', zIndex: 0 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href="/api/auth/oauth/google"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer',
              background: 'transparent', color: '#e8ebf0', textDecoration: 'none',
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </a>
          <a href="/api/auth/oauth/github"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer',
              background: 'transparent', color: '#e8ebf0', textDecoration: 'none',
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8ebf0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02.01 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/></svg>
            GitHub
          </a>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#656a73', marginTop: 20 }}>
          Pas encore de compte ?{' '}
          <a href="/auth/register" style={{ color: '#a1a5ad', fontWeight: 600, textDecoration: 'none' }}>S'inscrire</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0d12' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #656a73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
