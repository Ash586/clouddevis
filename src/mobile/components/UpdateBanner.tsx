'use client';

import { useState, useEffect } from 'react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { isNativePlatform, addBackPressListener, exitApp } from '@/lib/native';

interface UpdateBannerProps {
  visible: boolean;
  newVersion: string;
  releaseNotes: string;
  apkUrl: string;
  onDismiss: () => void;
}

export function UpdateBanner({ visible, newVersion, releaseNotes, apkUrl, onDismiss }: UpdateBannerProps) {
  const { t } = useMobileI18n();
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[90] border-b border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-3 backdrop-blur"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#C77D11]">{t('update.title')} v{newVersion}</p>
          {releaseNotes && <p className="text-xs text-[#C77D11]/70 mt-0.5">{releaseNotes}</p>}
        </div>
        <div className="flex items-center gap-2">
          {apkUrl && (
            <a href={apkUrl} className="rounded-lg bg-[#D4A843] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#C77D11] transition-colors">
              {t('update.download')}
            </a>
          )}
          <button onClick={onDismiss} className="text-[#C77D11] hover:text-[#C77D11]/70 transition-colors">
            âœ•
          </button>
        </div>
      </div>
    </div>
  );
}
