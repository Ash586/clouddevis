'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
    background: '#282c38', border: '0.5px solid rgba(255,255,255,0.08)',
    color: '#e8ebf0', outline: 'none', boxSizing: 'border-box',
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSent(true);
    } catch { setError('Erreur réseau');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#0b0d12' }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#e8ebf0', margin: '0 0 8px' }}>Mot de passe oublié</h1>
        {sent ? (
          <p style={{ fontSize: 13, color: '#a1a5ad' }}>Si cet email existe, un lien de réinitialisation a été envoyé.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.10)', color: '#f87171', fontSize: 13, borderRadius: 8, padding: '10px 14px', fontWeight: 600, marginBottom: 12 }}>{error}</div>
            )}
            <p style={{ fontSize: 13, color: '#656a73', marginBottom: 16 }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            <div style={{ textAlign: 'left', marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#656a73', display: 'block', marginBottom: 5 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@email.com" required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 700,
                border: '0.5px solid rgba(255,255,255,0.08)', cursor: loading ? 'default' : 'pointer',
                background: '#1d202a', color: '#e8ebf0', opacity: loading ? 0.5 : 1,
              }}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
        <a href="/auth/login" style={{ display: 'block', fontSize: 12, color: '#a1a5ad', fontWeight: 600, marginTop: 20, textDecoration: 'none' }}>
          ← Retour à la connexion
        </a>
      </div>
    </div>
  );
}
