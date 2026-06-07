'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function PartnerApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', wilaya: '', sector: '', howPromote: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/partner/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }

      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Demande envoyée !</h1>
        <p className="text-slate-500 mb-6">Votre demande de partenariat a été reçue. Nous vous contacterons après examen.</p>
        <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">Retour au tableau de bord</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 mb-4 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <h1 className="text-2xl font-bold mb-2">Devenir partenaire CloudDevis</h1>
      <p className="text-slate-500 mb-6">Gagnez 20% de commission récurrente sur chaque abonnement que vous recommandez.</p>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom complet</label>
            <input
              type="text"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Votre nom et prénom"
              value={form.fullName}
              onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Wilaya</label>
            <input
              type="text"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Votre wilaya"
              value={form.wilaya}
              onChange={e => setForm(p => ({ ...p, wilaya: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Secteur d'activité</label>
            <input
              type="text"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Ex: BTP, Commerce, Services"
              value={form.sector}
              onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comment allez-vous promouvoir CloudDevis ?</label>
            <textarea
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder="Décrivez votre stratégie de promotion..."
              value={form.howPromote}
              onChange={e => setForm(p => ({ ...p, howPromote: e.target.value }))}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Envoyer ma demande
          </button>
        </form>
      </Card>

      <div className="mt-6 text-sm text-slate-500 space-y-2">
        <p>✅ Commission de 20% sur chaque abonnement recommandé</p>
        <p>✅ Lien de parrainage personnel</p>
        <p>✅ Tableau de bord avec statistiques en temps réel</p>
        <p>✅ Formation marketing incluse</p>
      </div>
    </div>
  );
}
