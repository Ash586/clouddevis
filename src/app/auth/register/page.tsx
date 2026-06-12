'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
    background: '#282c38', border: '0.5px solid rgba(255,255,255,0.08)',
    color: '#e8ebf0', outline: 'none', boxSizing: 'border-box',
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#656a73', display: 'block', marginBottom: 5 };

  const sectors = [
    { value: 'btp', label: '🏗️ BTP' }, { value: 'moving', label: '🚛 Déménagement' },
    { value: 'cleaning', label: '🧹 Nettoyage' }, { value: 'hotel', label: '🏨 Hôtellerie' },
    { value: 'auto', label: '🔧 Automobile' }, { value: 'health', label: '🏥 Santé' },
    { value: 'training', label: '📚 Formation' }, { value: 'realestate', label: '🏠 Immobilier' },
    { value: 'transport', label: '🚌 Transport' }, { value: 'craft', label: '🎨 Artisanat' },
    { value: 'agriculture', label: '🌾 Agriculture' }, { value: 'liberal', label: '⚖️ Libéral' },
    { value: 'it', label: '💻 Informatique' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) { setError('Veuillez remplir tous les champs'); return; }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Email invalide'); return; }
    if (password.length < 6) { setError('Mot de passe trop court (min 6 caractères)'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), email: email.trim(), password, mode, sector, country, language: 'fr',
          companyInfo: mode === 'entreprise' ? {
            name: companyName.trim() || name.trim(),
            taxIds: { rc: companyRc.trim(), nif: companyNif.trim(), nis: companyNis.trim(), ai: companyAi.trim() },
            capital: companyCapital.trim(),
          } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Échec d\'inscription'); return; }
      router.push('/dashboard');
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
    const colors = ['#282c38', '#f87171', '#fbbf24', '#4a9eff', '#4ade80'];
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
    return { score: s, color: colors[s] || colors[0], label: labels[s] || '' };
  };
  const pwStr = strength(password);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#0b0d12' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px 22px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, background: '#1d202a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 18, fontWeight: 800, color: '#e8ebf0' }}>CD</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>CloudDevis</h1>
          <p style={{ fontSize: 13, color: '#656a73', marginTop: 4 }}>Créez votre compte</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.10)', color: '#f87171', fontSize: 13, borderRadius: 8, padding: '10px 14px', textAlign: 'center', fontWeight: 600, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Nom complet</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@email.com" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 caractères" required minLength={6} style={inputStyle} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#656a73', fontSize: 13 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {password.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStr.score ? pwStr.color : '#282c38', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <p style={{ fontSize: 10, fontWeight: 600, color: pwStr.color, margin: 0 }}>{pwStr.label}</p>
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Confirmer le mot de passe</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Répéter le mot de passe" required minLength={6} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Type de compte</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['artisan', 'entreprise'].map(m => (
                <button key={m} type="button" onClick={() => setMode(m as typeof mode)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                    background: mode === m ? '#1d202a' : 'transparent',
                    color: mode === m ? '#e8ebf0' : '#656a73',
                  }}>
                  {m === 'artisan' ? '👤 Artisan' : '🏢 Entreprise'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'entreprise' && (
            <div style={{ background: '#1d202a', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#656a73', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Informations entreprise</p>
              <div>
                <label style={labelStyle}>Raison sociale</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nom de l'entreprise" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>RC</label><input type="text" value={companyRc} onChange={e => setCompanyRc(e.target.value)} placeholder="00-00-0000000" style={inputStyle} /></div>
                <div><label style={labelStyle}>NIF</label><input type="text" value={companyNif} onChange={e => setCompanyNif(e.target.value)} placeholder="000000000000000" style={inputStyle} /></div>
                <div><label style={labelStyle}>NIS</label><input type="text" value={companyNis} onChange={e => setCompanyNis(e.target.value)} placeholder="000000000000000" style={inputStyle} /></div>
                <div><label style={labelStyle}>AI</label><input type="text" value={companyAi} onChange={e => setCompanyAi(e.target.value)} placeholder="000000000000000" style={inputStyle} /></div>
              </div>
              <div>
                <label style={labelStyle}>Capital</label>
                <input type="text" value={companyCapital} onChange={e => setCompanyCapital(e.target.value)} placeholder="1 000 000" style={inputStyle} />
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Secteur d'activité</label>
            <select value={sector} onChange={e => setSector(e.target.value)} style={selectStyle}>
              {sectors.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Pays</label>
            <select value={country} onChange={e => setCountry(e.target.value)} style={selectStyle}>
              <option value="algeria">🇩🇿 Algérie</option>
              <option value="tunisia">🇹🇳 Tunisie</option>
              <option value="morocco">🇲🇦 Maroc</option>
              <option value="france">🇫🇷 France</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 700,
              border: '0.5px solid rgba(255,255,255,0.08)', cursor: loading ? 'default' : 'pointer',
              background: '#1d202a', color: '#e8ebf0', opacity: loading ? 0.5 : 1, marginTop: 4,
            }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid #e8ebf0', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Inscription...
              </span>
            ) : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#656a73', marginTop: 16 }}>
          Déjà un compte ?{' '}
          <a href="/auth/login" style={{ color: '#a1a5ad', fontWeight: 600, textDecoration: 'none' }}>Se connecter</a>
        </p>
      </div>
    </div>
  );
}
