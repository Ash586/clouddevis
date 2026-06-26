import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAuth(async (_req, session, ctx) => {
  try {
    const { id } = await ctx.params;
    const invoice = await prisma.recurringInvoice.findUnique({ where: { id } });

    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (invoice.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ invoice });
  } catch (error) {
    logger.error('Recurring GET error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });

export const DELETE = withApiErrorHandling(withAuth(async (_req, session, ctx) => {
  try {
    const { id } = await ctx.params;

    const invoice = await prisma.recurringInvoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (invoice.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.recurringInvoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Recurring DELETE error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });
