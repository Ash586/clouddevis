import './sentry.client.config';
import * as Sentry from '@sentry/nextjs';

export function onRouterTransitionStart(url: string) {
  Sentry.addBreadcrumb({
    category: 'navigation',
    level: 'info',
    message: `Navigation started: ${url}`,
  });
}
