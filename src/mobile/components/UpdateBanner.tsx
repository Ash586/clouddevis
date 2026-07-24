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
    <div className="fixed inset-x-0 top-0 z-[90] border-b border-[#D6B462]/30 bg-[#D6B462]/10 px-4 py-3 backdrop-blur"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#9A7B2F]">{t('update.title')} v{newVersion}</p>
          {releaseNotes && <p className="text-xs text-[#9A7B2F]/70 mt-0.5">{releaseNotes}</p>}
        </div>
        <div className="flex items-center gap-2">
          {apkUrl && (
            <a href={apkUrl} className="rounded-lg bg-[#D6B462] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#C4A452] transition-colors">
              {t('update.download')}
            </a>
          )}
          <button onClick={onDismiss} className="text-[#9A7B2F] hover:text-[#9A7B2F]/70 transition-colors">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
