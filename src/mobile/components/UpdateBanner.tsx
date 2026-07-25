'use client';

import { useMobileI18n } from '@/mobile/lib/i18n';

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
    <div
      className="fixed inset-x-0 top-0 z-[90] border-b border-[#D4A843]/25 bg-[#D4A843]/10 px-4 py-2.5 backdrop-blur"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#B8860B]">{t('update.title')} v{newVersion}</p>
          {releaseNotes && <p className="text-[10px] text-[#B8860B]/65 mt-0.5">{releaseNotes}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          {apkUrl && (
            <a href={apkUrl} className="rounded-lg bg-[#D4A843] px-2.5 py-1 text-[10px] font-bold text-white transition-colors duration-150 hover:bg-[#B8860B]">
              {t('update.download')}
            </a>
          )}
          <button onClick={onDismiss} aria-label="Fermer" className="text-[#B8860B] hover:text-[#B8860B]/60 transition-colors duration-150 text-sm">
            \u2715
          </button>
        </div>
      </div>
    </div>
  );
}
