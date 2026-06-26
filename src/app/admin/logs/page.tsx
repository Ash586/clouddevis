'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface LogEntry {
  id: string; action: string; entity: string; entityId: string | null;
  details: unknown; ipAddress: string | null;
  adminName: string | null; userName: string | null; createdAt: string;
}

const card = { background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px', marginBottom: 12 };

const actionColors: Record<string, { bg: string; color: string }> = {
  CREATE: { bg: 'rgba(74,222,128,0.10)', color: '#4ade80' },
  UPDATE: { bg: 'rgba(74,158,255,0.10)', color: '#4a9eff' },
  DELETE: { bg: 'rgba(248,113,113,0.10)', color: '#f87171' },
  LOGIN: { bg: 'rgba(251,191,36,0.10)', color: '#fbbf24' },
  LOGOUT: { bg: '#282c38', color: '#a1a5ad' },
  ERROR: { bg: 'rgba(248,113,113,0.10)', color: '#f87171' },
};

export default function AdminLogsPage() {
  const t = useTranslations('admin');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (actionFilter) params.set('action', actionFilter);
    fetch(`/api/admin/logs?${params}`)
      .then(r => r.ok ? r.json() : { logs: [], pagination: { totalPages: 1 } })
      .then(d => { setLogs(d.logs); setTotalPages(d.pagination.totalPages); setTotal(d.pagination.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, actionFilter]);

  const actionButtons = [
    { value: '', label: 'Tous' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'ERROR', label: 'Error' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8ebf0', margin: 0 }}>{t('nav.logs')}</h1>
        <p style={{ fontSize: 13, color: '#656a73' }}>{total} entrées</p>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {actionButtons.map(a => (
            <button type="button" key={a.value} onClick={() => { setActionFilter(a.value); setPage(1); }}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: actionFilter === a.value ? '#1d202a' : '#282c38',
                color: actionFilter === a.value ? '#e8ebf0' : '#a1a5ad',
                border: actionFilter === a.value ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
              }}>{a.label}</button>
          ))}
        </div>
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #656a73', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 13, color: '#656a73' }}>{t('noLogs')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {logs.map(log => {
              const ac = actionColors[log.action] || { bg: '#282c38', color: '#a1a5ad' };
              return (
                <div key={log.id} style={{
                  display: 'flex', gap: 10, padding: 10, borderRadius: 6,
                  background: log.action === 'ERROR' ? 'rgba(248,113,113,0.05)' : '#1d202a',
                  border: log.action === 'ERROR' ? '0.5px solid rgba(248,113,113,0.10)' : 'none',
                }}>
                  <span style={{
                    display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: ac.bg, color: ac.color, alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                  }}>
                    {log.action}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e8ebf0', margin: 0 }}>
                      {log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                    </p>
                    <p style={{ fontSize: 12, color: '#656a73', margin: '2px 0 0' }}>
                      {log.adminName && `${log.adminName}`}
                      {log.userName && ` → ${log.userName}`}
                      {log.ipAddress && ` • ${log.ipAddress}`}
                      {' • '}{new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '0.5px solid rgba(255,255,255,0.08)', cursor: page === 1 ? 'default' : 'pointer', background: '#282c38', color: page === 1 ? '#656a73' : '#a1a5ad' }}>
            ←
          </button>
          <span style={{ padding: '6px 14px', fontSize: 13, color: '#656a73', fontWeight: 600 }}>{page} / {totalPages}</span>
          <button type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '0.5px solid rgba(255,255,255,0.08)', cursor: page === totalPages ? 'default' : 'pointer', background: '#282c38', color: page === totalPages ? '#656a73' : '#a1a5ad' }}>
            →
          </button>
        </div>
      )}
    </div>
  );
}
