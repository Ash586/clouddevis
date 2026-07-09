'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lightbulb, Bug, Send, Check } from 'lucide-react';

interface FeedbackDetail {
  id: string;
  type: 'SUGGESTION' | 'BUG';
  message: string;
  email: string | null;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null };
}

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  NEW: 'warning',
  REVIEWED: 'info',
  RESOLVED: 'success',
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouveau',
  REVIEWED: 'Vu',
  RESOLVED: 'Résolu',
};

export default function AdminFeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [fb, setFb] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [sentOk, setSentOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/feedback/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(setFb)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function patch(payload: { status?: string; reply?: string }, busyKey: string) {
    setSaving(busyKey);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec');
      }
      const data = await res.json();
      setFb(prev => (prev ? { ...prev, status: data.status } : prev));
      if (payload.reply) { setReply(''); setSentOk(true); setTimeout(() => setSentOk(false), 3000); }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec');
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="min-h-screen bg-[#f4f5f7] p-6"><div className="animate-pulse text-sm text-slate-500">Chargement...</div></div>;
  if (!fb) return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 max-w-3xl mx-auto">
      <Link href="/admin/feedback" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-4"><ArrowLeft size={14} /> Retour</Link>
      <Card className="p-8 text-center bg-white border-slate-200"><p className="text-sm text-slate-500">Retour introuvable</p></Card>
    </div>
  );

  const Icon = fb.type === 'BUG' ? Bug : Lightbulb;

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 max-w-3xl mx-auto">
      <Link href="/admin/feedback" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-4"><ArrowLeft size={14} /> Retour</Link>

      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <Icon size={18} className={fb.type === 'BUG' ? 'text-red-600' : 'text-amber-600'} />
          <h1 className="text-lg font-black text-slate-900">{fb.type === 'BUG' ? 'Signalement de bug' : 'Suggestion'}</h1>
        </div>
        <Badge variant={STATUS_COLORS[fb.status]}>{STATUS_LABELS[fb.status]}</Badge>
      </div>

      <Card className="p-4 bg-white border-slate-200 mb-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Utilisateur</p>
            <Link href={`/admin/users/${fb.user.id}`} className="text-slate-900 font-semibold hover:underline">{fb.user.name}</Link>
          </div>
          <div>
            <p className="text-slate-500">Email du compte</p>
            <p className="text-slate-700">{fb.user.email}</p>
          </div>
          {fb.email && (
            <div>
              <p className="text-slate-500">Contact fourni</p>
              <p className="text-slate-700">{fb.email}</p>
            </div>
          )}
          {fb.user.phone && (
            <div>
              <p className="text-slate-500">Téléphone</p>
              <p className="text-slate-700">{fb.user.phone}</p>
            </div>
          )}
          <div>
            <p className="text-slate-500">Envoyé le</p>
            <p className="text-slate-700">{new Date(fb.createdAt).toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 mb-4">
        <p className="text-slate-500 text-xs mb-1.5">Message</p>
        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{fb.message}</p>
      </Card>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['NEW', 'REVIEWED', 'RESOLVED'] as const).map(s => (
          <button type="button" key={s} disabled={saving !== null || fb.status === s}
            onClick={() => patch({ status: s }, `status:${s}`)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition disabled:opacity-40 ${fb.status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            {saving === `status:${s}` ? '…' : `Marquer ${STATUS_LABELS[s].toLowerCase()}`}
          </button>
        ))}
      </div>

      <Card className="p-4 bg-white border-slate-200">
        <p className="text-sm font-bold text-slate-900 mb-1">Répondre à l&apos;utilisateur</p>
        <p className="text-[11px] text-slate-500 mb-3">La réponse apparaît dans le centre de notifications de {fb.user.name}.</p>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          maxLength={2000}
          placeholder="Merci pour votre retour ! Nous avons…"
          className="w-full h-28 resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-slate-600">{reply.length}/2000</span>
          <button type="button" disabled={!reply.trim() || saving !== null}
            onClick={() => patch({ reply: reply.trim() }, 'reply')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50">
            {sentOk ? <><Check size={14} /> Envoyé</> : saving === 'reply' ? '…' : <><Send size={14} /> Envoyer la réponse</>}
          </button>
        </div>
      </Card>
    </div>
  );
}
