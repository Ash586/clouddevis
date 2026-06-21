import type { SessionUser } from '@/lib/auth';
import { getPlanByStatus } from '@/lib/pricing';

export type SentrySeverity = 'critical' | 'high' | 'medium' | 'low';
export type SentryComponent = 'auth' | 'billing' | 'invoice' | 'dashboard' | 'api';
export type SentryUserImpact = 'blocking' | 'degraded' | 'cosmetic';

export interface SentryErrorContext {
  component?: SentryComponent;
  severity?: SentrySeverity;
  userImpact?: SentryUserImpact;
  method?: string;
  path?: string;
  url?: string;
  status?: number;
  durationMs?: number;
  userAgent?: string;
  route?: string;
}

export interface SentryErrorClassification {
  severity: SentrySeverity;
  component: SentryComponent;
  userImpact: SentryUserImpact;
}

const BOT_PATTERNS = [
  'bot',
  'crawler',
  'spider',
  'slurp',
  'bingpreview',
  'facebookexternalhit',
  'linkedinbot',
  'twitterbot',
  'whatsapp',
  'telegrambot',
  'discordbot',
];

const TIMEOUT_PATTERNS = /timeout|timed out|ETIMEDOUT|ECONNABORTED|ERR_CANCELED|networkerror|failed to fetch/i;

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function isBotUserAgent(userAgent = '') {
  const value = userAgent.toLowerCase();
  return BOT_PATTERNS.some((pattern) => value.includes(pattern));
}

export function isResizeObserverLoop(error: unknown) {
  return /resizeobserver loop/i.test(getErrorMessage(error));
}

export function isBrowserNetworkTimeout(error: unknown, durationMs?: number) {
  return Boolean(durationMs && durationMs > 0 && durationMs < 2000 && TIMEOUT_PATTERNS.test(getErrorMessage(error)));
}

export function shouldDropSentryEvent(error: unknown, context: SentryErrorContext = {}) {
  if (isResizeObserverLoop(error)) return true;
  if (isBrowserNetworkTimeout(error, context.durationMs)) return true;
  if (isBotUserAgent(context.userAgent)) return true;
  return false;
}

export function classifyError(error: unknown, context: SentryErrorContext = {}): SentryErrorClassification {
  const message = getErrorMessage(error);
  const component = context.component || getComponentFromContext(context);
  const severity = context.severity || getSeverityFromContext(message, component, context);
  const userImpact = context.userImpact || getUserImpact(severity);

  return { severity, component, userImpact };
}

export function getRequestData(request?: Request) {
  const url = request?.url || '';
  const method = request?.method || 'GET';
  const userAgent = request?.headers.get('user-agent') || request?.headers.get('User-Agent') || '';
  const parsedUrl = url.startsWith('http') ? new URL(url) : null;
  const pathname = parsedUrl?.pathname || url || '/';

  return {
    url,
    method,
    pathname,
    headers: {
      'user-agent': userAgent,
    },
  };
}

export function sentryUserFromSession(session: SessionUser | null) {
  if (!session) return undefined;

  const plan = getPlanByStatus(session.subscriptionStatus);

  return {
    id: session.userId,
    email: session.email,
    username: session.email,
    plan: session.subscriptionStatus,
    planId: plan.id,
    planName: plan.name.fr,
    country: session.country,
  };
}

function getComponentFromContext(context: SentryErrorContext) {
  const value = `${context.method || ''} ${context.path || context.url || context.route || ''}`.toLowerCase();

  if (value.includes('/auth')) return 'auth';
  if (value.includes('/subscription') || value.includes('/subscribe') || value.includes('/webhooks/lemon-squeezy') || value.includes('/admin/subscriptions')) return 'billing';
  if (value.includes('/documents') || value.includes('/clients') || value.includes('/templates') || value.includes('/reports') || value.includes('/export') || value.includes('/recurring-invoices') || value.includes('/r/')) return 'invoice';
  if (value.includes('/dashboard') || value.includes('/user') || value.includes('/teams') || value.includes('/notifications') || value.includes('/admin')) return 'dashboard';
  return 'api';
}

function getSeverityFromContext(message: string, component: SentryComponent, context: SentryErrorContext) {
  const status = context.status || 0;
  const billingPattern = /payment|subscription|billing|webhook|lemon|wise|invoice/i;
  const criticalPattern = /database|prisma|invariant|unhandled|payment|subscription|billing|webhook|lemon|wise/i;

  if (component === 'billing' && (status >= 500 || billingPattern.test(message))) return 'critical';
  if (criticalPattern.test(message)) return 'high';
  if (component === 'auth' && status >= 400) return 'high';
  if (isResizeObserverLoop(message) || isBrowserNetworkTimeout(message, context.durationMs)) return 'low';
  return 'medium';
}

function getUserImpact(severity: SentrySeverity): SentryUserImpact {
  if (severity === 'critical' || severity === 'high') return 'blocking';
  if (severity === 'low') return 'cosmetic';
  return 'degraded';
}

export type SentryLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export function toSentryLevel(severity: SentrySeverity): SentryLevel {
  const map: Record<SentrySeverity, SentryLevel> = {
    critical: 'fatal',
    high: 'error',
    medium: 'warning',
    low: 'info',
  };
  return map[severity];
}
