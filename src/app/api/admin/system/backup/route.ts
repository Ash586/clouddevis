import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(withAdminAuth(async (_req, session) => {
  if (session.role === 'VIEWER') return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

  // Database backups are managed by Neon's automated backup system.
  // Manual on-demand backup is not implemented — log the attempt and return 501.
  logger.warn('Manual backup requested but not implemented', { adminId: session.adminId });

  const log = await prisma.backupLog.create({
    data: {
      adminId: session.adminId,
      type: 'manual',
      status: 'failed',
      startedAt: new Date(),
      notes: 'Manual backup not implemented — use Neon Console for on-demand snapshots.',
    },
  });

  return NextResponse.json(
    { error: 'Manual backup not implemented. Use Neon Console for on-demand snapshots.', logId: log.id },
    { status: 501 },
  );
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const GET = withApiErrorHandling(withAdminAuth(async (req, session) => {
  try {
    const backups = await prisma.backupLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
      include: {
        admin: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      backups: backups.map(b => ({
        id: b.id,
        type: b.type,
        status: b.status,
        size: b.size,
        notes: b.notes,
        adminName: b.admin?.name || null,
        startedAt: b.startedAt.toISOString(),
        completedAt: b.completedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    logger.error('Backup list error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
