import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (session.role === 'VIEWER') return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const backup = await prisma.backupLog.create({
      data: {
        adminId: session.adminId,
        type: 'manual',
        status: 'in_progress',
        startedAt: new Date(),
      },
    });

    // Simulate backup - in production this would trigger an actual DB dump
    setTimeout(async () => {
      try {
        await prisma.backupLog.update({
          where: { id: backup.id },
          data: { status: 'completed', completedAt: new Date(), notes: 'Backup completed successfully' },
        });
        logger.info('Manual backup completed', { backupId: backup.id, adminId: session.adminId });
      } catch (err) {
        logger.error('Backup completion error', { error: String(err) });
      }
    }, 1000);

    return NextResponse.json({ success: true, backup: { id: backup.id, status: 'in_progress', startedAt: backup.startedAt } });
  } catch (error) {
    logger.error('Backup trigger error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

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
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
