import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function getHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const client = await prisma.client.findFirst({
      where: { id, userId: session.userId },
      include: {
        _count: { select: { documents: true } },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true, number: true, type: true, status: true,
            totalTTC: true, date: true, createdAt: true,
          },
        },
      },
    });

    if (!client) return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });

    const stats = await prisma.document.aggregate({
      where: { clientId: client.id, userId: session.userId },
      _sum: { totalTTC: true, tvaAmount: true },
      _count: true,
    });

    return NextResponse.json({
      client: {
        id: client.id, name: client.name, address: client.address,
        phone: client.phone, email: client.email,
        nif: client.nif, nis: client.nis, rc: client.rc, ai: client.ai,
        createdAt: client.createdAt.toLocaleDateString('fr-DZ'),
      },
      stats: {
        totalDocs: stats._count,
        totalTTC: stats._sum.totalTTC || 0,
        totalTVA: stats._sum.tvaAmount || 0,
      },
      documents: client.documents.map(d => ({
        id: d.id, number: d.number, type: d.type, status: d.status,
        total: d.totalTTC.toLocaleString('fr-DZ', { minimumFractionDigits: 2 }),
        date: d.date.toLocaleDateString('fr-DZ'),
      })),
    });
  } catch (error) {
    logger.error('GET /api/clients/[id] error', { error: String(error) });
    throw error;
  }
}

export const PUT = withApiErrorHandling(putHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function putHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const client = await prisma.client.findFirst({ where: { id, userId: session.userId } });
    if (!client) return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });

    const body = await _req.json();
    const { name, address, phone, email, nif, nis, rc, ai, ice, matriculeFiscal, siret } = body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return NextResponse.json({ error: 'Le nom ne peut pas être vide' }, { status: 400 });
    }

    // Check duplicate name if changing name
    if (name && name.trim() !== client.name) {
      const duplicate = await prisma.client.findFirst({
        where: { userId: session.userId, name: name.trim(), id: { not: id } },
        select: { id: true },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'Un client avec ce nom existe déjà' }, { status: 409 });
      }
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(nif !== undefined && { nif: nif?.trim() || null }),
        ...(nis !== undefined && { nis: nis?.trim() || null }),
        ...(rc !== undefined && { rc: rc?.trim() || null }),
        ...(ai !== undefined && { ai: ai?.trim() || null }),
      },
    });

    return NextResponse.json({ id: updated.id, name: updated.name });
  } catch (error) {
    logger.error('PUT /api/clients/[id] error', { error: String(error) });
    throw error;
  }
}

export const DELETE = withApiErrorHandling(deleteHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function deleteHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const client = await prisma.client.findFirst({ where: { id, userId: session.userId } });
    if (!client) return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });

    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/clients/[id] error', { error: String(error) });
    throw error;
  }
}
