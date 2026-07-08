'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquarePlus, Lightbulb, Bug } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

type FeedbackType = 'suggestion' | 'bug';

export function FeedbackFab() {
  const t = useTranslations('feedback');
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error('failed');
      showToast(t('sent') || 'Merci ! Votre retour a bien été envoyé ✓', 'success');
      setOpen(false);
      setMessage('');
      setEmail('');
      setType('suggestion');
    } catch {
      showToast(t('error') || 'Échec de l\'envoi. Réessayez.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const typeBtn = (value: FeedbackType, Icon: typeof Lightbulb, label: string) => {
    const active = type === value;
    return (
      <button
        type="button"
        onClick={() => setType(value)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border-2 transition ${
          active
            ? 'border-[var(--green-2)] bg-[var(--green-glow)] text-[var(--green-3)]'
            : 'border-[var(--border-2)] text-[var(--sand-muted)] hover:text-[var(--sand)]'
        }`}
      >
        <Icon size={14} /> {label}
      </button>
    );
  };

  return (
    <>
      {/* Floating action button — hidden while the modal is open so it can't overlap it. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('open') || 'Envoyer un retour'}
          title={t('open') || 'Envoyer un retour'}
          className="group fixed bottom-5 start-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--green)] text-white shadow-lg shadow-[var(--green)]/30 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-glow)]"
        >
          <span className="absolute inset-0 rounded-full bg-[var(--green)] opacity-40 animate-ping" aria-hidden="true" />
          <MessageSquarePlus size={22} className="relative" />
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('title') || 'Votre avis nous aide'} size="md">
        <div className="text-start space-y-3">
          <p className="text-xs text-[var(--sand-muted)]">
            {t('subtitle') || 'Une idée ou un bug ? Dites-nous tout — nous lisons chaque message.'}
          </p>

          <div className="flex gap-2">
            {typeBtn('suggestion', Lightbulb, t('suggestion') || 'Suggestion')}
            {typeBtn('bug', Bug, t('bug') || 'Signaler un bug')}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            placeholder={t('placeholder') || 'Décrivez votre idée ou le problème rencontré…'}
            className="w-full h-28 resize-none rounded-xl border border-[var(--border-2)] bg-[var(--navy-3)] p-3 text-sm text-[var(--sand)] outline-none focus:ring-2 focus:ring-[var(--green-glow)]"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailOptional') || 'Email (optionnel, pour vous répondre)'}
            className="w-full rounded-xl border border-[var(--border-2)] bg-[var(--navy-3)] px-3 py-2.5 text-sm text-[var(--sand)] outline-none focus:ring-2 focus:ring-[var(--green-glow)]"
          />

          <button
            type="button"
            onClick={submit}
            disabled={!message.trim() || submitting}
            className="w-full py-2.5 rounded-xl bg-[var(--green)] text-white text-sm font-bold min-h-[44px] transition hover:bg-[var(--green-2)] active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? '…' : (t('send') || 'Envoyer')}
          </button>
        </div>
      </Modal>
    </>
  );
}
