'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { MobileTable } from '@/components/mobile/MobileTable';
import { Eye, Ban, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface User {
  id: string; name: string; email: string; country: string; mode: string;
  subscription: string; docCount: number; clientCount: number; createdAt: string;
  suspended: boolean;
}

interface SuspendedUser extends User {
  suspended: true;
}

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [suspendedFilter, setSuspendedFilter] = useState('');
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
    if (suspendedFilter) params.set('suspended', suspendedFilter);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.ok ? r.json() : { users: [], pagination: { totalPages: 1 } })
      .then(d => { setUsers(d.users); setTotalPages(d.pagination.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter, suspendedFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleSuspend = async () => {
    if (!actionUser) return;
    setActionLoading(true);
    try {
      const endpoint = actionType === 'suspend' ? 'suspend' : 'unsuspend';
      const res = await fetch(`/api/admin/users/${actionUser.id}/${endpoint}`, { method: 'POST' });
      if (res.ok) {
        fetchUsers();
        setActionUser(null);
        setActionType(null);
      }
    } catch {}
    setActionLoading(false);
  };

  const statusColors: Record<string, string> = {
    TRIAL: 'bg-amber-50 text-amber-600',
    BASIC: 'bg-blue-50 text-blue-600',
    PRO: 'bg-emerald-50 text-emerald-600',
    EXPIRED: 'bg-red-50 text-red-600',
    FREE: 'bg-slate-50 text-slate-600',
  };

  const columns = [
    { key: 'name', label: t('table.name') },
    { key: 'email', label: t('table.email') },
    {
      key: 'suspended', label: t('table.status'),
      render: (_v: unknown, row: Record<string, unknown>) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.suspended ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {row.suspended ? t('users.suspended') : t('users.active')}
        </span>
      ),
    },
    {
      key: 'subscription', label: t('table.subscription'),
      render: (v: unknown) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[String(v)] || 'bg-slate-50 text-slate-600'}`}>
          {String(v)}
        </span>
      ),
    },
    { key: 'docCount', label: t('table.docs') },
    {
      key: 'actions', label: t('table.actions'),
      render: (_v: unknown, row: Record<string, unknown>) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => router.push(`/admin/users/${row.id}`)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            title={t('users.detail')}
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.suspended ? (
            <button
              onClick={() => { setActionUser(row as User); setActionType('unsuspend'); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
              title={t('users.unsuspend')}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => { setActionUser(row as User); setActionType('suspend'); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
              title={t('users.suspend')}
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">{t('nav.users')}</h1>

      {/* Filters */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tc('search')} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">{t('filter.allStatus')}</option>
            <option value="TRIAL">TRIAL</option>
            <option value="BASIC">BASIC</option>
            <option value="PRO">PRO</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="FREE">FREE</option>
          </select>
          <select value={suspendedFilter} onChange={e => { setSuspendedFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">{t('users.active')} / {t('users.suspended')}</option>
            <option value="true">{t('users.suspended')}</option>
            <option value="false">{t('users.active')}</option>
          </select>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition">{tc('search')}</button>
        </form>
      </Card>

      {/* Users Table */}
      <Card className="p-4">
        {loading ? (
          <div className="py-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">{t('noUsers')}</div>
        ) : (
          <MobileTable columns={columns} data={users} keyField="id" />
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Suspend/Unsuspend Confirmation Modal */}
      {actionUser && actionType && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setActionUser(null); setActionType(null); }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${actionType === 'suspend' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                {actionType === 'suspend' ? <Ban className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-emerald-600" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {actionType === 'suspend' ? t('users.suspend') : t('users.unsuspend')}
                </h3>
                <p className="text-sm text-slate-500">{actionUser.name} ({actionUser.email})</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              {actionType === 'suspend' ? t('users.suspendConfirm') : t('users.unsuspendConfirm')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setActionUser(null); setActionType(null); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                {tc('cancel')}
              </button>
              <button onClick={handleSuspend} disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 ${actionType === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
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
