'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 min-w-0">
          <TrialGate>
            <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[var(--sand)]">{t('title')}</h1>
                  <p className="text-xs sm:text-sm text-[var(--sand-muted)] mt-1">{t('subtitle')}</p>
                </div>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                  <Plus className="w-3.5 h-3.5 me-1" /> {t('createNew')}
                </Button>
              </div>

              {showCreate && (
                <Card className="p-4 mb-6">
                  <h3 className="text-sm font-bold text-[var(--sand)] mb-3">{t('createSchedule')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={t('form.namePlaceholder')}
                      className="px-4 py-2.5 rounded-xl border border-[rgba(15,39,71,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]" />
                    <select value={form.documentType} onChange={e => setForm(p => ({ ...p, documentType: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-[rgba(15,39,71,0.1)] text-sm bg-[var(--navy-3)]">
                      <option value="FACTURE">Facture</option>
                      <option value="DEVIS">Devis</option>
                      <option value="PROFORMA">Proforma</option>
                    </select>
                    <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-[rgba(15,39,71,0.1)] text-sm bg-[var(--navy-3)]">
                      <option value="WEEKLY">{t('eachWeek')}</option>
                      <option value="MONTHLY">{t('eachMonth')}</option>
                      <option value="QUARTERLY">{t('eachQuarter')}</option>
                      <option value="YEARLY">{t('eachYear')}</option>
                    </select>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-1">{t('form.nextDate')}</label>
                      <input type="date" value={form.nextDate} onChange={e => setForm(p => ({ ...p, nextDate: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[rgba(15,39,71,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreate} disabled={!form.name.trim() || !form.nextDate}>
                      <RefreshCw className="w-3.5 h-3.5 me-1" /> {t('createSchedule')}
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
                    <RefreshCw className="w-10 h-10 text-[var(--sand-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--sand-muted)]">{t('empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-[var(--navy-3)] rounded-xl">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[var(--sand)]">{inv.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.active ? 'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)]' : 'bg-[var(--navy-3)] text-[var(--sand-muted)]'}`}>
                              {inv.active ? t('active') : t('paused')}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--sand-muted)] mt-0.5">
                            {t(FREQ_LABELS[inv.frequency] || inv.frequency)} • {t('nextGen')} {new Date(inv.nextDate).toLocaleDateString()}
                            {inv.lastGenerated && <> • {t('lastGen')} {new Date(inv.lastGenerated).toLocaleDateString()}</>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handleToggle(inv)} className="p-2 text-[var(--sand-muted)] hover:text-blue-400 rounded-lg hover:bg-blue-400/10 transition" title={inv.active ? t('pause') : t('resume')}>
                            {inv.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button type="button" onClick={() => handleDelete(inv.id)} className="p-2 text-[var(--sand-muted)] hover:text-red-400 rounded-lg hover:bg-red-400/10 transition" title={tc('delete')}>
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
  );
}
