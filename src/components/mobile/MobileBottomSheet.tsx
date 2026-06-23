'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function MobileBottomSheet({ open, onClose, title, children }: MobileBottomSheetProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="mobile-bottom-sheet md:hidden" role="dialog" aria-modal="true">
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content">
        <div className="sheet-handle" />
        {title && (
          <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-[rgba(15,39,71,0.08)]">
            <h3 className="text-sm font-bold text-[var(--sand)]">{title}</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-[var(--sand-muted)] hover:text-[var(--sand)] rounded-lg transition mobile-touch">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
