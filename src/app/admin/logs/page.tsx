'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { AlertTriangle, LogIn, Activity, Trash2, Search } from 'lucide-react';

interface LogEntry {
  id: string; action: string; entity: string; entityId: string | null;
  details: unknown; ipAddress: string | null;
  adminName: string | null; userName: string | null; createdAt: string;
}

export default function AdminLogsPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (actionFilter) params.set('action', actionFilter);
    if (entityFilter) params.set('entity', entityFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (search) params.set('search', search);
    fetch(`/api/admin/logs?${params}`)
      .then(r => r.ok ? r.json() : { logs: [], pagination: { totalPages: 1 } })
      .then(d => { setLogs(d.logs); setTotalPages(d.pagination.totalPages); setTotal(d.pagination.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, actionFilter, entityFilter, dateFrom, dateTo, search]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };

  const actionColors: Record<string, string> = {
    CREATE: 'bg-emerald-50 text-emerald-600',
    UPDATE: 'bg-blue-50 text-blue-600',
    DELETE: 'bg-red-50 text-red-600',
    LOGIN: 'bg-amber-50 text-amber-600',
    LOGOUT: 'bg-slate-100 text-slate-600',
    ERROR: 'bg-red-50 text-red-600',
  };

  const actionIcons: Record<string, typeof Activity> = {
    CREATE: Activity,
    UPDATE: Activity,
    DELETE: Trash2,
    LOGIN: LogIn,
    LOGOUT: LogIn,
    ERROR: AlertTriangle,
  };

  const actionButtons = [
    { value: '', label: t('filter.all'), icon: Activity },
    { value: 'LOGIN', label: 'Login', icon: LogIn },
    { value: 'CREATE', label: 'Create', icon: Activity },
    { value: 'UPDATE', label: 'Update', icon: Activity },
    { value: 'DELETE', label: 'Delete', icon: Trash2 },
    { value: 'ERROR', label: 'Error', icon: AlertTriangle },
  ];

  const entityOptions = ['', 'USER', 'DOCUMENT', 'SUBSCRIPTION', 'SYSTEM', 'CLIENT', 'TEMPLATE', 'TEAM', 'ADMIN'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900">{t('nav.logs')}</h1>
        <p className="text-sm text-slate-400">{total} entrées</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2 mb-3 flex-wrap">
          {actionButtons.map(a => {
            const Icon = a.icon;
            return (
              <button key={a.value} onClick={() => { setActionFilter(a.value); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${actionFilter === a.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Icon className="w-3.5 h-3.5" />
                {a.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..." className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">Toutes entités</option>
            {entityOptions.filter(Boolean).map(e => (<option key={e} value={e}>{e}</option>))}
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </form>
      </Card>

      {/* Logs List */}
      <Card className="p-4">
        {loading ? (
          <div className="py-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">{t('noLogs')}</div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => {
              const Icon = actionIcons[log.action] || Activity;
              return (
                <div key={log.id} className={`flex items-start gap-3 p-3 rounded-xl ${log.action === 'ERROR' ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${actionColors[log.action] || 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-3 h-3" />
                    {log.action}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                    </p>
                    {log.details != null && (
                      <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details).slice(0, 100)}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {log.adminName && `by ${log.adminName}`}
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
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">←</button>
          <span className="px-3 py-1.5 text-sm text-slate-500 font-semibold">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  );
}
