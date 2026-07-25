'use client';

import { useState } from 'react';
import { Lock, Fingerprint, LogOut } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface BiometricLockScreenProps {
  biometryType: string;
  onUnlock: () => void;
  onLogout: () => void;
}

export function BiometricLockScreen({ biometryType, onUnlock, onLogout }: BiometricLockScreenProps) {
  const { t } = useMobileI18n();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => { onUnlock(); }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#F8FAFD] p-5"
      style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0052CC]/8">
        <Lock size={28} className="text-[#0052CC]" />
      </div>
      <h2 className="mb-1 text-lg font-extrabold text-[#0052CC]">Rakmana</h2>
      <p className="mb-6 text-xs text-[#718096]">Application verrouillée</p>

      <button
        onClick={handleUnlock}
        disabled={unlocking}
        aria-label={biometryType || 'Déverrouiller'}
        className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0052CC] text-white shadow-lg shadow-[#0052CC]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#0052CC]/40"
      >
        <Fingerprint size={26} />
      </button>
      <p className="text-[10px] text-[#718096]">
        {biometryType || 'Touch to unlock'}
      </p>

      <button
        onClick={onLogout}
        className="mt-6 flex items-center gap-1.5 text-xs text-[#DC3545] transition-colors duration-150 hover:text-[#B23030]"
      >
        <LogOut size={12} /> {t('settings.logout')}
      </button>
    </div>
  );
}
