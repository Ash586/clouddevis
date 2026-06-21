'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { classifyError, toSentryLevel, type SentryComponent, type SentrySeverity, type SentryUserImpact } from '@/lib/sentry/errorClassification';
import { ErrorFallback } from './ErrorFallback';

export function RouteError({
  error,
  resetError,
  component = 'dashboard',
  severity = 'high',
  userImpact = 'blocking',
}: {
  error: Error & { digest?: string };
  resetError: () => void;
  component?: SentryComponent;
  severity?: SentrySeverity;
  userImpact?: SentryUserImpact;
}) {
  useEffect(() => {
    const classification = classifyError(error, { component, severity, userImpact });

    Sentry.withScope((scope) => {
      scope.setLevel(toSentryLevel(classification.severity));
      scope.setTags({
        severity: classification.severity,
        component: classification.component,
        user_impact: classification.userImpact,
      });
      if (error.digest) scope.setContext('next', { digest: error.digest });
      Sentry.captureException(error);
    });
  }, [component, error, severity, userImpact]);

  return <ErrorFallback error={error} resetError={resetError} />;
}
