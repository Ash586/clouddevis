'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, FileText, BarChart3, Activity, Eye, MousePointerClick } from 'lucide-react';

interface AnalyticsData {
  userGrowth: { date: string; count: number; artisans: number; enterprises: number }[];
  docTrend: { date: string; count: number; revenue: number }[];
  countryBreakdown: { country: string; count: number }[];
  topUsers: { id: string; name: string; email: string; docCount: number }[];
  docStatusBreakdown: { status: string; count: number }[];
  visitorStats: { totalPageViews: number; uniqueSessions: number; avgPageViewsPerSession: number };
  topPages: { path: string; count: number }[];
  conversion: { totalUsersInPeriod: number; paidUsersInPeriod: number; conversionRate: number };
  period: string;
}

const card = { background: '#ffffff', border: '0.5px solid rgba(15,23,42,0.08)', borderRadius: 10, padding: '16px 18px' };
const clr = {
  green: '#16a34a', greenBg: 'rgba(74,222,128,0.10)',
  amber: '#d97706', amberBg: 'rgba(251,191,36,0.10)',
  red: '#dc2626', redBg: 'rgba(248,113,113,0.10)',
  blue: '#2563eb', blueBg: 'rgba(74,158,255,0.10)',
  purple: '#7c3aed', purpleBg: 'rgba(167,139,250,0.10)',
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const periods = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: 'year', label: 'Année' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #94a3b8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!data) return <p style={{ textAlign: 'center', padding: '80px 0', fontSize: 13, color: '#94a3b8' }}>Erreur de chargement</p>;

  const totalUsersGrowth = data.userGrowth.reduce((s, d) => s + d.count, 0);
  const totalDocsCreated = data.docTrend.reduce((s, d) => s + d.count, 0);
  const totalRevenue = data.docTrend.reduce((s, d) => s + d.revenue, 0);
  const avgDailyDocs = data.docTrend.length ? Math.round(totalDocsCreated / data.docTrend.length) : 0;
  const maxUserCount = Math.max(...data.userGrowth.map(d => d.count), 1);
  const maxDocCount = Math.max(...data.docTrend.map(d => d.count), 1);
  const maxCountryCount = Math.max(...data.countryBreakdown.map(c => c.count), 1);
  const maxPageCount = Math.max(...data.topPages.map(p => p.count), 1);

  const MetricIconCard = ({ icon, val, label, bg }: { icon: React.ReactNode; val: string; label: string; bg: string }) => (
    <div style={card}>
      <div style={{ width: 36, height: 36, background: bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{val}</p>
      <p style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginTop: 2 }}>{label}</p>
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BarChart = ({ data, maxVal, color, labelKey, valueKey }: { data: any[]; maxVal: number; color: string; labelKey: string; valueKey: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {data.slice(-10).map(d => {
        const pct = maxVal > 0 ? (d[valueKey] / maxVal) * 100 : 0;
        return (
          <div key={d[labelKey]}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: '#4b5563' }}>{new Date(d[labelKey]).toLocaleDateString()}</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{d[valueKey]}</span>
            </div>
            <div style={{ height: 4, background: '#eef1f5', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );

  const statusBadge = (status: string) => {
    const m: Record<string, { bg: string; color: string }> = {
      DRAFT: { bg: clr.amberBg, color: clr.amber },
      ACCEPTED: { bg: clr.greenBg, color: clr.green },
      PROGRESS: { bg: clr.blueBg, color: clr.blue },
      DELIVERED: { bg: clr.purpleBg, color: clr.purple },
    };
    const s = m[status] || { bg: '#e3e7ee', color: '#4b5563' };
    return { ...s };
  };

  return (
    /* eslint-disable react-hooks/static-components */
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Analytics</h1>
        <div style={{ display: 'flex', gap: 4, background: '#ffffff', border: '0.5px solid rgba(15,23,42,0.08)', borderRadius: 8, padding: 3 }}>
          {periods.map(p => (
            <button type="button" key={p.value} onClick={() => setPeriod(p.value)}
              style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: period === p.value ? '#eef1f5' : 'transparent',
                color: period === p.value ? '#111827' : '#94a3b8',
              }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        <MetricIconCard icon={<TrendingUp size={18} style={{ color: clr.blue }} />} val={totalUsersGrowth.toLocaleString()} label="Nouveaux utilisateurs" bg={clr.blueBg} />
        <MetricIconCard icon={<FileText size={18} style={{ color: clr.green }} />} val={totalDocsCreated.toLocaleString()} label="Nouveaux documents" bg={clr.greenBg} />
        <MetricIconCard icon={<BarChart3 size={18} style={{ color: clr.amber }} />} val={`${totalRevenue.toLocaleString()} DA`} label="Revenu" bg={clr.amberBg} />
        <MetricIconCard icon={<Activity size={18} style={{ color: clr.purple }} />} val={String(avgDailyDocs)} label="Moy. documents/jour" bg={clr.purpleBg} />
      </div>

      {/* Visitor Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        <MetricIconCard icon={<Eye size={18} style={{ color: clr.blue }} />} val={data.visitorStats.totalPageViews.toLocaleString()} label="Pages vues" bg={clr.blueBg} />
        <MetricIconCard icon={<MousePointerClick size={18} style={{ color: clr.purple }} />} val={data.visitorStats.uniqueSessions.toLocaleString()} label="Sessions uniques" bg={clr.purpleBg} />
        <MetricIconCard icon={<MousePointerClick size={18} style={{ color: clr.amber }} />} val={String(data.visitorStats.avgPageViewsPerSession)} label="Pages / session" bg={clr.amberBg} />
        <MetricIconCard icon={<TrendingUp size={18} style={{ color: clr.green }} />} val={`${data.conversion.conversionRate}%`} label="Taux conversion" bg={clr.greenBg} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Croissance utilisateurs</p>
          <BarChart data={data.userGrowth} maxVal={maxUserCount} color={clr.blue} labelKey="date" valueKey="count" />
        </div>
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Tendance documents</p>
          <BarChart data={data.docTrend} maxVal={maxDocCount} color={clr.green} labelKey="date" valueKey="count" />
        </div>
      </div>

      {/* Country + Doc Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Pays d&apos;origine</p>
          {data.countryBreakdown.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.countryBreakdown.map(ct => {
                const pct = maxCountryCount > 0 ? (ct.count / maxCountryCount) * 100 : 0;
                return (
                  <div key={ct.country}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                      <span style={{ color: '#111827', fontWeight: 600, textTransform: 'capitalize' }}>{ct.country}</span>
                      <span style={{ color: '#94a3b8' }}>{ct.count}</span>
                    </div>
                    <div style={{ height: 4, background: '#eef1f5', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: clr.purple }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Aucune donnée</p>
          )}
        </div>
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Statut des documents</p>
          {['DRAFT', 'ACCEPTED', 'PROGRESS', 'DELIVERED'].map(status => {
            const found = data.docStatusBreakdown.find(d => d.status === status);
            const count = found ? found.count : 0;
            const total = data.docStatusBreakdown.reduce((s, d) => s + d.count, 0) || 1;
            const pct = (count / total) * 100;
            const sb = statusBadge(status);
            return (
              <div key={status} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: sb.bg, color: sb.color }}>{status}</span>
                  <span style={{ color: '#94a3b8' }}>{count} ({Math.round(pct)}%)</span>
                </div>
                <div style={{ height: 4, background: '#eef1f5', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: sb.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Pages */}
      <div style={{ marginBottom: 10 }}>
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Pages les plus visitées</p>
          {data.topPages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {data.topPages.map(p => {
                const pct = maxPageCount > 0 ? (p.count / maxPageCount) * 100 : 0;
                return (
                  <div key={p.path}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#111827', fontFamily: "'IBM Plex Mono', monospace" }}>{p.path}</span>
                      <span style={{ color: '#94a3b8' }}>{p.count}</span>
                    </div>
                    <div style={{ height: 4, background: '#eef1f5', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: clr.blue }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Conversion */}
      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Conversion</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' as const }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{data.conversion.totalUsersInPeriod}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>Nouveaux utilisateurs</p>
          </div>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: clr.green, margin: 0 }}>{data.conversion.paidUsersInPeriod}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>Payants</p>
          </div>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: clr.blue, margin: 0 }}>{data.conversion.conversionRate}%</p>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>Taux de conversion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
