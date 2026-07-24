'use client';

import { WifiOff } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';

export function OfflineBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-[#E8542E] py-1.5 text-xs font-bold text-white"
      style={{ paddingTop: 'max(0.375rem, env(safe-area-inset-top))' }}
    >
      <WifiOff size={13} />
      Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª
    </div>
  );
}
