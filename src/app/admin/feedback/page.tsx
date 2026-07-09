'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Bug } from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'SUGGESTION' | 'BUG';
  message: string;
  email: string | null;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  user: { id: string; name: string; email: string };
}

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  NEW: 'warning',
  REVIEWED: 'info',
  RESOLVED: 'success',
};

const STATUS_LABELS: Record<string, string> = {
  ALL: 'Tous',
  NEW: 'Nouveaux',
  REVIEWED: 'Vus',
  RESOLVED: 'Résolus',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ NEW: 0, REVIEWED: 0, RESOLVED: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (status !== 'ALL') params.set('status', status);
    if (type !== 'ALL') params.set('type', type);
    fetch(`/api/admin/feedback?${params.toString()}`)
      .then(r => (r.ok ? r.json() : { items: [], counts: {} }))
      .then(data => {
        if (!active) return;
        setItems(data.items ?? []);
        if (data.counts) setCounts(data.counts);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, type]);

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-black text-slate-900">Retours utilisateurs</h1>
        <div className="flex gap-2 text-[11px]">
          <span className="text-amber-600">{counts.NEW ?? 0} nouveaux</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-500">{counts.REVIEWED ?? 0} vus</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-600">{counts.RESOLVED ?? 0} résolus</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-5">Suggestions et signalements de bugs envoyés depuis l&apos;application.</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {['ALL', 'NEW', 'REVIEWED', 'RESOLVED'].map(s => (
          <button type="button" key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            {STATUS_LABELS[s]}{s !== 'ALL' && counts[s] ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {[['ALL', 'Tous types'], ['SUGGESTION', 'Suggestions'], ['BUG', 'Bugs']].map(([v, label]) => (
          <button type="button" key={v} onClick={() => setType(v)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${type === v ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse text-sm text-slate-500">Chargement...</div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center bg-white border-slate-200">
          <p className="text-sm text-slate-500">Aucun retour</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(f => (
            <Link key={f.id} href={`/admin/feedback/${f.id}`}>
              <Card className="p-4 bg-white border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {f.type === 'BUG'
                        ? <Bug size={14} className="text-red-600 shrink-0" />
                        : <Lightbulb size={14} className="text-amber-600 shrink-0" />}
                      <h3 className="text-sm font-bold text-slate-900 truncate">{f.user.name}</h3>
                      <span className="text-[11px] text-slate-500 truncate">{f.user.email}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{f.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={STATUS_COLORS[f.status] || 'default'}>{STATUS_LABELS[f.status]}</Badge>
                    <p className="text-[10px] text-slate-500 mt-1">{timeAgo(f.createdAt)}</p>
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
