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
    setTimeout(() => {
      onUnlock();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#F3F6FC] p-6">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2563EB]/10">
        <Lock size={32} className="text-[#2563EB]" />
      </div>
      <h2 className="mb-2 text-xl font-extrabold text-[#2563EB]">Rakmana</h2>
      <p className="mb-8 text-sm text-[#5A6B85]">App locked</p>

      <button
        onClick={handleUnlock}
        disabled={unlocking}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30 transition-all active:scale-95 disabled:opacity-50"
      >
        <Fingerprint size={28} />
      </button>
      <p className="text-xs text-[#5A6B85]">
        {biometryType || 'Touch to unlock'}
      </p>

      <button
        onClick={onLogout}
        className="mt-8 flex items-center gap-2 text-sm text-[#E8542E] hover:text-[#C43D1C] transition-colors"
      >
        <LogOut size={14} /> {t('settings.logout')}
      </button>
    </div>
  );
}
