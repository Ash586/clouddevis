'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { MobileTable } from '@/components/mobile/MobileTable';

interface User {
  id: string; name: string; email: string; country: string; mode: string;
  subscription: string; docCount: number; clientCount: number; createdAt: string;
}

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.ok ? r.json() : { users: [], pagination: { totalPages: 1 } })
      .then(d => { setUsers(d.users); setTotalPages(d.pagination.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleSubscriptionChange = async (userId: string, newStatus: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionStatus: newStatus }),
    });
    fetchUsers();
  };

  const columns = [
    { key: 'name', label: t('table.name') },
    { key: 'email', label: t('table.email') },
    { key: 'subscription', label: t('table.subscription'), render: (v: unknown) => (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${String(v) === 'PRO' ? 'bg-emerald-50 text-emerald-600' : String(v) === 'BASIC' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{String(v)}</span>
    )},
    { key: 'docCount', label: t('table.docs') },
    { key: 'createdAt', label: t('table.date') },
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
    </div>
  );
}
