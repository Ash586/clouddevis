'use client';

// ============================================================
// Rakmana Mobile — Biometric Lock Screen
// Shown when the app returns from background after >5 minutes.
// Calls authenticate() and calls onUnlock on success.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, ShieldCheck, AlertCircle } from 'lucide-react';
import { authenticate } from '@/mobile/lib/biometric';

interface BiometricLockScreenProps {
  biometryType: string;
  onUnlock: () => void;
  onLogout: () => void;
}

export function BiometricLockScreen({
  biometryType,
  onUnlock,
  onLogout,
}: BiometricLockScreenProps) {
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'error'>('idle');

  const tryAuth = useCallback(async () => {
    setStatus('authenticating');
    const ok = await authenticate('أكّد هويتك للمتابعة');
    if (ok) {
      onUnlock();
    } else {
      setStatus('error');
    }
  }, [onUnlock]);

  // Trigger automatically on mount
  useEffect(() => {
    void tryAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Icon = biometryType === 'face' ? ShieldCheck : Fingerprint;
  const iconLabel = biometryType === 'face' ? 'Face ID' : 'بصمة الإصبع';

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-between bg-[var(--navy)]"
      style={{
        paddingTop: 'env(safe-area-inset-top, 24px)',
        paddingBottom: 'env(safe-area-inset-bottom, 32px)',
      }}
    >
      {/* Logo */}
      <div className="pt-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d3d24] to-[#0f5132] flex items-center justify-center mx-auto shadow-xl">
          <span className="text-2xl">🧾</span>
        </div>
        <p className="text-center text-[var(--sand-muted)] text-sm mt-3 font-medium">رقمنة</p>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center gap-6 px-8">
        <motion.button
          type="button"
          onClick={tryAuth}
          disabled={status === 'authenticating'}
          whileTap={{ scale: 0.92 }}
          animate={status === 'authenticating' ? { scale: [1, 1.06, 1] } : {}}
          transition={{ repeat: status === 'authenticating' ? Infinity : 0, duration: 0.9 }}
          className="w-24 h-24 rounded-full flex items-center justify-center border-2 disabled:opacity-70 transition-colors"
          style={{
            background: status === 'error'
              ? 'rgba(239,68,68,0.1)'
              : 'rgba(37,99,235,0.12)',
            borderColor: status === 'error'
              ? '#EF4444'
              : 'var(--green-2)',
          }}
          aria-label={`تسجيل الدخول بـ${iconLabel}`}
        >
          <Icon
            size={44}
            strokeWidth={1.4}
            style={{ color: status === 'error' ? '#EF4444' : 'var(--green-2)' }}
          />
        </motion.button>

        <div className="text-center">
          <p className="text-lg font-bold text-[var(--sand)] mb-1">
            {status === 'error' ? 'فشل التحقق' : 'التطبيق مقفل'}
          </p>
          <p className="text-sm text-[var(--sand-muted)]">
            {status === 'error'
              ? 'اضغط على الأيقونة للمحاولة مرة أخرى'
              : `اضغط للتحقق بـ${iconLabel}`}
          </p>
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 mt-2"
            >
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-xs text-red-400">تحقق من البصمة أو الوجه وأعد المحاولة</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Logout escape hatch */}
      <button
        type="button"
        onClick={onLogout}
        className="text-sm text-[var(--sand-muted)] active:opacity-60 transition-opacity py-3 px-4"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
