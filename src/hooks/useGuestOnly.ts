'use client';

// ============================================================
// Rakmana — Guest-only guard
// Login/Register are for logged-OUT visitors. If an authenticated
// user lands here (e.g. clicks a marketing "Commencer" CTA while
// their session is still open), bounce them to the dashboard instead
// of showing a sign-in/sign-up form they don't need.
// Not render-gated: anonymous visitors (the common case) see the form
// immediately; only an already-authed visitor gets a brief redirect.
// ============================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useGuestOnly(target = '/dashboard') {
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!cancelled && res.status === 200) router.replace(target);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [router, target]);
}
