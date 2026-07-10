import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { remindOverdueInvoices } from '@/lib/reminders';

/**
 * Create in-app reminder notifications for the caller's overdue unpaid invoices.
 * Idempotent within a 7-day cooldown per invoice, so the dashboard can call it on
 * every load without spamming. Returns the number of reminders created this run.
 */
export const POST = withApiErrorHandling(withAuth(async (_req, session) => {
  try {
    const created = await remindOverdueInvoices(session.userId);
    return NextResponse.json({ ok: true, created });
  } catch (error) {
    logger.error('POST /api/reminders/overdue error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'low', userImpact: 'degraded' });
