'use client';
import { useTranslations } from 'next-intl';

interface Props {
  userName: string;
  mode: 'ARTISAN' | 'ENTREPRISE';
}

export function DashboardHeader({ userName, mode }: Props) {
  const t = useTranslations('dashboard');

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 18) return t('goodAfternoon');
    return t('goodEvening');
  })();

  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <span className="inline-block px-2 py-0.5 rounded-full bg-[rgba(37,99,235,0.1)] text-[var(--green-3)] text-[10px] font-bold uppercase tracking-wider mb-1.5">
          {mode === 'ENTREPRISE' ? t('businessMode') : t('artisanMode')}
        </span>
        <h1 className="text-xl font-sora font-extrabold text-[var(--sand)] leading-tight">
          {greeting}, {userName}
        </h1>
      </div>
    </div>
  );
}
