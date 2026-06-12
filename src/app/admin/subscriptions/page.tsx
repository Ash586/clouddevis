'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';


interface Subscription {
  id: string; name: string; email: string;
  status: string; trialStartAt: string | null;
  subscriptionEndAt: string | null;
  docCount: number; createdAt: string;
}

interface Summary {
  total: number;
  breakdown: Record<string, number>;
}

const card = { background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px', marginBottom: 12 };
const input = { background: '#282c38', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '9px 12px', fontSize: 13, color: '#e8ebf0', outline: 'none', width: '100%' };
const select = { ...input, cursor: 'pointer' };
const btn = { padding: '9px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' };
const btnPrimary = { ...btn, background: '#1d202a', color: '#e8ebf0', border: '0.5px solid rgba(255,255,255,0.08)' };

const statusPill: Record<string, { bg: string; color: string }> = {
  TRIAL: { bg: 'rgba(251,191,36,0.10)', color: '#fbbf24' },
  STANDARD: { bg: 'rgba(74,158,255,0.10)', color: '#4a9eff' },
  MAX: { bg: 'rgba(139,92,246,0.10)', color: '#8b5cf6' },
  ENTERPRISE: { bg: 'rgba(239,68,68,0.10)', color: '#ef4444' },
  PRO: { bg: 'rgba(74,222,128,0.10)', color: '#4ade80' },
  EXPIRED: { bg: 'rgba(248,113,113,0.10)', color: '#f87171' },
  FREE: { bg: '#282c38', color: '#a1a5ad' },
};

export default function AdminSubscriptionsPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);
    fetch(`/api/admin/subscriptions?${params}`)
      .then(r => r.ok ? r.json() : { subscriptions: [], summary: { total: 0, breakdown: {} }, pagination: { totalPages: 1 } })
      .then(d => {
        setSubscriptions(d.subscriptions);
        setSummary(d.summary);
        setTotalPages(d.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [page, statusFilter]);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData(); };

  const statuses = ['TRIAL', 'STANDARD', 'PRO', 'MAX', 'ENTERPRISE', 'EXPIRED', 'FREE'];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8ebf0', marginBottom: 20 }}>{t('nav.subscriptions')}</h1>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
          {statuses.map(s => {
            const pill = statusPill[s] || statusPill.FREE;
            return (
              <div key={s} style={{ ...card, textAlign: 'center', padding: '12px 10px' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: pill.color, margin: 0 }}>
                  {summary.breakdown[s] || 0}
                </p>
                <p style={{ fontSize: 10, color: '#656a73', fontWeight: 600, marginTop: 2 }}>{s}</p>
              </div>
            );
          })}
        </div>
      )}

      <div style={card}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tc('search')} style={{ ...input, flex: 1, minWidth: 180 }} />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...select, minWidth: 150 }}>
            <option value="">{t('filter.allStatus')}</option>
            {statuses.map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button type="submit" style={btnPrimary}>{tc('search')}</button>
        </form>
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #656a73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 13, color: '#656a73' }}>{t('noUsers')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  {['Nom', 'Email', 'Statut', 'Expire le', 'Documents'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#656a73' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => {
                  const pill = statusPill[sub.status] || statusPill.FREE;
                  return (
                    <tr key={sub.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#e8ebf0' }}>{sub.name}</td>
                      <td style={{ padding: '8px 12px', color: '#a1a5ad' }}>{sub.email}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ display: 'inline-flex', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: pill.bg, color: pill.color }}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#a1a5ad' }}>{sub.subscriptionEndAt || '—'}</td>
                      <td style={{ padding: '8px 12px', color: '#a1a5ad' }}>{sub.docCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{
                width: 34, height: 34, borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: p === page ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
                cursor: 'pointer',
                background: p === page ? '#1d202a' : 'transparent',
                color: p === page ? '#e8ebf0' : '#a1a5ad',
              }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
