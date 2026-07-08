'use client';

// ============================================================
// Rakmana Mobile — Preview Page
// Renders the mobile app in a phone frame for browser preview
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Minimize, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileShell } from '@/mobile/components/MobileShell';

export default function MobilePreviewPage() {
  const [fullscreen, setFullscreen] = useState(false);
  const [key, setKey] = useState(0); // Force remount to reset state

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center',
        'bg-gradient-to-br from-[#0B0F1A] via-[#111827] to-[#1E40AF]',
        'p-4',
      )}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      {!fullscreen && (
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-[var(--sand)]">
            Rakmana <span className="text-[#1D4ED8]">Mobile</span>
          </h1>
          <p className="text-sm text-[var(--sand-muted)] mt-1">
            Aperçu de l&apos;application mobile
          </p>
        </motion.div>
      )}

      {/* ── Phone Frame ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {fullscreen ? (
          /* ── Fullscreen mode ── */
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-[var(--navy)]"
          >
            <MobileShell key={key} />

            {/* Floating controls */}
            <div className="fixed top-4 right-4 z-[70] flex gap-2">
              <button type="button"                 onClick={() => setKey((k) => k + 1)}
                className="w-10 h-10 rounded-full bg-[rgba(15,39,71,0.1)] backdrop-blur-md flex items-center justify-center text-[var(--sand)] active:scale-95 transition-transform"
                title="Réinitialiser"
              >
                <RefreshCw size={18} />
              </button>
              <button type="button"                 onClick={() => setFullscreen(false)}
                className="w-10 h-10 rounded-full bg-[rgba(15,39,71,0.1)] backdrop-blur-md flex items-center justify-center text-[var(--sand)] active:scale-95 transition-transform"
                title="Quitter le plein écran"
              >
                <Minimize size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Phone frame mode ── */
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative"
          >
            {/* Phone外壳 (frame) */}
            <div
              className={cn(
                'relative rounded-[3rem] overflow-hidden',
                'bg-[#1a1a2e] p-2',
                'shadow-2xl shadow-black/40',
                'border border-[rgba(15,39,71,0.08)]',
              )}
              style={{
                width: '390px',
                height: '844px',
                maxHeight: 'calc(100vh - 160px)',
              }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[150px] h-[30px] bg-[#1a1a2e] rounded-b-2xl" />

              {/* Screen */}
              <div
                className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-[var(--navy)]"
                style={{
                  paddingTop: 'env(safe-area-inset-top, 0px)',
                  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                }}
              >
                <MobileShell key={key} />
              </div>
            </div>

            {/* ── Controls ────────────────────────────────── */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button type="button"                 onClick={() => setKey((k) => k + 1)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl',
                  'bg-[rgba(15,39,71,0.08)] text-[var(--sand-muted)]',
                  'text-xs font-semibold',
                  'active:scale-95 transition-transform',
                  'hover:bg-[rgba(15,39,71,0.12)] hover:text-[var(--sand)]',
                )}
              >
                <RefreshCw size={14} />
                Réinitialiser
              </button>
              <button type="button"                 onClick={() => setFullscreen(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl',
                  'bg-[#1E40AF] text-white',
                  'text-xs font-semibold',
                  'active:scale-95 transition-transform',
                  'hover:bg-[#1D4ED8]',
                )}
              >
                <Maximize size={14} />
                Plein écran
              </button>
            </div>

            {/* ── Info ────────────────────────────────────── */}
            <div className="text-center mt-4">
              <p className="text-[11px] text-[var(--sand-muted)]">
                390 × 844 px · iPhone 14 Pro
              </p>
              <p className="text-[10px] text-[var(--sand-muted)]/60 mt-1">
                Naviguez entre les onglets · Créez un document · Gérez vos clients
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
