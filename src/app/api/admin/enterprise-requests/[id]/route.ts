import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { EnterpriseRequestStatus } from '@prisma/client';
import { hasPermission } from '@/lib/admin/permissions';

const VALID_REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const GET = withApiErrorHandling(withAdminAuth(async (req, session, ctx) => {
  try {
    const { id } = await ctx.params;
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
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const PATCH = withApiErrorHandling(withAdminAuth(async (req, session, ctx) => {
  try {
    if (!hasPermission(session.role, 'subscriptions:write')) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const { status, notes } = body as { status?: string; notes?: string };

    if (status && !VALID_REQUEST_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

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
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
