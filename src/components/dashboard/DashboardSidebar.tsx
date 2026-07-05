'use client';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FileEdit, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { QUICK_CREATE_TYPES, STATUS_LABELS, type DashboardStats } from './dashboardConstants';

interface Props {
  stats: DashboardStats;
}

const STATUS_DISPLAY: { key: string; labelKey: string; color: string; bg: string }[] = [
  { key: 'DRAFT',     labelKey: 'draft',     color: 'bg-[var(--sand-muted)]',  bg: 'bg-[var(--navy-4)]' },
  { key: 'SENT',      labelKey: 'sent',      color: 'bg-amber-400',             bg: 'bg-amber-400/10' },
  { key: 'PAID',      labelKey: 'paid',      color: 'bg-[var(--green-3)]',      bg: 'bg-[rgba(37,99,235,0.1)]' },
  { key: 'ACCEPTED',  labelKey: 'accepted',  color: 'bg-blue-400',              bg: 'bg-blue-400/10' },
  { key: 'PROGRESS',  labelKey: 'progress',  color: 'bg-purple-400',            bg: 'bg-purple-400/10' },
  { key: 'DELIVERED', labelKey: 'delivered', color: 'bg-teal-400',              bg: 'bg-teal-400/10' },
];

export function DashboardSidebar({ stats }: Props) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const router = useRouter();

  const draftDoc = stats.recentDraft;
  const breakdown = stats.statusBreakdown || {};
  const totalForBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const activeStatuses = STATUS_DISPLAY.filter(s => (breakdown[s.key] || 0) > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Quick Create */}
      <Card className="p-4 border-[rgba(15,39,71,0.06)]">
        <h2 className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-3">
          {t('quickActions')}
        </h2>
        <div className="flex flex-col gap-1">
          {QUICK_CREATE_TYPES.map((qd) => {
            const count = stats.typeBreakdown?.[
              ({ devis:'DEVIS', facture:'FACTURE', proforma:'PROFORMA', bon_commande:'BC', bon_reception:'BR', bl:'BL', intervention:'INTERVENTION', attachement:'ATTACHEMENT' } as Record<string,string>)[qd.type] || 'DEVIS'
            ] || 0;
            return (
              <button key={qd.type} type="button"
                onClick={() => router.push(`/dashboard/editor?type=${qd.type}`)}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--navy-3)] transition-all text-start">
                <div className="w-8 h-8 rounded-lg bg-[var(--green-glow)] text-[var(--green-3)] flex items-center justify-center shrink-0 group-hover:bg-[var(--green-3)] group-hover:text-white transition-all">
                  <qd.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[var(--sand)] group-hover:text-[var(--green-3)] transition-colors truncate">
                    {t(`docTypes.${qd.labelKey}`)}
                  </div>
                  <div className="text-[10px] text-[var(--sand-muted)]">{count} {t('created')}</div>
                </div>
                <ChevronRight size={13} className="text-[var(--sand-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </Card>

      {/* Continue draft */}
      {draftDoc && (
        <button type="button" onClick={() => router.push(`/dashboard/editor?id=${draftDoc.id}`)}
          className="group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[rgba(37,99,235,0.08)] to-transparent border border-[rgba(37,99,235,0.18)] hover:border-[rgba(37,99,235,0.3)] transition-all text-start">
          <div className="w-9 h-9 rounded-xl bg-[var(--green-glow)] flex items-center justify-center shrink-0">
            <FileEdit size={16} className="text-[var(--green-3)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--green-3)] uppercase tracking-wider">{t('continueDraft')}</p>
            <p className="text-xs font-semibold text-[var(--sand)] truncate mt-0.5">
              {draftDoc.number || t('untitledDoc')}{draftDoc.clientName ? ` · ${draftDoc.clientName}` : ''}
            </p>
          </div>
          <ChevronRight size={15} className="text-[var(--green-3)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Status breakdown */}
      {totalForBreakdown > 0 && activeStatuses.length > 0 && (
        <Card className="p-4 border-[rgba(15,39,71,0.06)]">
          <h2 className="text-[11px] font-bold text-[var(--sand-muted)] uppercase tracking-wider mb-3">
            {t('statusBreakdown')}
          </h2>
          {/* Segmented bar */}
          <div className="flex h-2 rounded-full overflow-hidden mb-3 gap-px">
            {activeStatuses.map(s => {
              const pct = Math.round(((breakdown[s.key] || 0) / totalForBreakdown) * 100);
              return (
                <div key={s.key} className={`${s.color} transition-all`} style={{ width: `${pct}%` }} title={`${tc(STATUS_LABELS[s.key] || s.key)}: ${breakdown[s.key]}`} />
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-1.5">
            {activeStatuses.map(s => {
              const count = breakdown[s.key] || 0;
              const pct = Math.round((count / totalForBreakdown) * 100);
              return (
                <div key={s.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-[11px] text-[var(--sand-muted)]">{tc(STATUS_LABELS[s.key] || s.key)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[var(--sand)]">{count}</span>
                    <span className="text-[10px] text-[var(--sand-muted)] w-7 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
