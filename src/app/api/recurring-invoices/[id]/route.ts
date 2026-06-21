import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function getHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const invoice = await prisma.recurringInvoice.findUnique({ where: { id } });

    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (invoice.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ invoice });
  } catch (error) {
    logger.error('Recurring GET error', { error: String(error) });
    throw error;
  }
}

export const DELETE = withApiErrorHandling(deleteHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function deleteHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;

    const invoice = await prisma.recurringInvoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (invoice.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.recurringInvoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Recurring DELETE error', { error: String(error) });
    throw error;
  }
}
