import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(withAuth(async (req, session, ctx) => {
  try {
    const { id } = await ctx!.params as { id: string };
    const { email, permission } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // Verify ownership
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (document.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Find user by email
    const targetUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (targetUser.id === session.userId) return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 });

    // Check if already shared
    const existing = await prisma.documentShare.findUnique({
      where: { documentId_sharedWithId: { documentId: id, sharedWithId: targetUser.id } },
    });
    if (existing) return NextResponse.json({ error: 'Already shared with this user' }, { status: 409 });

    const share = await prisma.documentShare.create({
      data: {
        documentId: id,
        sharedWithId: targetUser.id,
        permission: permission || 'VIEW',
      },
    });

    return NextResponse.json({ share }, { status: 201 });
  } catch (error) {
    logger.error('Document share POST error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });

export const GET = withApiErrorHandling(withAuth(async (_req, session, ctx) => {
  try {
    const { id } = await ctx!.params as { id: string };
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (document.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const shares = await prisma.documentShare.findMany({
      where: { documentId: id },
      include: {
        sharedWith: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ shares });
  } catch (error) {
    logger.error('Document shares GET error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });

export const DELETE = withApiErrorHandling(withAuth(async (req, session, ctx) => {
  try {
    const { id } = await ctx!.params as { id: string };
    const { sharedWithId } = await req.json();

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (document.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.documentShare.delete({
      where: { documentId_sharedWithId: { documentId: id, sharedWithId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Document share DELETE error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });
