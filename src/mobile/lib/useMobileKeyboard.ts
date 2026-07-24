'use client';

// Rakmana Mobile — keyboard awareness
// Uses visualViewport heuristic for both web and Android WebView.

import { useEffect, useState } from 'react';

export function useMobileKeyboard(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let disposed = false;
    const removers: Array<() => void> = [];
    const track = (fn: () => void) => { if (disposed) fn(); else removers.push(fn); };

    if (typeof window !== 'undefined' && window.visualViewport) {
      const vv = window.visualViewport;
      const onResize = () => setOpen(vv.height < window.innerHeight - 120);
      vv.addEventListener('resize', onResize);
      track(() => vv.removeEventListener('resize', onResize));
    }

    return () => { disposed = true; removers.forEach((r) => r()); };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !el.matches?.('input, textarea, select')) return;
      setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  return open;
}
