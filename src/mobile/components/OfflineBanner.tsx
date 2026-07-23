'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { useSyncStore } from '@/stores/syncStore';

interface OfflineBannerProps {
  /** Whether the device is online (from useNetwork) */
  isOnline: boolean;
  /** Callback when user taps retry */
  onRetry?: () => void;
}

export function OfflineBanner({ isOnline, onRetry }: OfflineBannerProps) {
  const queue = useSyncStore((s) => s.queue);
  const { t } = useMobileI18n();
  const [showSynced, setShowSynced] = useState(false);
  const prevOnlineRef = useRef(isOnline);

  const pendingCount = queue.length;

  useEffect(() => {
    const wasOnline = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    if (!wasOnline && isOnline) {
      const showTimer = setTimeout(() => setShowSynced(true), 0);
      const hideTimer = setTimeout(() => setShowSynced(false), 3000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOnline]);

  if (isOnline && !showSynced) return null;

  return (
    <AnimatePresence mode="wait">
      {isOnline && showSynced ? (
        <motion.div
          key="synced"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 px-4',
              'bg-emerald-500/15 border-b border-emerald-500/20',
            )}
          >
            <Check size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">
              {t('common.synced')}
            </span>
          </div>
        </motion.div>
      ) : !isOnline ? (
        <motion.div
          key="offline"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'flex items-center justify-between py-2.5 px-4',
              'bg-amber-400/10 border-b border-amber-400/20',
            )}
          >
            <div className="flex items-center gap-2">
              <WifiOff size={14} className="text-amber-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-amber-400">
                {t('common.offline')}
                {pendingCount > 0 && (
                  <> · {pendingCount} {t('common.pendingChanges')}</>
                )}
              </span>
            </div>

            {onRetry && (
              <button type="button"                 onClick={onRetry}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg',
                  'bg-amber-400/10 active:bg-amber-400/20 transition-colors',
                )}
              >
                <RefreshCw size={12} className="text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-400">{t('common.retry')}</span>
              </button>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
