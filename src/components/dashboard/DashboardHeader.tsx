'use client';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AlertCircle, FileEdit, CheckCircle2, ChevronRight } from 'lucide-react';
import type { DashboardStats } from './dashboardConstants';

interface Props {
  userName: string;
  mode: 'ARTISAN' | 'ENTREPRISE';
  stats: DashboardStats;
}

export function DashboardHeader({ userName, mode, stats }: Props) {
  const t = useTranslations('dashboard');
  const router = useRouter();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 18) return t('goodAfternoon');
    return t('goodEvening');
  })();

  const unpaid = stats.statusBreakdown?.SENT || 0;
  const drafts = stats.draftCount || 0;
  const allClear = unpaid === 0 && drafts === 0;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-full bg-[rgba(37,99,235,0.1)] text-[var(--green-3)] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            {mode === 'ENTREPRISE' ? t('businessMode') : t('artisanMode')}
          </span>
          <h1 className="text-xl font-sora font-extrabold text-[var(--sand)] leading-tight">
            {greeting}, {userName}
          </h1>
        </div>
      </div>

      {/* Dynamic alert summary — derived from stats */}
      <div className="flex items-center gap-2 flex-wrap mt-2.5">
        {allClear ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--green-3)]">
            <CheckCircle2 size={15} />
            {t('greetingAllClear')}
          </span>
        ) : (
          <>
            {unpaid > 0 && (
              <AlertChip
                icon={<AlertCircle size={13} />}
                label={t('alertUnpaid')}
                count={unpaid}
                tone="red"
                onClick={() => router.push('/dashboard/documents')}
              />
            )}
            {drafts > 0 && (
              <AlertChip
                icon={<FileEdit size={13} />}
                label={t('alertDrafts')}
                count={drafts}
                tone="neutral"
                onClick={() => router.push('/dashboard/documents')}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AlertChip({ icon, label, count, tone, onClick }: {
  icon: React.ReactNode; label: string; count: number;
  tone: 'red' | 'neutral'; onClick: () => void;
}) {
  const toneClass = tone === 'red'
    ? 'border-red-400/25 bg-[rgba(239,68,68,0.06)] text-red-400 hover:border-red-400/40'
    : 'border-[rgba(15,39,71,0.1)] bg-[var(--navy-2)] text-[var(--sand-muted)] hover:text-[var(--sand)] hover:border-[rgba(15,39,71,0.2)]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 ps-2.5 pe-2 py-1.5 rounded-full border text-xs font-semibold transition-all min-h-[36px] ${toneClass}`}
    >
      {icon}
      <span>{label}</span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tone === 'red' ? 'bg-red-400/15' : 'bg-[var(--navy-4)]'}`}>{count}</span>
      <ChevronRight size={13} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all rtl:scale-x-[-1]" />
    </button>
  );
}
