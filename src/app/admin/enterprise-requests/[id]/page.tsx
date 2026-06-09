'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface ER {
  id: string;
  companyName: string;
  employees: string;
  needs: string;
  phone: string | null;
  status: string;
  notes: string | null;
  user: { name: string; email: string; phone: string | null; id: string };
  handledBy: { name: string } | null;
  createdAt: string;
  handledAt: string | null;
}

export default function AdminEnterpriseRequestDetailPage() {
  const t = useTranslations('admin');
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [request, setRequest] = useState<ER | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    fetch(`/api/admin/enterprise-requests/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setRequest(d); setNotes(d?.notes || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/enterprise-requests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error();
      showToast('Demande mise à jour ✓', 'success');
      fetchData();
    } catch { showToast('Erreur', 'error'); }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0f1117] p-6 text-slate-500">Chargement...</div>;
  if (!request) return <div className="min-h-screen bg-[#0f1117] p-6 text-red-400">Demande introuvable</div>;

  return (
    <div className="min-h-screen bg-[#0f1117] p-6 max-w-3xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="text-xs text-slate-400 hover:text-white transition">&larr; Retour</button>

        <Card className="p-6 bg-slate-900/50 border-slate-800">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-white">{request.companyName}</h1>
              <p className="text-sm text-slate-400 mt-1">{request.user.name} • {request.user.email}</p>
            </div>
            <Badge variant={request.status === 'APPROVED' ? 'success' : request.status === 'REJECTED' ? 'danger' : request.status === 'CONTACTED' ? 'info' : 'warning'}>
              {request.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div><span className="text-slate-500">Employés:</span> <span className="text-white font-medium">{request.employees}</span></div>
            <div><span className="text-slate-500">Téléphone:</span> <span className="text-white font-medium">{request.phone || '—'}</span></div>
            <div><span className="text-slate-500">Date:</span> <span className="text-white font-medium">{new Date(request.createdAt).toLocaleDateString('fr-FR')}</span></div>
            <div><span className="text-slate-500">Traité par:</span> <span className="text-white font-medium">{request.handledBy?.name || '—'}</span></div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Besoins</h3>
            <p className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3">{request.needs}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Notes internes</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => updateStatus('CONTACTED')} disabled={saving || request.status === 'CONTACTED'} variant="secondary">Marquer contacté</Button>
            <Button onClick={() => updateStatus('APPROVED')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">Approuver</Button>
            <Button onClick={() => updateStatus('REJECTED')} disabled={saving} className="bg-red-600 hover:bg-red-700">Rejeter</Button>

            {request.status === 'APPROVED' && (
              <Button onClick={() => {
                fetch('/api/admin/enterprise-requests/' + params.id + '/activate', { method: 'POST' })
                  .then(r => { if (r.ok) showToast('Compte Enterprise activé ✓', 'success'); fetchData(); })
                  .catch(() => showToast('Erreur', 'error'));
              }} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                Activer le compte Enterprise
              </Button>
            )}
          </div>
        </Card>
      </div>
  );
}
