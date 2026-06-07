'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';

interface LogEntry {
  id: string; action: string; entity: string; entityId: string | null;
  details: unknown; ipAddress: string | null;
  adminName: string | null; userName: string | null; createdAt: string;
}

export default function AdminLogsPage() {
  const t = useTranslations('admin');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (actionFilter) params.set('action', actionFilter);
    fetch(`/api/admin/logs?${params}`)
      .then(r => r.ok ? r.json() : { logs: [], pagination: { totalPages: 1 } })
      .then(d => { setLogs(d.logs); setTotalPages(d.pagination.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, actionFilter]);

  const actionColors: Record<string, string> = {
    CREATE: 'bg-emerald-50 text-emerald-600',
    UPDATE: 'bg-blue-50 text-blue-600',
    DELETE: 'bg-red-50 text-red-600',
    LOGIN: 'bg-amber-50 text-amber-600',
    LOGOUT: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">{t('nav.logs')}</h1>

      <Card className="p-4">
        <div className="flex gap-2 mb-4">
          {['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'].map(a => (
            <button key={a} onClick={() => { setActionFilter(a); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${actionFilter === a ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {a || t('filter.all')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">{t('noLogs')}</div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${actionColors[log.action] || 'bg-slate-100 text-slate-600'}`}>{log.action}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {log.adminName && `by ${log.adminName}`}
                    {log.userName && ` → ${log.userName}`}
                    {' • '}{new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
