'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Loader2, ShieldCheck, Users, TrendingUp, DollarSign, Share2 } from 'lucide-react';

export default function PartnerApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    wilaya: '',
    sector: '',
    platforms: '',
    audienceSize: '',
    howPromote: '',
    payoutMethodPreference: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body = {
        ...form,
        stats: {
          fullName: form.fullName,
          wilaya: form.wilaya,
          sector: form.sector,
          platforms: form.platforms,
          audienceSize: form.audienceSize || undefined,
          howPromote: form.howPromote,
          payoutMethodPreference: form.payoutMethodPreference || undefined,
        },
      };

      const res = await fetch('/api/partner/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }

      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--navy)' }}>
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--green-3)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--sand)' }}>Demande envoyée !</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--sand-muted)' }}>Votre demande de partenariat a été reçue. Nous vous contacterons après examen.</p>
          <button onClick={() => router.push('/dashboard')} className="text-sm font-semibold min-h-[44px] px-6 py-2.5 rounded-lg" style={{ color: 'var(--green-3)' }}>
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const cardBg = 'var(--navy-2, #111827)';
  const cardBorder = 'rgba(245,237,214,0.06)';
  const textColor = 'var(--sand)';
  const mutedColor = 'var(--sand-muted)';
  const inputBg = 'var(--navy-3, #1C2537)';

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: 'var(--navy)' }}>
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-6 min-h-[44px]"
          style={{ color: mutedColor, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,98,51,0.15)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--green-3)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: textColor }}>Gagnez 20% sur chaque abonnement activé</h1>
              <p className="text-sm" style={{ color: mutedColor }}>Rejoignez le programme d&apos;affiliation CloudDevis</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <DollarSign className="w-5 h-5" />, title: '20%', desc: 'Commission directe' },
            { icon: <Share2 className="w-5 h-5" />, title: 'Lien unique', desc: 'Code personnel' },
            { icon: <Users className="w-5 h-5" />, title: 'Illimité', desc: 'Parrainages' },
            { icon: <ShieldCheck className="w-5 h-5" />, title: 'Transparent', desc: 'Suivi en temps réel' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="flex justify-center mb-2" style={{ color: 'var(--green-3)' }}>{item.icon}</div>
              <p className="text-lg font-bold" style={{ color: textColor }}>{item.title}</p>
              <p className="text-[10px] font-semibold" style={{ color: mutedColor }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: mutedColor }}>Nom complet</label>
              <input
                type="text"
                required
                className="w-full rounded-lg px-3.5 text-sm outline-none min-h-[44px]"
                style={{ background: inputBg, border: `1px solid ${cardBorder}`, color: textColor }}
                placeholder="Votre nom et prénom"
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: mutedColor }}>Wilaya</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg px-3.5 text-sm outline-none min-h-[44px]"
                  style={{ background: inputBg, border: `1px solid ${cardBorder}`, color: textColor }}
                  placeholder="Ex: Alger"
                  value={form.wilaya}
                  onChange={e => setForm(p => ({ ...p, wilaya: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: mutedColor }}>Secteur d&apos;activité</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg px-3.5 text-sm outline-none min-h-[44px]"
                  style={{ background: inputBg, border: `1px solid ${cardBorder}`, color: textColor }}
                  placeholder="Ex: BTP, Commerce"
                  value={form.sector}
                  onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: mutedColor }}>Plateformes utilisées</label>
              <input
                type="text"
                className="w-full rounded-lg px-3.5 text-sm outline-none min-h-[44px]"
                style={{ background: inputBg, border: `1px solid ${cardBorder}`, color: textColor }}
                placeholder="Ex: Facebook, Instagram, YouTube, blog..."
                value={form.platforms}
                onChange={e => setForm(p => ({ ...p, platforms: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: mutedColor }}>Taille d&apos;audience (optionnel)</label>
                <input
                  type="text"
                  className="w-full rounded-lg px-3.5 text-sm outline-none min-h-[44px]"
                  style={{ background: inputBg, border: `1px solid ${cardBorder}`, color: textColor }}
                  placeholder="Ex: 5000"
                  value={form.audienceSize}
                  onChange={e => setForm(p => ({ ...p, audienceSize: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: mutedColor }}>Mode de paiement souhaité</label>
                <input
                  type="text"
                  className="w-full rounded-lg px-3.5 text-sm outline-none min-h-[44px]"
                  style={{ background: inputBg, border: `1px solid ${cardBorder}`, color: textColor }}
                  placeholder="Ex: CCP, BaridiMob"
                  value={form.payoutMethodPreference}
                  onChange={e => setForm(p => ({ ...p, payoutMethodPreference: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: mutedColor }}>Comment allez-vous promouvoir CloudDevis ?</label>
              <textarea
                required
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none min-h-[44px]"
                style={{ background: inputBg, border: `1px solid ${cardBorder}`, color: textColor, minHeight: 80 }}
                rows={3}
                placeholder="Décrivez votre stratégie de promotion..."
                value={form.howPromote}
                onChange={e => setForm(p => ({ ...p, howPromote: e.target.value }))}
              />
            </div>

            {error && (
              <div
                className="text-[12px] text-center font-semibold rounded-lg py-2.5 px-3"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg text-sm font-semibold min-h-[44px] transition-all active:scale-[0.98]"
              style={{
                background: 'var(--green-2, #006233)',
                color: '#fff',
                border: 'none',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Envoyer ma demande
            </button>
          </form>
        </div>

        <div
          className="rounded-xl p-4 mt-6 text-center"
          style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.1)' }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: mutedColor }}>
            Votre commission est calculée uniquement après activation d&apos;un abonnement payé par l&apos;utilisateur que vous avez parrainé.
            Le paiement minimum est de 2 000 DA.
          </p>
        </div>
      </div>
    </div>
  );
}
