'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ER {
  id: string;
  companyName: string;
  employees: string;
  needs: string;
  phone: string | null;
  status: string;
  user: { name: string; email: string };
  createdAt: string;
}

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONTACTED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export default function AdminEnterpriseRequestsPage() {
  const t = useTranslations('admin');
  const [requests, setRequests] = useState<ER[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/admin/enterprise-requests')
      .then(r => r.ok ? r.json() : [])
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="min-h-screen bg-[#0f1117] p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-black text-white mb-4">Demandes Enterprise</h1>

        <div className="flex gap-2 mb-6">
          {['ALL', 'PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${filter === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {s === 'ALL' ? 'Tous' : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse text-sm text-slate-500">Chargement...</div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900/50 border-slate-800">
            <p className="text-sm text-slate-500">Aucune demande</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <Link key={r.id} href={`/admin/enterprise-requests/${r.id}`}>
                <Card className="p-4 bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 transition cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white">{r.companyName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{r.user.name} • {r.user.email}</p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{r.needs}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={STATUS_COLORS[r.status] || 'default'}>{r.status}</Badge>
                      <p className="text-[10px] text-slate-500 mt-1">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
  );
}
