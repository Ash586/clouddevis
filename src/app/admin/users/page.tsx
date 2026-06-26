'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye, Ban, CheckCircle } from 'lucide-react';

interface User {
  id: string; name: string; email: string; country: string; mode: string;
  subscription: string; docCount: number; clientCount: number; createdAt: string;
  suspended: boolean;
}

const card = { background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px', marginBottom: 12 };
const input = { background: '#282c38', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '9px 12px', fontSize: 13, color: '#e8ebf0', outline: 'none' };
const select = { ...input, cursor: 'pointer' };
const btnPrimary = { padding: '9px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', background: '#1d202a', color: '#e8ebf0' };

const statusPill: Record<string, { bg: string; color: string }> = {
  TRIAL: { bg: 'rgba(251,191,36,0.10)', color: '#fbbf24' },
  BASIC: { bg: 'rgba(74,158,255,0.10)', color: '#4a9eff' },
  PRO: { bg: 'rgba(74,222,128,0.10)', color: '#4ade80' },
  EXPIRED: { bg: 'rgba(248,113,113,0.10)', color: '#f87171' },
  FREE: { bg: '#282c38', color: '#a1a5ad' },
};

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'unsuspend' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.ok ? r.json() : { users: [], pagination: { totalPages: 1 } })
      .then(d => { setUsers(d.users); setTotalPages(d.pagination.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleSuspend = async () => {
    if (!actionUser) return;
    setActionLoading(true);
    try {
      const endpoint = actionType === 'suspend' ? 'suspend' : 'unsuspend';
      const res = await fetch(`/api/admin/users/${actionUser.id}/${endpoint}`, { method: 'POST' });
      if (res.ok) { fetchUsers(); setActionUser(null); setActionType(null); }
    } catch {}
    setActionLoading(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8ebf0', marginBottom: 20 }}>{t('nav.users')}</h1>

      <div style={card}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tc('search')} style={{ ...input, flex: 1, minWidth: 180 }} />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...select, minWidth: 150 }}>
            <option value="">{t('filter.allStatus')}</option>
            {['TRIAL', 'BASIC', 'PRO', 'EXPIRED', 'FREE'].map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button type="submit" style={btnPrimary}>{tc('search')}</button>
        </form>
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #656a73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 13, color: '#656a73' }}>{t('noUsers')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  {[t('table.name'), t('table.email'), t('table.status'), t('table.subscription'), t('table.docs'), ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#656a73' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const pill = statusPill[u.subscription] || statusPill.FREE;
                  return (
                    <tr key={u.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#e8ebf0' }}>{u.name}</td>
                      <td style={{ padding: '8px 12px', color: '#a1a5ad' }}>{u.email}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          display: 'inline-flex', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                          background: u.suspended ? 'rgba(248,113,113,0.10)' : 'rgba(74,222,128,0.10)',
                          color: u.suspended ? '#f87171' : '#4ade80',
                        }}>
                          {u.suspended ? t('users.suspended') : t('users.active')}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ display: 'inline-flex', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: pill.bg, color: pill.color }}>
                          {u.subscription}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#a1a5ad' }}>{u.docCount}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button type="button" onClick={() => router.push(`/admin/users/${u.id}`)}
                            style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: '#282c38', color: '#a1a5ad', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Eye size={14} />
                          </button>
                          {u.suspended ? (
                            <button type="button" onClick={() => { setActionUser(u); setActionType('unsuspend'); }}
                              style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(74,222,128,0.10)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckCircle size={14} />
                            </button>
                          ) : (
                            <button type="button" onClick={() => { setActionUser(u); setActionType('suspend'); }}
                              style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(248,113,113,0.10)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      </td>
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
            <button type="button" key={p} onClick={() => setPage(p)}
              style={{
                width: 34, height: 34, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: p === page ? '#1d202a' : 'transparent',
                color: p === page ? '#e8ebf0' : '#a1a5ad',
                border: p === page ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
              }}>{p}</button>
          ))}
        </div>
      )}

      {actionUser && actionType && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => { setActionUser(null); setActionType(null); }}>
          <div style={{ background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 24, maxWidth: 360, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: actionType === 'suspend' ? 'rgba(248,113,113,0.10)' : 'rgba(74,222,128,0.10)',
              }}>
                {actionType === 'suspend' ? <Ban size={20} style={{ color: '#f87171' }} /> : <CheckCircle size={20} style={{ color: '#4ade80' }} />}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>
                  {actionType === 'suspend' ? t('users.suspend') : t('users.unsuspend')}
                </h3>
                <p style={{ fontSize: 13, color: '#a1a5ad', margin: '2px 0 0' }}>{actionUser.name} ({actionUser.email})</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#a1a5ad', marginBottom: 20 }}>
              {actionType === 'suspend' ? t('users.suspendConfirm') : t('users.unsuspendConfirm')}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { setActionUser(null); setActionType(null); }}
                style={{ flex: 1, padding: '10px 0', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', background: '#282c38', color: '#a1a5ad' }}>
                {tc('cancel')}
              </button>
              <button type="button" onClick={handleSuspend} disabled={actionLoading}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', cursor: actionLoading ? 'default' : 'pointer',
                  background: actionType === 'suspend' ? 'rgba(248,113,113,0.10)' : 'rgba(74,222,128,0.10)',
                  color: actionType === 'suspend' ? '#f87171' : '#4ade80',
                  opacity: actionLoading ? 0.5 : 1,
                }}>
                {actionLoading ? (
                  <div style={{ width: 20, height: 20, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                ) : (
                  actionType === 'suspend' ? t('users.suspend') : t('users.unsuspend')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
