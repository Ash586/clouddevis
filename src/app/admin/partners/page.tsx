'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Users, DollarSign, Clock, AlertTriangle, Search, XCircle, Ban } from 'lucide-react';

interface Partner {
  id: string; code: string; tier: string; status: string;
  user: { id: string; name: string; email: string; country: string; subscriptionStatus: string; createdAt: string };
  parent: { id: string; code: string; user: { name: string } } | null;
  referralCount: number; commissionCount: number; childrenCount: number;
  appliedAt: string; approvedAt: string | null;
}

export default function AdminPartnersPage() {
  const [data, setData] = useState<{ partners: Partner[]; pagination: { page: number; totalPages: number; total: number } } | null>(null);
  const [overview, setOverview] = useState<{
    stats: { totalPartners: number; activePartners: number; pendingPartners: number; totalCommissions: number; pendingPayouts: number; totalPayouts: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchPartners = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);
    if (tierFilter) params.set('tier', tierFilter);
    if (search.trim()) params.set('search', search.trim());
    fetch(`/api/admin/partners?${params}`)
      .then(r => r.ok ? r.json() : { partners: [], pagination: { page: 1, totalPages: 0, total: 0 } })
      .then(d => setData(d))
      .catch(() => { setData({ partners: [], pagination: { page: 1, totalPages: 0, total: 0 } }); })
      .finally(() => setLoading(false));

    fetch('/api/admin/commissions/overview')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setOverview(d); })
      .catch(() => {});
  }, [page, statusFilter, tierFilter, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/admin/partners/${id}/approve`, { method: 'PATCH' });
    if (res.ok) fetchPartners();
  };

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/admin/partners/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    if (res.ok) fetchPartners();
  };

  const handleSuspend = async (id: string) => {
    const res = await fetch(`/api/admin/partners/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SUSPENDED' }),
    });
    if (res.ok) fetchPartners();
  };

  const handleTierToggle = async (id: string, currentTier: string) => {
    const newTier = currentTier === 'SUPER_AFFILIATE' ? 'AFFILIATE' : 'SUPER_AFFILIATE';
    const res = await fetch(`/api/admin/partners/${id}/tier`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: newTier }),
    });
    if (res.ok) fetchPartners();
  };

  if (loading && !data) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const stats = overview?.stats;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">Gestion des partenaires</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card className="p-4"><Users className="w-5 h-5 text-blue-600 mb-2" /><p className="text-2xl font-bold">{stats.totalPartners}</p><p className="text-xs text-slate-500 font-semibold">Total</p></Card>
          <Card className="p-4"><CheckCircle className="w-5 h-5 text-emerald-600 mb-2" /><p className="text-2xl font-bold">{stats.activePartners}</p><p className="text-xs text-slate-500 font-semibold">Actifs</p></Card>
          <Card className="p-4"><Clock className="w-5 h-5 text-amber-600 mb-2" /><p className="text-2xl font-bold">{stats.pendingPartners}</p><p className="text-xs text-slate-500 font-semibold">En attente</p></Card>
          <Card className="p-4"><DollarSign className="w-5 h-5 text-purple-600 mb-2" /><p className="text-2xl font-bold">{stats.totalCommissions.toLocaleString()} DA</p><p className="text-xs text-slate-500 font-semibold">Commissions</p></Card>
          <Card className="p-4"><AlertTriangle className="w-5 h-5 text-red-600 mb-2" /><p className="text-2xl font-bold">{stats.pendingPayouts.toLocaleString()} DA</p><p className="text-xs text-slate-500 font-semibold">Paiements en attente</p></Card>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par code, email, nom..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <p className="text-xs font-semibold text-slate-500 self-center mr-1">Statut :</p>
        {['', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {s || 'Tous'}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <p className="text-xs font-semibold text-slate-500 self-center mr-1">Niveau :</p>
        {['', 'AFFILIATE', 'SUPER_AFFILIATE'].map(t => (
          <button
            key={t}
            onClick={() => { setTierFilter(t); setPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${tierFilter === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {t === 'SUPER_AFFILIATE' ? 'Super' : t || 'Tous'}
          </button>
        ))}
      </div>

      <Card className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-400 text-xs font-semibold">
                <th className="pb-2">Partenaire</th>
                <th className="pb-2">Code</th>
                <th className="pb-2">Niveau</th>
                <th className="pb-2">Statut</th>
                <th className="pb-2">Parrainages</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.partners.map(p => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="py-2.5">
                    <div className="font-semibold text-slate-800">{p.user.name}</div>
                    <div className="text-xs text-slate-400">{p.user.email}</div>
                  </td>
                  <td className="py-2.5 font-mono text-xs">{p.code}</td>
                  <td className="py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.tier === 'SUPER_AFFILIATE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {p.tier === 'SUPER_AFFILIATE' ? 'Super' : 'Affiliate'}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : p.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : p.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600">{p.referralCount}</td>
                  <td className="py-2.5 text-slate-400 text-xs">{p.appliedAt}</td>
                  <td className="py-2.5">
                    <div className="flex gap-1 flex-wrap">
                      {p.status === 'PENDING' && (
                        <button onClick={() => handleApprove(p.id)} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-100">
                          Approuver
                        </button>
                      )}
                      {p.status === 'PENDING' && (
                        <button onClick={() => handleReject(p.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejeter
                        </button>
                      )}
                      {p.status === 'ACTIVE' && (
                        <button onClick={() => handleSuspend(p.id)} className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded hover:bg-amber-100 flex items-center gap-1">
                          <Ban className="w-3 h-3" /> Suspendre
                        </button>
                      )}
                      <button onClick={() => handleTierToggle(p.id, p.tier)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                        {p.tier === 'SUPER_AFFILIATE' ? 'Rétrograder' : 'Promouvoir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold ${p === page ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
