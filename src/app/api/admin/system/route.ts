import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const now = new Date();
    const memUsage = process.memoryUsage();

    const [totalUsers, totalDocs, totalClients, totalTemplates, totalAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.client.count(),
      prisma.template.count(),
      prisma.admin.count(),
    ]);

    return NextResponse.json({
      status: 'healthy',
      timestamp: now.toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
      counts: { users: totalUsers, documents: totalDocs, clients: totalClients, templates: totalTemplates, admins: totalAdmins },
      nodeVersion: process.version,
    });
  } catch (error) {
    logger.error('Admin system error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
