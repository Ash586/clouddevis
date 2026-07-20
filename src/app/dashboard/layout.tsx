'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { OfflineSyncProvider } from '@/components/layout/OfflineSyncProvider';
import { FeedbackFab } from '@/components/feedback/FeedbackFab';
import { TourProvider } from '@/contexts/TourProvider';
import { PWAInstallBanner } from '@/components/mobile/PWAInstallBanner';
import { DashboardBackHandler } from '@/components/native/DashboardBackHandler';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) {
          router.replace('/auth/login');
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace('/auth/login'));
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy)]">
        <Loader2 size={28} className="animate-spin text-[var(--sand-muted)]" />
      </div>
    );
  }

  return (
    <OfflineSyncProvider>
      <TourProvider>
        {children}
        <FeedbackFab />
        <PWAInstallBanner />
        <MobileBottomNav />
        <DashboardBackHandler />
      </TourProvider>
    </OfflineSyncProvider>
  );
}
