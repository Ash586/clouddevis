'use client';

import { useEffect, useRef, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'sm' }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const titleId = useId();

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

  const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;
    const timer = setTimeout(() => dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus(), 50);
    document.body.style.overflow = 'hidden';
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', escHandler);
    document.addEventListener('keydown', trapFocus);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', escHandler);
      document.removeEventListener('keydown', trapFocus);
      (triggerRef.current as HTMLElement)?.focus();
    };
  }, [open, onClose, trapFocus]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative bg-[var(--navy-2)] rounded-3xl p-6 w-full text-center shadow-2xl border border-[var(--border-2)] animate-in zoom-in-95',
          sizes[size]
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-3 sm:right-4 w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-3)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-glow)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 id={titleId} className="text-lg font-black text-[var(--sand)] mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
