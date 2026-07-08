'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, CheckCheck, MousePointerClick, Users, TrendingUp, ExternalLink, ArrowUpRight, ShieldCheck, Clock } from 'lucide-react';

interface PartnerData {
  partner: { id: string; code: string; tier: string; status: string; parent: { id: string; code: string; user: { name: string } } | null };
  stats: {
    clicks: number;
    totalReferrals: number;
    convertedReferrals: number;
    conversionRate: number;
    childrenCount: number;
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    commissionRate: number;
    minimumPayout: number;
    nextPayoutAvailable: boolean;
  };
  recentReferrals: { id: string; maskedEmail: string; status: string; createdAt: string }[];
  recentCommissions: { id: string; amount: number; type: string; status: string; createdAt: string }[];
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetch('/api/partner/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--navy)' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--green-3)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--navy)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(30,64,175,0.1)' }}>
            <ShieldCheck className="w-8 h-8" style={{ color: 'var(--green-3)' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--sand)' }}>Vous n&apos;êtes pas encore partenaire</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--sand-muted)' }}>Rejoignez le programme d&apos;affiliation Rakmana et gagnez des commissions.</p>
          <button type="button"             onClick={() => router.push('/dashboard/partner/apply')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white min-h-[44px]"
            style={{ background: 'var(--green-2, #1E40AF)' }}
          >
            Devenir partenaire
          </button>
        </div>
      </div>
    );
  }

  if (data.partner.status === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--navy)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(212,168,67,0.1)' }}>
            <Clock className="w-8 h-8" style={{ color: 'var(--gold)' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--sand)' }}>Demande en cours d&apos;examen</h1>
          <p className="text-sm" style={{ color: 'var(--sand-muted)' }}>Votre demande de partenariat est en attente de validation par notre équipe. Vous serez notifié dès qu&apos;elle sera approuvée.</p>
        </div>
      </div>
    );
  }

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${data.partner.code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.partner.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isSuper = data.partner.tier === 'SUPER_AFFILIATE';
  const minPayout = data.stats.minimumPayout || 2000;
  const pendingAmount = data.stats.pendingCommissions;
  const payoutProgress = Math.min(100, Math.round((pendingAmount / minPayout) * 100));

  const cardBg = 'var(--navy-2, #111827)';
  const cardBorder = 'rgba(15,39,71,0.06)';
  const textColor = 'var(--sand)';
  const mutedColor = 'var(--sand-muted)';

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: 'var(--navy)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: textColor }}>Espace Partenaire</h1>
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              {isSuper && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold me-2" style={{ background: 'rgba(30,64,175,0.15)', color: 'var(--green-3)' }}>Super Affiliate</span>}
              Taux de commission : <span className="font-bold" style={{ color: 'var(--green-3)' }}>{data.stats.commissionRate || 20}%</span>
            </p>
          </div>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: mutedColor }}>Votre code de parrainage</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="text-2xl font-mono font-black tracking-widest px-4 py-2 rounded-lg select-all"
              style={{ background: 'var(--navy-3, #1C2537)', color: 'var(--green-3)' }}
            >
              {data.partner.code}
            </div>
            <button type="button"               onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold min-h-[44px] transition-all active:scale-[0.98]"
              style={{
                background: copiedCode ? 'var(--green-3)' : 'var(--navy-3, #1C2537)',
                color: copiedCode ? '#fff' : mutedColor,
                border: `1px solid ${cardBorder}`,
              }}
            >
              {copiedCode ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Copié !' : 'Copier le code'}
            </button>
            <button type="button"               onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold min-h-[44px] transition-all active:scale-[0.98]"
              style={{
                background: copiedLink ? 'var(--green-3)' : 'var(--green-2, #1E40AF)',
                color: '#fff',
                border: 'none',
              }}
            >
              {copiedLink ? <CheckCheck className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              {copiedLink ? 'Copié !' : 'Copier le lien'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: <MousePointerClick className="w-5 h-5" />, value: data.stats.clicks || 0, label: 'Clics', color: 'var(--green-3)' },
            { icon: <Users className="w-5 h-5" />, value: data.stats.totalReferrals, label: 'Inscriptions', color: 'var(--gold)' },
            { icon: <TrendingUp className="w-5 h-5" />, value: data.stats.convertedReferrals, label: 'Abonnements', color: 'var(--green-3)' },
            { icon: <ArrowUpRight className="w-5 h-5" />, value: `${data.stats.conversionRate}%`, label: 'Conversion', color: '#a78bfa' },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <div className="mb-2" style={{ color: card.color }}>{card.icon}</div>
              <p className="text-2xl font-bold" style={{ color: textColor }}>{card.value}</p>
              <p className="text-xs font-semibold" style={{ color: mutedColor }}>{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'En attente', value: pendingAmount, color: 'var(--gold)' },
            { label: 'Payé', value: data.stats.paidCommissions, color: 'var(--green-3)' },
            { label: 'Total', value: data.stats.totalCommissions, color: textColor },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: mutedColor }}>{item.label}</p>
              <p className="text-xl font-bold" style={{ color: item.color }}>{item.value.toLocaleString('fr-DZ')} DA</p>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: textColor }}>Progression vers le paiement minimum</p>
            <p className="text-xs font-semibold" style={{ color: mutedColor }}>{minPayout.toLocaleString('fr-DZ')} DA</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--navy-3, #1C2537)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${payoutProgress}%`, background: data.stats.nextPayoutAvailable ? 'var(--green-3)' : 'var(--gold)' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: mutedColor }}>{pendingAmount.toLocaleString('fr-DZ')} DA / {minPayout.toLocaleString('fr-DZ')} DA</p>
            {data.stats.nextPayoutAvailable ? (
              <button type="button"                 className="px-4 py-2 rounded-lg text-xs font-semibold text-white min-h-[44px]"
                style={{ background: 'var(--green-2, #1E40AF)' }}
              >
                Demander un paiement
              </button>
            ) : (
              <p className="text-xs" style={{ color: mutedColor }}>Paiement disponible à {minPayout.toLocaleString('fr-DZ')} DA</p>
            )}
          </div>
        </div>

        {data.recentReferrals && data.recentReferrals.length > 0 && (
          <div
            className="rounded-xl p-5"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <h2 className="text-sm font-bold mb-4" style={{ color: textColor }}>Parrainages récents</h2>
            <div className="space-y-2">
              {data.recentReferrals.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b text-sm" style={{ borderColor: cardBorder }}>
                  <span className="font-mono text-xs" style={{ color: mutedColor }}>{r.maskedEmail}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: mutedColor }}>{r.createdAt}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {r.status === 'CONVERTED' ? 'Converti' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="rounded-xl p-5"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <h2 className="text-sm font-bold mb-4" style={{ color: textColor }}>Commissions récentes</h2>
          {data.recentCommissions.length === 0 ? (
            <p className="text-sm" style={{ color: mutedColor }}>Aucune commission pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {data.recentCommissions.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b text-sm" style={{ borderColor: cardBorder }}>
                  <div>
                    <span className="font-semibold" style={{ color: textColor }}>{c.amount.toLocaleString('fr-DZ')} DA</span>
                    <span className="ms-2 text-xs" style={{ color: mutedColor }}>{c.type === 'OVERRIDE' ? 'Override' : 'Directe'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: mutedColor }}>{c.createdAt}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {c.status === 'PAID' ? 'Payé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.1)' }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: mutedColor }}>
            Votre commission est calculée uniquement après activation d&apos;un abonnement payé.
          </p>
        </div>
      </div>
    </div>
  );
}
