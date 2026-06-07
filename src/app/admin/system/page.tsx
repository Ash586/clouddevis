'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Activity, Server, Database, HardDrive, Cpu } from 'lucide-react';

interface SystemData {
  status: string; timestamp: string; uptime: number;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  counts: { users: number; documents: number; clients: number; templates: number; admins: number };
  nodeVersion: string;
}

export default function AdminSystemPage() {
  const t = useTranslations('admin');
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const metrics = [
    { label: t('system.status'), value: data.status, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('system.uptime'), value: formatUptime(data.uptime), icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('system.memory'), value: `${data.memory.rss} MB`, icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('system.nodeVersion'), value: data.nodeVersion, icon: HardDrive, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const counts = [
    { label: t('system.users'), value: data.counts.users },
    { label: t('system.documents'), value: data.counts.documents },
    { label: t('system.clients'), value: data.counts.clients },
    { label: t('system.templates'), value: data.counts.templates },
    { label: t('system.admins'), value: data.counts.admins },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">{t('nav.system')}</h1>

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

      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('system.dbCounts')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {counts.map(c => (
            <div key={c.label} className="text-center">
              <p className="text-2xl font-black text-slate-900">{c.value.toLocaleString()}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">{t('system.memoryDetail')}</h2>
        <div className="space-y-3">
          {[
            { label: 'RSS', value: data.memory.rss, max: data.memory.heapTotal * 2 },
            { label: 'Heap Used', value: data.memory.heapUsed, max: data.memory.heapTotal },
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
    </div>
  );
}
