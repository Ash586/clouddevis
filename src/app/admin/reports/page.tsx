'use client';

import { useEffect, useState } from 'react';
import { FileText, TrendingUp, Users, DollarSign } from 'lucide-react';

interface ReportData {
  revenue: { total: string; tva: string; docCount: number };
  userGrowth: { month: string; count: number }[];
  docByType: { type: string; count: number; revenue: number }[];
  subscriptionBreakdown: { status: string; count: number }[];
}

const card = { background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px' };
const c = {
  green: '#4ade80', greenBg: 'rgba(74,222,128,0.10)',
  amber: '#fbbf24', amberBg: 'rgba(251,191,36,0.10)',
  red: '#f87171', redBg: 'rgba(248,113,113,0.10)',
  blue: '#4a9eff', blueBg: 'rgba(74,158,255,0.10)',
  purple: '#a78bfa', purpleBg: 'rgba(167,139,250,0.10)',
};

const typeLabels: Record<string, string> = {
  DEVIS: 'Devis', FACTURE: 'Facture', PROFORMA: 'Proforma',
  BC: 'Bon de Commande', BR: 'Bon de Réception',
};

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('year');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/admin/reports?period=${period}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const periods = [
    { value: 'month', label: 'Mois' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Année' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #656a73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!data) return <p style={{ textAlign: 'center', padding: '80px 0', fontSize: 13, color: '#656a73' }}>Erreur de chargement</p>;

  const maxGrowth = Math.max(...data.userGrowth.map(g => g.count), 1);
  const maxDocs = Math.max(...data.docByType.map(d => d.count), 1);
  const totalSubs = data.subscriptionBreakdown.reduce((s, sb) => s + sb.count, 0) || 1;

  const subColors: Record<string, string> = {
    TRIAL: c.amber, BASIC: c.blue, PRO: c.green, FREE: '#a1a5ad', EXPIRED: c.red,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>Rapports</h1>
        <div style={{ display: 'flex', gap: 4, background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 3 }}>
          {periods.map(p => (
            <button type="button" key={p.value} onClick={() => setPeriod(p.value)}
              style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: period === p.value ? '#1d202a' : 'transparent',
                color: period === p.value ? '#e8ebf0' : '#656a73',
              }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Revenue Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        <div style={card}>
          <div style={{ width: 36, height: 36, background: c.greenBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <DollarSign size={18} style={{ color: c.green }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>{data.revenue.total} DA</p>
          <p style={{ fontSize: 11, color: '#a1a5ad', fontWeight: 600, marginTop: 2 }}>Revenu total</p>
        </div>
        <div style={card}>
          <div style={{ width: 36, height: 36, background: c.blueBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <FileText size={18} style={{ color: c.blue }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>{data.revenue.docCount}</p>
          <p style={{ fontSize: 11, color: '#a1a5ad', fontWeight: 600, marginTop: 2 }}>Documents</p>
        </div>
        <div style={card}>
          <div style={{ width: 36, height: 36, background: c.amberBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <TrendingUp size={18} style={{ color: c.amber }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>{data.revenue.tva} DA</p>
          <p style={{ fontSize: 11, color: '#a1a5ad', fontWeight: 600, marginTop: 2 }}>TVA</p>
        </div>
        <div style={card}>
          <div style={{ width: 36, height: 36, background: c.purpleBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Users size={18} style={{ color: c.purple }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>{data.userGrowth.reduce((s, g) => s + g.count, 0)}</p>
          <p style={{ fontSize: 11, color: '#a1a5ad', fontWeight: 600, marginTop: 2 }}>Nouveaux utilisateurs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {/* User Growth */}
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#e8ebf0', marginBottom: 8 }}>Croissance utilisateurs</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.userGrowth.map(g => (
              <div key={g.month}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span style={{ color: '#a1a5ad' }}>{g.month}</span>
                  <span style={{ fontWeight: 700, color: '#e8ebf0' }}>{g.count}</span>
                </div>
                <div style={{ height: 6, background: '#1d202a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(g.count / maxGrowth) * 100}%`, height: '100%', borderRadius: 3, background: c.blue }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doc by type */}
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#e8ebf0', marginBottom: 8 }}>Documents par type</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.docByType.map(d => (
              <div key={d.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, color: '#e8ebf0' }}>{typeLabels[d.type] || d.type}</span>
                  <span style={{ color: '#656a73' }}>{d.count} — {d.revenue.toLocaleString()} DA</span>
                </div>
                <div style={{ height: 4, background: '#1d202a', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(d.count / maxDocs) * 100}%`, height: '100%', borderRadius: 2, background: c.green }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#e8ebf0', marginBottom: 12 }}>Répartition abonnements</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {data.subscriptionBreakdown.map(sb => (
            <div key={sb.status} style={{ textAlign: 'center', padding: 12, borderRadius: 8, background: '#1d202a' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: subColors[sb.status] || '#e8ebf0', margin: 0 }}>{sb.count}</p>
              <p style={{ fontSize: 10, color: '#656a73', fontWeight: 600, marginTop: 2 }}>{sb.status}</p>
              <div style={{ marginTop: 6, height: 4, background: '#282c38', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(sb.count / totalSubs) * 100}%`, height: '100%', borderRadius: 2, background: subColors[sb.status] || '#656a73' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
