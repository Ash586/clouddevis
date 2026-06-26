import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Prisma } from '@prisma/client';

export const GET = withApiErrorHandling(withAuth(async (_req, session) => {
  try {
    const invoices = await prisma.recurringInvoice.findMany({
      where: { userId: session.userId },
      orderBy: { nextDate: 'asc' },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    logger.error('Recurring GET error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });

export const POST = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const { name, documentType, frequency, nextDate, template, settings } = body;

    if (!name || !nextDate) {
      return NextResponse.json({ error: 'Name and nextDate are required' }, { status: 400 });
    }

    const invoice = await prisma.recurringInvoice.create({
      data: {
        userId: session.userId,
        name,
        documentType: documentType || 'FACTURE',
        frequency: frequency || 'MONTHLY',
        nextDate: new Date(nextDate),
        template: template || {},
        settings: settings || {},
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    logger.error('Recurring POST error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });

export const PATCH = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const { id, name, documentType, frequency, nextDate, template, settings } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const invoice = await prisma.recurringInvoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (invoice.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data: Prisma.RecurringInvoiceUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (documentType !== undefined) data.documentType = documentType;
    if (frequency !== undefined) data.frequency = frequency;
    if (nextDate !== undefined) data.nextDate = new Date(nextDate);
    if (template !== undefined) data.template = template;
    if (settings !== undefined) data.settings = settings;

    const updated = await prisma.recurringInvoice.update({
      where: { id },
      data,
    });

    return NextResponse.json({ invoice: updated });
  } catch (error) {
    logger.error('Recurring PATCH error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });
