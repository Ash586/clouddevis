/**
 * Minimal structured logger for server-side API routes.
 * In production, replace with a proper logging service (e.g., Pino, Datadog, Sentry).
 */
export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    console.error(`[ERROR] ${message}`, context ?? '');
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[WARN] ${message}`, context ?? '');
  },
  info(message: string, context?: Record<string, unknown>) {
    console.info(`[INFO] ${message}`, context ?? '');
  },
};
