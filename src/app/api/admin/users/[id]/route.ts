import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, country: true, mode: true, sector: true,
        subscriptionStatus: true, trialStartAt: true, subscriptionEndAt: true, createdAt: true,
        _count: { select: { documents: true, clients: true, templates: true } },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user: { ...user, createdAt: user.createdAt.toISOString().split('T')[0] } });
  } catch (error) {
    logger.error('Admin user detail error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { subscriptionStatus, mode } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
    if (mode) updateData.mode = mode;

    const updated = await prisma.user.update({ where: { id }, data: updateData });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        adminId: session.adminId,
        userId: id,
        action: 'UPDATE',
        entity: 'USER',
        entityId: id,
        details: JSON.parse(JSON.stringify({ changes: updateData })),
      },
    });

    return NextResponse.json({ success: true, user: { id: updated.id, subscriptionStatus: updated.subscriptionStatus } });
  } catch (error) {
    logger.error('Admin user update error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.user.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        adminId: session.adminId,
        action: 'DELETE',
        entity: 'USER',
        entityId: id,
        details: { email: user.email, name: user.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Admin user delete error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
