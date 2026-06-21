import type { Instrumentation } from 'next';
import * as Sentry from '@sentry/nextjs';
import { getSession } from '@/lib/auth';
import {
  classifyError,
  getRequestData,
  sentryUserFromSession,
  shouldDropSentryEvent,
  toSentryLevel,
} from '@/lib/sentry/errorClassification';

export async function register() {
  await import('./sentry.server.config');
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const classification = classifyError(error, {
    method: request.method,
    path: request.path,
    route: context.routePath,
  });
  const requestContext = getRequestData({ url: request.path, method: request.method } as Request);
  const user = sentryUserFromSession(await getSession().catch(() => null));

  if (!shouldDropSentryEvent(error, { ...classification, ...requestContext })) {
    Sentry.withScope((scope) => {
      scope.setLevel(toSentryLevel(classification.severity));
      scope.setTags({
        severity: classification.severity,
        component: classification.component,
        user_impact: classification.userImpact,
      });
      scope.setContext('request', requestContext);
      scope.setContext('app', {
        version: process.env.npm_package_version || 'local',
        environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || 'development',
      });
      if (user) scope.setUser(user);
      scope.addBreadcrumb({
        category: 'http',
        level: 'error',
        message: `${request.method} ${request.path}`,
        data: {
          route: context.routePath,
          routerKind: context.routerKind,
          routeType: context.routeType,
        },
      });
      Sentry.captureException(error);
    });
  }
};
