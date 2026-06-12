import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { EnterpriseRequestStatus } from '@prisma/client';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const request = await prisma.enterpriseRequest.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, id: true } },
        handledBy: { select: { name: true } },
      },
    });
    if (!request) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

    return NextResponse.json(request);
  } catch (error) {
    logger.error('Fetch enterprise request detail', { error: String(error) });
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body as { status?: string; notes?: string };

    const updateData: { status?: EnterpriseRequestStatus; notes?: string; handledBy?: { connect: { id: string } }; handledAt?: Date } = {};
    if (status) updateData.status = status as EnterpriseRequestStatus;
    if (notes !== undefined) updateData.notes = notes;
    if (status) { updateData.handledBy = { connect: { id: session.adminId } }; updateData.handledAt = new Date(); }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
    }
    const updated = await prisma.enterpriseRequest.update({ where: { id }, data: updateData });

    await prisma.activityLog.create({
      data: {
        adminId: session.adminId,
        action: 'UPDATE',
        entity: 'SUBSCRIPTION',
        entityId: id,
        details: { status, notes },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('Update enterprise request', { error: String(error) });
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
