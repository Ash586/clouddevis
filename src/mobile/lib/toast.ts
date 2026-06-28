// CloudDevis Mobile — lightweight toast helper

import { logger } from '@/lib/logger';

/** Show a native toast when running under Capacitor, falling back to a log. */
export async function notify(message: string): Promise<void> {
  try {
    const { Toast } = await import('@capacitor/toast');
    await Toast.show({ text: message, duration: 'short' });
  } catch {
    if (typeof window !== 'undefined') logger.info(message);
  }
}
