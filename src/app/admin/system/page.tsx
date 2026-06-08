'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import {
  Activity, Server, Database, HardDrive, Cpu, Globe,
  Users, FileText, AlertTriangle, LogIn, BarChart3, Eye,
  Shield, Loader2, CheckCircle,
} from 'lucide-react';

interface SystemData {
  status: string; timestamp: string; uptime: number; startedAt: string;
  memory: { rss: number; heapUsed: number; heapTotal: number; external: number };
  counts: {
    users: number; documents: number; clients: number; templates: number; admins: number;
    activeUsers: number; suspendedUsers: number; teams: number; shares: number;
    recurring: number; pageViews: number; todayPageViews: number;
  };
  activity: {
    errorCount: number; loginCount: number;
    topPages: { path: string; count: number }[];
    recentErrors: { entity: string; entityId: string | null; details: unknown; createdAt: string }[];
  };
  nodeVersion: string; platform: string;
}

export default function AdminSystemPage() {
  const t = useTranslations('admin');
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backups, setBackups] = useState<{ id: string; type: string; status: string; startedAt: string; completedAt: string | null }[]>([]);
  const [showBackups, setShowBackups] = useState(false);

  useEffect(() => {
    fetch('/api/admin/system')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-slate-400">{t('error')}</div>;

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await fetch('/api/admin/system/backup', { method: 'POST' });
      if (res.ok) {
        setShowBackups(true);
        fetchBackups();
      }
    } catch {}
    setBackupLoading(false);
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/admin/system/backup');
      if (res.ok) {
        const d = await res.json();
        setBackups(d.backups);
      }
    } catch {}
  };

  useEffect(() => { if (showBackups) fetchBackups(); }, [showBackups]);

  const metrics = [
    { label: t('system.status'), value: t('system.healthy'), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('system.uptime'), value: formatUptime(data.uptime), icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('system.memory'), value: `${data.memory.rss} MB`, icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('system.nodeVersion'), value: data.nodeVersion, icon: HardDrive, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const counts = [
    { label: t('system.users'), value: data.counts.users, icon: Users, color: 'text-blue-600' },
    { label: t('system.documents'), value: data.counts.documents, icon: FileText, color: 'text-emerald-600' },
    { label: t('system.clients'), value: data.counts.clients, icon: Users, color: 'text-purple-600' },
    { label: t('system.templates'), value: data.counts.templates, icon: FileText, color: 'text-amber-600' },
    { label: t('system.admins'), value: data.counts.admins, icon: Activity, color: 'text-red-600' },
  ];

  const extraCounts = [
    { label: 'Équipes', value: data.counts.teams, color: 'text-blue-600' },
    { label: 'Partages', value: data.counts.shares, color: 'text-purple-600' },
    { label: 'Récurrents', value: data.counts.recurring, color: 'text-amber-600' },
    { label: 'Vues totales', value: data.counts.pageViews, color: 'text-emerald-600' },
    { label: 'Vues aujourd\'hui', value: data.counts.todayPageViews, color: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">{t('nav.system')}</h1>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => (
          <Card key={m.label} className="p-4">
            <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="text-lg font-black text-slate-900">{m.value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">{m.label}</p>
          </Card>
        ))}
      </div>

      {/* DB Counts */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('system.dbCounts')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {counts.map(c => (
            <div key={c.label} className="text-center">
              <p className={`text-2xl font-black ${c.color}`}>{c.value.toLocaleString()}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Extra Counts */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Données supplémentaires</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {extraCounts.map(c => (
            <div key={c.label} className="text-center">
              <p className={`text-lg font-black ${c.color}`}>{c.value.toLocaleString()}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Memory Detail */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('system.memoryDetail')}</h2>
          <div className="space-y-3">
            {[
              { label: 'RSS', value: data.memory.rss, max: data.memory.heapTotal * 2 },
              { label: 'Heap Used', value: data.memory.heapUsed, max: data.memory.heapTotal },
              { label: 'Heap Total', value: data.memory.heapTotal, max: data.memory.heapTotal * 2 },
              { label: 'External', value: data.memory.external, max: data.memory.heapTotal },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{m.label}</span>
                  <span className="font-semibold text-slate-800">{m.value} MB</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Pages */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Pages les plus visitées</h2>
          {data.activity.topPages.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucune donnée</p>
          ) : (
            <div className="space-y-2">
              {data.activity.topPages.map(p => {
                const maxCount = Math.max(...data.activity.topPages.map(tp => tp.count), 1);
                return (
                  <div key={p.path}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700 font-mono text-xs">{p.path}</span>
                      <span className="text-slate-400">{p.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Activité</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-lg font-black text-red-600">{data.activity.errorCount}</p>
                <p className="text-xs text-slate-400 font-semibold">Erreurs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
              <LogIn className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-lg font-black text-emerald-600">{data.activity.loginCount}</p>
                <p className="text-xs text-slate-400 font-semibold">Connexions</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Errors */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Erreurs récentes</h2>
          {data.activity.recentErrors.length === 0 ? (
            <p className="text-sm text-emerald-600 text-center py-4">Aucune erreur récente</p>
          ) : (
            <div className="space-y-2">
              {data.activity.recentErrors.map((err, i) => (
                <div key={i} className="p-3 rounded-xl bg-red-50 text-sm">
                  <p className="font-semibold text-red-800">{err.entity} {err.entityId ? `#${err.entityId.slice(0, 8)}` : ''}</p>
                  <p className="text-xs text-red-600 mt-0.5">{new Date(err.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Started At */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Démarré le</span>
          <span className="font-semibold text-slate-800">{new Date(data.startedAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-slate-400">Platforme</span>
          <span className="font-semibold text-slate-800">{data.platform}</span>
        </div>
      </Card>

      {/* Backup */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Shield className="w-4 h-4" />Sauvegardes</h2>
          <button
            onClick={handleBackup}
            disabled={backupLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {backupLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            Effectuer une sauvegarde
          </button>
        </div>
        {showBackups && backups.length > 0 && (
          <div className="space-y-2">
            {backups.map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                <div className="flex items-center gap-2">
                  {b.status === 'completed' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                  <span className="font-semibold">{b.type}</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(b.startedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        {!showBackups && <p className="text-xs text-slate-400">Aucune sauvegarde récente. Cliquez pour effectuer une sauvegarde manuelle.</p>}
      </Card>
    </div>
  );
}
