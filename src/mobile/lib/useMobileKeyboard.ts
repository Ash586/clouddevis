'use client';

// ============================================================
// Rakmana Mobile — keyboard awareness for the creator screen
// Native: uses @capacitor/keyboard show/hide events.
// Web/browser preview: falls back to a visualViewport heuristic.
// Also scrolls the focused input into view when the keyboard opens
// so dock fields never hide behind it.
// ============================================================

import { useEffect, useState } from 'react';

/**
 * Returns true while the on-screen keyboard is open, and keeps the
 * currently-focused text field scrolled into view.
 */
export function useMobileKeyboard(): boolean {
  const [open, setOpen] = useState(false);

  // ── keyboard open/close ──
  useEffect(() => {
    let disposed = false;
    const removers: Array<() => void> = [];
    const track = (fn: () => void) => { if (disposed) fn(); else removers.push(fn); };

    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { Keyboard } = await import('@capacitor/keyboard');
          const show = await Keyboard.addListener('keyboardWillShow', () => setOpen(true));
          const hide = await Keyboard.addListener('keyboardWillHide', () => setOpen(false));
          track(() => { show.remove(); hide.remove(); });
          return;
        }
      } catch {
        // not native → fall through to the web heuristic
      }
      if (typeof window !== 'undefined' && window.visualViewport) {
        const vv = window.visualViewport;
        const onResize = () => setOpen(vv.height < window.innerHeight - 120);
        vv.addEventListener('resize', onResize);
        track(() => vv.removeEventListener('resize', onResize));
      }
    })();

    return () => { disposed = true; removers.forEach((r) => r()); };
  }, []);

  // ── keep the focused field visible ──
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !el.matches?.('input, textarea, select')) return;
      // Defer so the keyboard has resized the viewport first.
      setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  return open;
}
