'use client';

// ============================================================
// Rakmana Mobile — 6-month revenue mini-chart (home screen)
// Pure CSS bars computed from local savedDocuments (FACTURE
// TTC per month). Respects privacy mode: bars stay, the max
// amount caption is hidden.
// ============================================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { useUserStore } from '@/stores/userStore';
import { useMobileI18n } from '@/mobile/lib/i18n';

const MONTH_SHORT: Record<string, string[]> = {
  fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ar: ['جان', 'فيف', 'مار', 'أفر', 'ماي', 'جوا', 'جوي', 'أوت', 'سبت', 'أكت', 'نوف', 'ديس'],
};

function formatDA(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toLocaleString('fr-DZ', { maximumFractionDigits: 1 }) + ' M';
  }
  if (n >= 1_000) {
    return Math.round(n / 1_000).toLocaleString('fr-DZ') + ' K';
  }
  return Math.round(n).toLocaleString('fr-DZ');
}

export function RevenueTrend() {
  const savedDocuments = useDocumentStore((s) => s.savedDocuments);
  const privacyMode = useUserStore((s) => s.privacyMode);
  const locale = useUserStore((s) => s.locale);
  const { t } = useMobileI18n();

  const months = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; total: number; current: boolean }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: (MONTH_SHORT[locale] ?? MONTH_SHORT.fr)[d.getMonth()],
        total: 0,
        current: i === 0,
      });
    }
    for (const doc of savedDocuments) {
      if (doc.type !== 'FACTURE') continue;
      const dd = new Date(doc.date);
      const key = `${dd.getFullYear()}-${dd.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.total += doc.totalTTC ?? 0;
    }
    return buckets;
  }, [savedDocuments, locale]);

  const max = Math.max(...months.map((m) => m.total));
  if (max === 0) return null; // nothing invoiced in 6 months — skip the card

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.2 }}
      className="mx-5 rounded-2xl p-4 bg-[var(--navy-2)] border border-[var(--border)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(16,185,129,0.12)]">
            <TrendingUp size={16} strokeWidth={2} className="text-emerald-400" />
          </div>
          <span className="text-[11px] font-medium text-[var(--sand-muted)]">
            {t('stats.trendTitle')}
          </span>
        </div>
        {!privacyMode && (
          <span className="text-[10px] font-semibold text-[var(--sand-muted)]">
            max {formatDA(max)} DA
          </span>
        )}
      </div>
      {/* Time axis always flows left→right, even in RTL */}
      <div dir="ltr" className="flex items-end gap-2 h-[72px]">
        {months.map((m) => (
          <div key={m.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, (m.total / max) * 100)}%` }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className={cn(
                'w-full rounded-md',
                m.current ? 'bg-[var(--green-2)]' : 'bg-[var(--navy-4)]',
              )}
            />
            <span
              className={cn(
                'text-[9px] leading-none',
                m.current ? 'font-bold text-[var(--green-3)]' : 'text-[var(--sand-muted)]',
              )}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
