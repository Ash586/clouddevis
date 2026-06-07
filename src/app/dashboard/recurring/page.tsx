'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileTable } from '@/components/mobile/MobileTable';
import { RefreshCw, Plus, Pause, Play, Trash2 } from 'lucide-react';

interface RecurringInvoice {
  id: string; name: string; documentType: string;
  frequency: string; nextDate: string; lastGenerated: string | null;
  active: boolean; createdAt: string;
}

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: 'eachWeek', MONTHLY: 'eachMonth', QUARTERLY: 'eachQuarter', YEARLY: 'eachYear',
};

export default function RecurringInvoicesPage() {
  const t = useTranslations('recurring');
  const tc = useTranslations('common');
  const router = useRouter();
  const [invoices, setInvoices] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', documentType: 'FACTURE', frequency: 'MONTHLY', nextDate: '',
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recurring-invoices');
      if (res.ok) setInvoices((await res.json()).invoices);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.nextDate) return;
    await fetch('/api/recurring-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', documentType: 'FACTURE', frequency: 'MONTHLY', nextDate: '' });
    setShowCreate(false);
    fetchInvoices();
  };

  const handleToggle = async (inv: RecurringInvoice) => {
    await fetch('/api/recurring-invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inv.id, active: !inv.active }),
    });
    fetchInvoices();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/recurring-invoices/${id}`, { method: 'DELETE' });
    fetchInvoices();
  };

  const columns = [
    { key: 'name', label: t('table.name') },
    { key: 'documentType', label: t('table.type') },
    {
      key: 'frequency', label: t('table.frequency'),
      render: (v: unknown) => t(FREQ_LABELS[String(v)] || String(v)),
    },
    {
      key: 'nextDate', label: t('table.nextDate'),
      render: (v: unknown) => v ? new Date(String(v)).toLocaleDateString() : '—',
    },
    {
      key: 'active', label: t('table.active'),
      render: (v: unknown) => v ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{t('active')}</span> : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{t('paused')}</span>,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
            <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('title')}</h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('subtitle')}</p>
                </div>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> {t('createNew')}
                </Button>
              </div>

              {showCreate && (
                <Card className="p-4 mb-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">{t('createSchedule')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={t('form.namePlaceholder')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    <select value={form.documentType} onChange={e => setForm(p => ({ ...p, documentType: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                      <option value="FACTURE">Facture</option>
                      <option value="DEVIS">Devis</option>
                      <option value="PROFORMA">Proforma</option>
                    </select>
                    <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                      <option value="WEEKLY">{t('eachWeek')}</option>
                      <option value="MONTHLY">{t('eachMonth')}</option>
                      <option value="QUARTERLY">{t('eachQuarter')}</option>
                      <option value="YEARLY">{t('eachYear')}</option>
                    </select>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">{t('form.nextDate')}</label>
                      <input type="date" value={form.nextDate} onChange={e => setForm(p => ({ ...p, nextDate: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreate} disabled={!form.name.trim() || !form.nextDate}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> {t('createSchedule')}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreate(false)}>{tc('cancel')}</Button>
                  </div>
                </Card>
              )}

              <Card className="p-4">
                {loading ? (
                  <div className="py-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">{t('empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800">{inv.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                              {inv.active ? t('active') : t('paused')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {t(FREQ_LABELS[inv.frequency] || inv.frequency)} • {t('nextGen')} {new Date(inv.nextDate).toLocaleDateString()}
                            {inv.lastGenerated && <> • {t('lastGen')} {new Date(inv.lastGenerated).toLocaleDateString()}</>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggle(inv)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" title={inv.active ? t('pause') : t('resume')}>
                            {inv.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(inv.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition" title={tc('delete')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </main>
          </TrialGate>
        </div>
      </div>
    </div>
  );
}
