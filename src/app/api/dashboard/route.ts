import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalDocs, monthDocs, totalClients, allDocs, typeGroup] = await Promise.all([
    prisma.document.count({ where: { userId: session.userId } }),
    prisma.document.count({ where: { userId: session.userId, createdAt: { gte: startOfMonth } } }),
    prisma.client.count({ where: { userId: session.userId } }),
    prisma.document.findMany({
      where: { userId: session.userId },
      select: { totalTTC: true },
    }),
    prisma.document.groupBy({
      by: ['type'],
      where: { userId: session.userId },
      _count: { type: true },
    }),
  ]);

  const totalTTC = (allDocs as { totalTTC: number }[]).reduce((sum, d) => sum + d.totalTTC, 0);

  const typeBreakdown: Record<string, number> = {};
  for (const t of ['DEVIS', 'PROFORMA', 'BC', 'BR', 'FACTURE']) {
    typeBreakdown[t] = 0;
  }
  for (const row of typeGroup) {
    typeBreakdown[row.type] = row._count.type;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, mode: true, phone: true, companyInfo: true, trialStartAt: true, subscriptionEndAt: true, subscriptionStatus: true },
  });

  let trialDaysRemaining = 0;
  if (user?.subscriptionStatus === 'TRIAL' && user.trialStartAt) {
    const trialEnd = new Date(user.trialStartAt);
    trialEnd.setDate(trialEnd.getDate() + 14);
    trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  return NextResponse.json({
    user: {
      name: user?.name || session.name,
      mode: user?.mode || session.mode,
      phone: user?.phone || null,
      companyInfo: user?.companyInfo || null,
    },
    stats: {
      totalDocs,
      monthDocs,
      totalTTC: totalTTC.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalClients,
      trialDaysRemaining,
      typeBreakdown,
    },
  });
}
