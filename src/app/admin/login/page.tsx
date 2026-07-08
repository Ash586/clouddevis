'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, CornerDownLeft, AlertTriangle } from 'lucide-react';

/* ── Midnight Slate tokens (mirrors admin.css) ── */
const BG = '#0b0d12';
const SURFACE = '#14171e';
const SURFACE_2 = '#1d202a';
const SURFACE_3 = '#282c38';
const ACCENT = '#4a9eff';
const TEXT = '#e8ebf0';
const TEXT_2 = '#a1a5ad';
const TEXT_3 = '#656a73';
const BORDER = 'rgba(255,255,255,0.08)';
const RED = '#f87171';
const AMBER = '#fbbf24';
const GREEN = '#4ade80';

const SORA = "'Sora', system-ui, -apple-system, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', monospace";

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

  // local presentation-only state (does not affect the auth contract)
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const detectCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

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

  const fieldBase: React.CSSProperties = {
    width: '100%',
    minHeight: 48,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 14,
    fontFamily: SORA,
    borderRadius: 10,
    background: SURFACE_2,
    color: TEXT,
    border: `1px solid ${BORDER}`,
    outline: 'none',
    transition: 'border-color .18s ease, box-shadow .18s ease, background .18s ease',
  };

  const focusRing = (active: boolean): React.CSSProperties =>
    active
      ? {
          borderColor: 'rgba(74,158,255,0.55)',
          boxShadow: `0 0 0 3px rgba(74,158,255,0.16)`,
          background: SURFACE_3,
        }
      : {};

  return (
    <div
      className="admin-login-root"
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: SORA,
        background: BG,
      }}
    >
      <style>{`
        .admin-login-root *::selection { background: rgba(74,158,255,0.28); color: #fff; }
        .admin-login-root input::placeholder { color: ${TEXT_3}; opacity: 1; }
        .admin-login-root input:-webkit-autofill,
        .admin-login-root input:-webkit-autofill:focus {
          -webkit-text-fill-color: ${TEXT};
          -webkit-box-shadow: 0 0 0 1000px ${SURFACE_2} inset;
          caret-color: ${TEXT};
          transition: background-color 9999s ease-out 0s;
        }
        .al-focusable:focus-visible {
          outline: 2px solid ${ACCENT};
          outline-offset: 2px;
        }
        @keyframes al-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes al-shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
        }
        .al-rise { animation: al-rise .55s cubic-bezier(.22,1,.36,1) both; }
        .al-shake { animation: al-shake .4s cubic-bezier(.36,.07,.19,.97) both; }
        .al-press { transition: transform .12s ease, filter .18s ease, box-shadow .18s ease; }
        .al-press:not(:disabled):active { transform: scale(.985); }
        @media (prefers-reduced-motion: reduce) {
          .al-rise, .al-shake { animation: none !important; }
          .al-press { transition: none !important; }
          .admin-login-root * { transition: none !important; }
        }
      `}</style>

      {/* Ambient: single restrained accent wash from top */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -260,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 760,
          height: 520,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(74,158,255,0.10) 0%, transparent 70%)',
        }}
      />
      {/* Fine technical grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.45,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 38%, #000 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 38%, #000 0%, transparent 100%)',
        }}
      />

      <div
        className={mounted ? 'al-rise' : ''}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 408,
          opacity: mounted ? 1 : 0,
        }}
      >
        {/* Brand lockup */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 26 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)',
              marginBottom: 18,
              position: 'relative',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: -1,
                borderRadius: 14,
                padding: 1,
                background: 'linear-gradient(160deg, rgba(74,158,255,0.5), transparent 55%)',
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                pointerEvents: 'none',
              }}
            />
            <Lock style={{ width: 22, height: 22, color: ACCENT }} strokeWidth={2.1} />
          </div>

          <h1
            style={{
              fontFamily: SORA,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: TEXT,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Rakmana
          </h1>
          <div
            style={{
              marginTop: 9,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(74,158,255,0.08)',
              border: '1px solid rgba(74,158,255,0.18)',
            }}
          >
            <ShieldCheck style={{ width: 12, height: 12, color: ACCENT }} strokeWidth={2.4} />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: ACCENT,
              }}
            >
              Console Admin
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            borderRadius: 16,
            padding: 28,
            background: `linear-gradient(180deg, ${SURFACE} 0%, #11141b 100%)`,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.55)',
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <h2
              style={{
                fontFamily: SORA,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: TEXT,
                margin: 0,
              }}
            >
              Connexion sécurisée
            </h2>
            <p style={{ fontFamily: SORA, fontSize: 12.5, color: TEXT_2, margin: '5px 0 0', lineHeight: 1.45 }}>
              Accès réservé à l&apos;équipe Rakmana.
            </p>
          </div>

          {error && (
            <div
              key={error}
              role="alert"
              className="al-shake"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 9,
                marginBottom: 18,
                padding: '11px 13px',
                borderRadius: 10,
                background: 'rgba(248,113,113,0.09)',
                border: '1px solid rgba(248,113,113,0.22)',
              }}
            >
              <AlertTriangle style={{ width: 15, height: 15, color: RED, flexShrink: 0, marginTop: 1 }} strokeWidth={2.2} />
              <span style={{ fontFamily: SORA, fontSize: 12.5, fontWeight: 500, color: '#fca5a5', lineHeight: 1.4 }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                style={{
                  display: 'block',
                  fontFamily: SORA,
                  fontSize: 11.5,
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  color: TEXT_2,
                  marginBottom: 7,
                }}
              >
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    color: emailFocused ? ACCENT : TEXT_3,
                    transition: 'color .18s ease',
                    pointerEvents: 'none',
                  }}
                  strokeWidth={2}
                />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  placeholder="admin@clouddevis.io"
                  autoComplete="username"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={loading}
                  className="al-focusable"
                  style={{
                    ...fieldBase,
                    ...focusRing(emailFocused),
                    opacity: loading ? 0.5 : 1,
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                style={{
                  display: 'block',
                  fontFamily: SORA,
                  fontSize: 11.5,
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  color: TEXT_2,
                  marginBottom: 7,
                }}
              >
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    color: passwordFocused ? ACCENT : TEXT_3,
                    transition: 'color .18s ease',
                    pointerEvents: 'none',
                  }}
                  strokeWidth={2}
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => { setPasswordFocused(false); setCapsLock(false); }}
                  onKeyDown={detectCaps}
                  onKeyUp={detectCaps}
                  required
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  aria-describedby={capsLock ? 'admin-caps-hint' : undefined}
                  className="al-focusable"
                  style={{
                    ...fieldBase,
                    ...focusRing(passwordFocused),
                    paddingRight: 48,
                    opacity: loading ? 0.5 : 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={loading}
                  className="al-focusable"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={showPassword}
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    background: 'transparent',
                    border: 'none',
                    color: TEXT_3,
                    cursor: loading ? 'default' : 'pointer',
                    transition: 'color .15s ease, background .15s ease',
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_3; e.currentTarget.style.background = 'transparent'; }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>

              {/* Live Caps-Lock warning */}
              {capsLock && (
                <div
                  id="admin-caps-hint"
                  role="status"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 8,
                    fontFamily: MONO,
                    fontSize: 11,
                    color: AMBER,
                  }}
                >
                  <AlertTriangle style={{ width: 13, height: 13 }} strokeWidth={2.3} />
                  Verr. Maj activé
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="al-press al-focusable"
              style={{
                width: '100%',
                minHeight: 48,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                borderRadius: 10,
                fontFamily: SORA,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.005em',
                color: '#fff',
                border: '1px solid rgba(74,158,255,0.5)',
                background: loading
                  ? 'linear-gradient(180deg, #3a7fd0 0%, #2f6cb8 100%)'
                  : 'linear-gradient(180deg, #5aa8ff 0%, #4a9eff 100%)',
                boxShadow: loading ? 'none' : '0 1px 0 rgba(255,255,255,0.25) inset, 0 8px 22px rgba(74,158,255,0.28)',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.85 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1.07)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  <span>Vérification…</span>
                </>
              ) : (
                'Accéder au tableau de bord'
              )}
            </button>

            {/* ⏎-to-submit keyboard hint */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                marginTop: 2,
                fontFamily: MONO,
                fontSize: 11,
                color: TEXT_3,
                opacity: loading ? 0 : 1,
                transition: 'opacity .2s ease',
              }}
            >
              <span>Appuyez sur</span>
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 7px',
                  borderRadius: 6,
                  background: SURFACE_2,
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
                  color: TEXT_2,
                  fontFamily: MONO,
                  fontSize: 10.5,
                  lineHeight: 1,
                }}
              >
                <CornerDownLeft style={{ width: 11, height: 11 }} strokeWidth={2.2} />
                Entrée
              </kbd>
              <span>pour continuer</span>
            </div>
          </form>
        </div>

        {/* Footer trust strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 22,
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: '0.02em',
            color: TEXT_3,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: GREEN,
              boxShadow: `0 0 8px ${GREEN}`,
            }}
          />
          <span>Connexion chiffrée</span>
          <span style={{ color: 'rgba(255,255,255,0.14)' }}>·</span>
          <span>Session 12 h</span>
          <span style={{ color: 'rgba(255,255,255,0.14)' }}>·</span>
          <span>Journalisée</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100svh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: BG,
          }}
        >
          <Loader2 style={{ width: 24, height: 24, color: ACCENT }} className="animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
