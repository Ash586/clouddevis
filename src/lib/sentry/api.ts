import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  classifyError,
  getRequestData,
  getErrorMessage,
  sentryUserFromSession,
  shouldDropSentryEvent,
  toSentryLevel,
  type SentryComponent,
  type SentryErrorClassification,
  type SentrySeverity,
  type SentryUserImpact,
} from './errorClassification';

export interface ApiErrorHandlingOptions {
  component?: SentryComponent;
  severity?: SentrySeverity;
  userImpact?: SentryUserImpact;
  route?: string;
  fallbackMessage?: string;
  captureResponses?: boolean;
}

export type ApiRouteHandler = (...args: any[]) => Promise<Response> | Response;

interface CaptureApiErrorInput {
  error: unknown;
  request: Request;
  context?: unknown;
  options: ApiErrorHandlingOptions;
  durationMs: number;
}

export function withApiErrorHandling<T extends ApiRouteHandler>(handler: T, options: ApiErrorHandlingOptions = {}): T {
  return (async function sentryWrappedApiRouteHandler(req, context) {
    const startedAt = Date.now();

    try {
      const response = await handler(req, context);

      if (options.captureResponses !== false && response.status >= 500) {
        await captureApiResponse(response, req, context, options, Date.now() - startedAt);
      }

      return response;
    } catch (error) {
      return captureApiError({
        error,
        request: req,
        context,
        options,
        durationMs: Date.now() - startedAt,
      });
    }
  }) as T;
}

async function captureApiResponse(
  response: Response,
  request: Request,
  context: CaptureApiErrorInput['context'],
  options: ApiErrorHandlingOptions,
  durationMs: number,
) {
  const message = await response.clone().text().catch(() => '');
  const error = new Error(message || `API route returned ${response.status}`);

  await captureApiError({
    error,
    request,
    context,
    options: {
      ...options,
      severity: options.severity || (options.component === 'billing' ? 'critical' : 'high'),
      userImpact: options.userImpact || 'blocking',
    },
    durationMs,
  });
}

async function captureApiError(input: CaptureApiErrorInput) {
  const requestContext = getRequestData(input.request);
  const classification = classifyError(input.error, {
    method: input.request.method,
    path: requestContext.pathname,
    url: requestContext.url,
    durationMs: input.durationMs,
    userAgent: requestContext.headers['user-agent'],
    route: input.options.route,
    component: input.options.component,
    severity: input.options.severity,
    userImpact: input.options.userImpact,
  });

  if (!shouldDropSentryEvent(input.error, { ...classification, ...requestContext, durationMs: input.durationMs })) {
    await captureApiSentryEvent(input, requestContext, classification);
  }

  logger.error(`API ${input.request.method} ${requestContext.pathname} failed`, {
    error: getErrorMessage(input.error),
    durationMs: input.durationMs,
    ...classification,
  });

  return NextResponse.json({ error: input.options.fallbackMessage || 'Erreur interne' }, { status: 500 });
}

async function captureApiSentryEvent(
  input: CaptureApiErrorInput,
  requestContext: ReturnType<typeof getRequestData>,
  classification: SentryErrorClassification,
) {
  Sentry.withScope(async (scope) => {
    scope.setLevel(toSentryLevel(classification.severity));
    scope.setTags({
      severity: classification.severity,
      component: classification.component,
      user_impact: classification.userImpact,
    });
    scope.setContext('request', {
      url: requestContext.url,
      method: input.request.method,
      pathname: requestContext.pathname,
      duration_ms: input.durationMs,
    });
    scope.setContext('app', {
      version: process.env.npm_package_version || 'local',
      environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || 'development',
    });
    scope.addBreadcrumb({
      category: 'http',
      level: 'error',
      message: `${input.request.method} ${requestContext.pathname}`,
      data: {
        status: 500,
        duration_ms: input.durationMs,
        route: input.options.route,
      },
    });

    const session = await getSession().catch(() => null);
    const user = sentryUserFromSession(session);
    if (user) scope.setUser(user);
    Sentry.captureException(input.error);
  });
}
