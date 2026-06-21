import * as Sentry from '@sentry/nextjs';

export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    console.error(`[ERROR] ${message}`, context ?? '');
    Sentry.captureException(new Error(message), { extra: context });
  },

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[WARN] ${message}`, context ?? '');
    Sentry.captureMessage(message, { level: 'warning', extra: context });
  },

  info(message: string, context?: Record<string, unknown>) {
    console.info(`[INFO] ${message}`, context ?? '');
  },

  setUser(userId: string, email?: string) {
    Sentry.setUser({ id: userId, email });
  },

  clearUser() {
    Sentry.setUser(null);
  },
};
