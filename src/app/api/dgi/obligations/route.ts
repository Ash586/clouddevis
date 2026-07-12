import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeFiscalSummary } from '@/lib/fiscal';

export const GET = withAuth(async (req, session) => {
  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()), 10);

  const invoices = await prisma.document.findMany({
    where: {
      userId: session.userId,
      type: 'FACTURE',
      status: { not: 'DRAFT' },
      date: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    select: {
      totalTTC: true,
      tvaAmount: true,
      timbreFiscal: true,
      date: true,
    },
  });

  const now = new Date();
  const summary = computeFiscalSummary(invoices, year, now);

  return NextResponse.json(summary);
});
