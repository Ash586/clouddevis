'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

export default function EnterprisePage() {
  const t = useTranslations('enterprise');
  const tc = useTranslations('common');
  const { showToast } = useToast();
  const [form, setForm] = useState({ companyName: '', employees: '', needs: '', phone: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!form.companyName || !form.employees || !form.needs) {
      showToast(t('requiredFields') || 'Veuillez remplir les champs obligatoires', 'error');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || t('successMessage'), 'success');
      setForm({ companyName: '', employees: '', needs: '', phone: '' });
    } catch (err: unknown) {
      showToast((err instanceof Error ? err.message : null) || 'Erreur', 'error');
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--sand)' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="p-8" style={{ background: 'var(--navy-2)', border: '0.5px solid rgba(15,39,71,0.08)' }}>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏢</div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--sand)' }}>{t('title') || 'Rakmana Enterprise'}</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--sand-muted)' }}>{t('subtitle') || 'Solution sur mesure pour les grandes organisations'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '🎯', title: t('benefit1Title') || 'Sur mesure', desc: t('benefit1Desc') || 'Personnalisation complète de la plateforme selon vos processus' },
              { icon: '🔒', title: t('benefit2Title') || 'Sécurité maximale', desc: t('benefit2Desc') || 'Hébergement dédié, audit de sécurité, conformité RGPD' },
              { icon: '👑', title: t('benefit3Title') || 'Support dédié', desc: t('benefit3Desc') || 'Manager dédié, SLA garantie, disponibilité 24/7' },
            ].map((b, i) => (
              <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'var(--navy-3)', border: '0.5px solid rgba(15,39,71,0.08)' }}>
                <div className="text-3xl mb-2">{b.icon}</div>
                <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--sand)' }}>{b.title}</h3>
                <p className="text-[11px]" style={{ color: 'var(--sand-muted)' }}>{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold" style={{ color: 'var(--sand)' }}>{t('formTitle') || 'Demander un devis personnalisé'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--sand-muted)' }}>{t('companyName') || 'Nom de l\'entreprise'} *</label>
                <input type="text" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                  style={{ background: 'var(--navy-3)', border: '0.5px solid rgba(15,39,71,0.08)', color: 'var(--sand)' }}
                  className="w-full p-2.5 rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-2)]" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--sand-muted)' }}>{t('employees') || 'Nombre d\'employés'} *</label>
                <select value={form.employees} onChange={e => setForm(p => ({ ...p, employees: e.target.value }))}
                  style={{ background: 'var(--navy-3)', border: '0.5px solid rgba(15,39,71,0.08)', color: 'var(--sand)' }}
                  className="w-full p-2.5 rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-2)]">
                  <option value="">—</option>
                  {['10-25', '25-50', '50-100', '100-250', '250-500', '500+'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--sand-muted)' }}>{t('needs') || 'Décrivez vos besoins'} *</label>
              <textarea value={form.needs} onChange={e => setForm(p => ({ ...p, needs: e.target.value }))} rows={4}
                style={{ background: 'var(--navy-3)', border: '0.5px solid rgba(15,39,71,0.08)', color: 'var(--sand)' }}
                className="w-full p-2.5 rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-2)] resize-none"
                placeholder={t('needsPlaceholder') || 'Modules souhaités, nombre d\'utilisateurs, intégrations, etc.'} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--sand-muted)' }}>{t('phone') || 'Téléphone'}</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={{ background: 'var(--navy-3)', border: '0.5px solid rgba(15,39,71,0.08)', color: 'var(--sand)' }}
                className="w-full p-2.5 rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-2)]" />
            </div>
            <Button onClick={handleSubmit} disabled={sending} className="w-full min-h-[44px]">
              {sending ? (tc('loading') || 'Envoi...') : (t('submit') || 'Envoyer la demande')}
            </Button>
            <p className="text-[10px] text-center" style={{ color: 'var(--sand-muted)' }}>{t('privacy') || 'Nous ne partagerons jamais vos informations.'}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
