import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateReferralCode } from '@/lib/partner';

export const POST = withApiErrorHandling(postHandler, { component: 'api', severity: 'medium', userImpact: 'degraded' });
async function postHandler(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const existing = await prisma.partner.findUnique({ where: { userId: session.userId } });
    if (existing) return NextResponse.json({ error: 'Vous êtes déjà partenaire' }, { status: 400 });

    const body = await req.json();
    const { fullName, wilaya, sector, howPromote, stats: extraStats } = body;

    if (!fullName || !wilaya || !sector || !howPromote) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    const code = await generateReferralCode();

    const partner = await prisma.partner.create({
      data: {
        userId: session.userId,
        code,
        tier: 'AFFILIATE',
        status: 'PENDING',
        stats: extraStats || { fullName, wilaya, sector, howPromote },
      },
    });

    return NextResponse.json({ success: true, partner: { id: partner.id, code, status: partner.status } });
  } catch (error) {
    logger.error('Partner apply error', { error: String(error) });
    throw error;
  }
}
