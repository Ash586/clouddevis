import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

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

    const data: Record<string, any> = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (status) { data.handledById = session.adminId; data.handledAt = new Date(); }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
    }
    const updated = await prisma.enterpriseRequest.update({ where: { id }, data });

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
