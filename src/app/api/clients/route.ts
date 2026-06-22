import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(getHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function getHandler(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.userId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { nif: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { documents: true } },
          documents: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { number: true, totalTTC: true, createdAt: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      clients: clients.map(c => ({
        id: c.id,
        name: c.name,
        address: c.address,
        phone: c.phone,
        email: c.email,
        nif: c.nif,
        nis: c.nis,
        rc: c.rc,
        ai: c.ai,
        docCount: c._count.documents,
        lastDoc: c.documents[0] ? {
          number: c.documents[0].number,
          total: c.documents[0].totalTTC,
          date: c.documents[0].createdAt.toLocaleDateString('fr-DZ'),
        } : null,
        createdAt: c.createdAt.toLocaleDateString('fr-DZ'),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/clients error', { error: String(error) });
    throw error;
  }
}

export const POST = withApiErrorHandling(postHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { name, address, phone, email, nif, nis, rc, ai, ice, matriculeFiscal, siret } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du client est requis' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Upsert: find existing or create new to avoid race condition
    const existing = await prisma.client.findFirst({
      where: { userId: session.userId, name: trimmedName },
      select: { id: true },
    });

    if (existing) {
      // Update existing client
      const updated = await prisma.client.update({
        where: { id: existing.id },
        data: {
          address: address?.trim() || null,
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          nif: nif?.trim() || null,
          nis: nis?.trim() || null,
          rc: rc?.trim() || null,
          ai: ai?.trim() || null,
          ice: ice?.trim() || null,
          matriculeFiscal: matriculeFiscal?.trim() || null,
          siret: siret?.trim() || null,
        },
      });
      return NextResponse.json({ id: updated.id, name: updated.name, updated: true });
    }

    const client = await prisma.client.create({
      data: {
        userId: session.userId,
        name: trimmedName,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        nif: nif?.trim() || null,
        nis: nis?.trim() || null,
        rc: rc?.trim() || null,
        ai: ai?.trim() || null,
        ice: ice?.trim() || null,
        matriculeFiscal: matriculeFiscal?.trim() || null,
        siret: siret?.trim() || null,
      },
    });

    return NextResponse.json({ id: client.id, name: client.name }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/clients error', { error: String(error) });
    throw error;
  }
}
