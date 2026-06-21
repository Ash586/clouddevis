'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

const MAX_BREADCRUMBS = 20;
const breadcrumbs: Array<{ message: string; data: Record<string, unknown>; timestamp: number }> = [];

export function trackSentryAction(message: string, data: Record<string, unknown> = {}) {
  const breadcrumb = {
    message,
    data,
    timestamp: Date.now(),
  };

  breadcrumbs.push(breadcrumb);
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift();

  Sentry.addBreadcrumb({
    category: 'user',
    level: 'info',
    message,
    data,
    timestamp: breadcrumb.timestamp / 1000,
  });
}

function getElementLabel(target: EventTarget | null) {
  const element = target instanceof HTMLElement ? target : null;
  if (!element) return 'unknown';

  const explicit = element.getAttribute('data-sentry-action') || element.getAttribute('aria-label') || element.getAttribute('name') || element.getAttribute('id');
  if (explicit) return explicit;

  const text = element.textContent?.trim().slice(0, 80);
  return text || element.tagName.toLowerCase();
}

function getFormLabel(form: HTMLFormElement) {
  return form.getAttribute('data-sentry-form') || form.getAttribute('aria-label') || form.getAttribute('id') || form.action;
}

export function SentryActionRecorder() {
  const pathname = usePathname();

  useEffect(() => {
    trackSentryAction('route:change', { path: pathname });
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest('button, a, [role="button"], input, select, textarea');
      if (!element) return;

      trackSentryAction('click', {
        label: getElementLabel(element),
        tag: element.tagName.toLowerCase(),
        path: window.location.pathname,
      });
    };

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (!target?.name) return;

      trackSentryAction('input', {
        field: target.name,
        tag: target.tagName.toLowerCase(),
        path: window.location.pathname,
      });
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form) return;

      trackSentryAction('form:submit', {
        form: getFormLabel(form),
        path: window.location.pathname,
      });
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('input', handleInput, true);
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, []);

  return null;
}
