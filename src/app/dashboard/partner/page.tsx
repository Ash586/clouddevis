'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Users, Link, TrendingUp, DollarSign, Copy, CheckCheck, ExternalLink } from 'lucide-react';

interface PartnerData {
  partner: { id: string; code: string; tier: string; status: string; parent: { id: string; code: string; user: { name: string } } | null };
  stats: {
    totalReferrals: number; convertedReferrals: number; conversionRate: number;
    childrenCount: number; totalCommissions: number; pendingCommissions: number; paidCommissions: number;
  };
  recentCommissions: { id: string; amount: number; type: string; status: string; createdAt: string }[];
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/partner/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center">
        <h1 className="text-xl font-bold mb-2">Vous n'êtes pas encore partenaire</h1>
        <p className="text-slate-500 mb-6">Rejoignez le programme d'affiliation CloudDevis et gagnez des commissions.</p>
        <button onClick={() => router.push('/dashboard/partner/apply')} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700">
          Devenir partenaire
        </button>
      </div>
    );
  }

  if (data.partner.status === 'PENDING') {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold mb-2">Demande en cours d'examen</h1>
        <p className="text-slate-500">Votre demande de partenariat est en attente de validation par notre équipe. Vous serez notifié dès qu'elle sera approuvée.</p>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/auth/register?ref=${data.partner.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuper = data.partner.tier === 'SUPER_AFFILIATE';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Espace Partenaire</h1>
          <p className="text-sm text-slate-500 mt-1">
            Code: <span className="font-mono font-bold text-blue-600">{data.partner.code}</span>
            {isSuper && <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">Super Affiliate</span>}
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copié !' : 'Copier mon lien'}
        </button>
      </div>

      <div className="bg-slate-50 border rounded-lg p-3 flex items-center gap-2 text-sm text-slate-600">
        <Link className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="truncate">{referralUrl}</span>
        <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <Users className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{data.stats.totalReferrals}</p>
          <p className="text-xs text-slate-500 font-semibold">Parrainages</p>
        </Card>
        <Card className="p-4">
          <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-2xl font-bold">{data.stats.convertedReferrals}</p>
          <p className="text-xs text-slate-500 font-semibold">Convertis ({data.stats.conversionRate}%)</p>
        </Card>
        <Card className="p-4">
          <DollarSign className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-2xl font-bold">{data.stats.totalCommissions.toLocaleString()} DA</p>
          <p className="text-xs text-slate-500 font-semibold">Commissions totales</p>
        </Card>
        <Card className="p-4">
          <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">{data.stats.pendingCommissions.toLocaleString()} DA</p>
          <p className="text-xs text-slate-500 font-semibold">En attente de paiement</p>
        </Card>
      </div>

      {isSuper && (
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <h2 className="text-sm font-bold mb-2">Super Affiliate</h2>
          <p className="text-sm text-slate-500">Vous gagnez 5% sur les ventes de votre équipe de {data.stats.childrenCount} affiliés.</p>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="text-sm font-bold mb-4">Commissions récentes</h2>
        {data.recentCommissions.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune commission pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {data.recentCommissions.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                <div>
                  <span className="font-semibold">{c.amount.toLocaleString()} DA</span>
                  <span className="ml-2 text-xs text-slate-400">{c.type === 'OVERRIDE' ? 'Override' : 'Directe'}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
