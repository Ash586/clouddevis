import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (session.role === 'VIEWER') return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { tier } = body;

    if (!tier || !['AFFILIATE', 'SUPER_AFFILIATE'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    const updated = await prisma.partner.update({
      where: { id },
      data: { tier },
    });

    return NextResponse.json({ success: true, partner: { id: updated.id, tier: updated.tier } });
  } catch (error) {
    logger.error('Admin update partner tier error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
