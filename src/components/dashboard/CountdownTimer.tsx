'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function CountdownTimer() {
  const t = useTranslations('dashboard');
  const [daysLeft, setDaysLeft] = useState(7);

  useEffect(() => {
    // يمكن استبدال هذا ببيانات من الـ API
    const target = new Date();
    target.setDate(target.getDate() + 7);
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
      setDaysLeft(diff);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="countdown-banner">
      <span className="countdown-icon">⏰</span>
      <span>
        <strong>{t('trialDaysLeft', { count: daysLeft })}</strong> — {daysLeft <= 3 ? t('trialUrgent') : t('trialUpgradeHint')}
      </span>
      <Link href="/dashboard/subscription" className="countdown-cta">
        {t('upgrade')} ←
      </Link>
    </div>
  );
}