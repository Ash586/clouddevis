import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const invoices = await prisma.recurringInvoice.findMany({
      where: { userId: session.userId },
      orderBy: { nextDate: 'asc' },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    logger.error('Recurring GET error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

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
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const invoice = await prisma.recurringInvoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (invoice.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updated = await prisma.recurringInvoice.update({
      where: { id },
      data: {
        ...updateData,
        nextDate: updateData.nextDate ? new Date(updateData.nextDate) : undefined,
      },
    });

    return NextResponse.json({ invoice: updated });
  } catch (error) {
    logger.error('Recurring PATCH error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
