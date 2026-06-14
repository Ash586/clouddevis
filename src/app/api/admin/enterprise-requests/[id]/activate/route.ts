import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const er = await prisma.enterpriseRequest.findUnique({ where: { id } });
    if (!er) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

    await prisma.user.update({
      where: { id: er.userId },
      data: { subscriptionStatus: 'ENTERPRISE', subscriptionEndAt: null, maxTeamMembers: 999 },
    });

    await prisma.enterpriseRequest.update({
      where: { id },
      data: { status: 'APPROVED', handledById: session.adminId, handledAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        adminId: session.adminId,
        action: 'UPDATE',
        entity: 'SUBSCRIPTION',
        entityId: er.userId,
        details: { enterpriseActivated: true, requestId: id },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Activate enterprise', { error: String(error) });
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
