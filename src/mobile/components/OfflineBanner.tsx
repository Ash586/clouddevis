'use client';

import { WifiOff } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';

export function OfflineBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-1.5 bg-[#DC3545] py-1.5 text-[10px] font-bold text-white"
      style={{ paddingTop: 'max(0.375rem, var(--sat, env(safe-area-inset-top)))' }}
      role="alert"
    >
      <WifiOff size={12} />
      Pas de connexion Internet
    </div>
  );
}
