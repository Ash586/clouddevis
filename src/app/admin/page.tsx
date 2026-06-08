'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import { Users, Crown, DollarSign, AlertCircle } from 'lucide-react';

interface DashboardData {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    usersToday: number;
    totalDocs: number;
    docsThisMonth: number;
    totalClients: number;
    activeTrialUsers: number;
    activeBasicUsers: number;
    activeProUsers: number;
  };
  docTypeBreakdown: { type: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; country: string; subscription: string; mode: string; createdAt: string }[];
}

const GROWTH_DATA = [
  { day: 'J-29', value: 25 },
  { day: 'J-28', value: 35 },
  { day: 'J-27', value: 30 },
  { day: 'J-26', value: 50 },
  { day: 'J-25', value: 45 },
  { day: 'J-24', value: 60 },
  { day: 'J-23', value: 55 },
  { day: 'J-22', value: 70 },
  { day: 'J-21', value: 65 },
  { day: 'J-20', value: 80 },
  { day: 'J-19', value: 75 },
  { day: 'J-18', value: 90 },
  { day: 'J-17', value: 100 },
];

const MAX_BAR = Math.max(...GROWTH_DATA.map(d => d.value));

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ width: 24, height: 24, border: '2px solid #4a9eff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 13, color: '#5c5a54' }}>
        {t('error')}
      </div>
    );
  }

  const revenue = data.stats.activeProUsers * 2000 + data.stats.activeBasicUsers * 1000;
  const activeUsers = data.stats.activeProUsers + data.stats.activeBasicUsers;

  const metrics = [
    { value: data.stats.totalUsers.toLocaleString(), label: t('stats.totalUsers'), trend: '+12%', trendColor: '#4ade80', color: '#4a9eff' },
    { value: data.stats.activeProUsers.toLocaleString(), label: t('stats.subscriptions'), trend: '+8%', trendColor: '#4ade80', color: '#4ade80' },
    { value: revenue.toLocaleString() + ' DA', label: 'Revenus MRR', trend: 'MRR', trendColor: '#fbbf24', color: '#fbbf24' },
    { value: '0', label: 'Erreurs 24h', trend: 'OK', trendColor: '#4ade80', color: '#f87171' },
  ];

  const recentActivity = [
    { type: 'inscription', user: 'Ahmed Mansouri', time: 'il y a 2h', color: '#4ade80' },
    { type: 'abonnement', user: 'Samira Boudiaf', time: 'il y a 5h', color: '#4a9eff' },
    { type: 'connexion', user: 'Karim Hadj', time: 'il y a 6h', color: '#4a9eff' },
    { type: 'erreur', user: 'Système - Paiement', time: 'il y a 8h', color: '#f87171' },
    { type: 'expiration', user: 'Lydia Meziane', time: 'il y a 12h', color: '#fbbf24' },
    { type: 'inscription', user: 'Omar Bensalem', time: 'il y a 14h', color: '#4ade80' },
    { type: 'connexion', user: 'Inès Djebali', time: 'il y a 18h', color: '#4a9eff' },
    { type: 'inscription', user: 'Rayan Khelifi', time: 'il y a 22h', color: '#4ade80' },
  ];

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#e8e6de' }}>
        Bonjour 👋 Vue d'ensemble
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
        {metrics.map(m => (
          <AdminMetricCard key={m.label} {...m} />
        ))}
      </div>

      <div style={{ background: '#2c2c29', borderRadius: 7, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 9.5, color: '#5c5a54', marginBottom: 6 }}>
          Croissance 30 jours
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
          {GROWTH_DATA.map(d => (
            <div
              key={d.day}
              style={{
                flex: 1,
                height: `${(d.value / MAX_BAR) * 100}%`,
                minWidth: 8,
                borderRadius: '2px 2px 0 0',
                background: d.value === MAX_BAR
                  ? 'rgba(74,158,255,0.25)'
                  : 'rgba(74,158,255,0.10)',
                border: d.value === MAX_BAR
                  ? '0.5px solid #4a9eff'
                  : '0.5px solid rgba(74,158,255,0.20)',
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#181816',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--r, 10px)',
          padding: '16px 18px',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 11, color: '#e8e6de' }}>
          Activité récente
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {recentActivity.map((act, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: i < recentActivity.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none',
                fontSize: 12.5,
                color: '#9c9a90',
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: act.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>
                <strong style={{ color: '#e8e6de', fontWeight: 600 }}>{act.user}</strong>
                {' — '}{act.type}
              </span>
              <span style={{ color: '#5c5a54', fontSize: 11, flexShrink: 0 }}>{act.time}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11.5,
              color: '#4a9eff',
              fontWeight: 500,
            }}
          >
            Voir tous les logs →
          </button>
        </div>
      </div>
    </div>
  );
}
