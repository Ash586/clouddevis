import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { hasPermission } from '@/lib/admin/permissions';
import type { FeedbackStatus } from '@prisma/client';

const VALID_STATUSES = ['NEW', 'REVIEWED', 'RESOLVED'];
const MAX_REPLY = 2000;

export const GET = withApiErrorHandling(withAdminAuth(async (req, session, ctx) => {
  try {
    if (!hasPermission(session.role, 'feedback:read')) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }
    const { id } = await ctx.params;
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
    if (!feedback) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

    return NextResponse.json({ ...feedback, createdAt: feedback.createdAt.toISOString() });
  } catch (error) {
    logger.error('Fetch feedback detail', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const PATCH = withApiErrorHandling(withAdminAuth(async (req, session, ctx) => {
  try {
    if (!hasPermission(session.role, 'feedback:write')) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const status = typeof body.status === 'string' ? body.status : undefined;
    const reply = typeof body.reply === 'string' ? body.reply.trim() : '';

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    if (reply.length > MAX_REPLY) {
      return NextResponse.json({ error: `Réponse trop longue (max ${MAX_REPLY})` }, { status: 400 });
    }

    const feedback = await prisma.feedback.findUnique({ where: { id } });
    if (!feedback) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

    // A reply implies the feedback has at least been reviewed. If the admin sent a
    // reply without an explicit status, mark it REVIEWED so it leaves the NEW queue.
    const nextStatus = (status as FeedbackStatus | undefined)
      ?? (reply && feedback.status === 'NEW' ? 'REVIEWED' : undefined);

    const result = await prisma.$transaction(async (tx) => {
      const updated = nextStatus
        ? await tx.feedback.update({ where: { id }, data: { status: nextStatus } })
        : feedback;

      let notified = false;
      if (reply) {
        // Deliver the admin's reply to the user's in-app notification centre.
        await tx.notification.create({
          data: {
            userId: feedback.userId,
            type: feedback.type === 'BUG' ? 'INFO' : 'SUCCESS',
            title: feedback.type === 'BUG'
              ? 'Réponse à votre signalement'
              : 'Réponse à votre suggestion',
            message: reply,
            link: '/dashboard',
          },
        });
        notified = true;
      }

      await tx.activityLog.create({
        data: {
          adminId: session.adminId,
          userId: feedback.userId,
          action: 'UPDATE',
          entity: 'SYSTEM',
          entityId: id,
          details: { feedback: true, status: nextStatus ?? feedback.status, replied: notified },
        },
      });

      return { updated, notified };
    });

    return NextResponse.json({
      ok: true,
      status: result.updated.status,
      replied: result.notified,
    });
  } catch (error) {
    logger.error('Update feedback', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
