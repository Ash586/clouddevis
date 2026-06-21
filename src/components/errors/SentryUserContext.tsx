'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export function SentryUserContext() {
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const user = payload?.user;
        if (!user?.userId) return;

        Sentry.setUser({
          id: user.userId,
          email: user.email,
          username: user.email,
          plan: user.subscriptionStatus,
          country: user.country,
        });
      })
      .catch(() => undefined);
  }, []);

  return null;
}
