'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles } from 'lucide-react';

interface UpdateBannerProps {
  visible: boolean;
  newVersion: string;
  releaseNotes: string;
  apkUrl: string;
  onDismiss: () => void;
}

export function UpdateBanner({ visible, newVersion, releaseNotes, apkUrl, onDismiss }: UpdateBannerProps) {
  const handleDownload = () => {
    if (apkUrl) window.open(apkUrl, '_blank');
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-[80] max-w-lg mx-auto"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="mx-3 mt-2 rounded-2xl bg-[var(--green-2)] shadow-xl overflow-hidden">
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white">
                  Mise à jour disponible — v{newVersion}
                </p>
                <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed">
                  {releaseNotes}
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[var(--green-2)] text-[12px] font-bold active:scale-95 transition-transform"
                >
                  <Download size={13} />
                  Télécharger
                </button>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                aria-label="Fermer"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
