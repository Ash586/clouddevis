import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAuth(async (req, session) => {
  try {
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
        include: { _count: { select: { documents: true } } },
      }),
      prisma.client.count({ where }),
    ]);

    // Single query for latest document per client (avoids N+1)
    const clientIds = clients.map(c => c.id);
    type LastDocRow = { clientId: string; number: string; totalTTC: number; createdAt: Date };
    const lastDocs = clientIds.length
      ? await prisma.$queryRaw<LastDocRow[]>`
          SELECT DISTINCT ON ("clientId") "clientId", "number", "totalTTC", "createdAt"
          FROM "Document"
          WHERE "clientId" = ANY(${clientIds}::text[])
          ORDER BY "clientId", "createdAt" DESC
        `
      : [];
    const lastDocMap = new Map(lastDocs.map(d => [d.clientId, d]));

    return NextResponse.json({
      clients: clients.map(c => {
        const ld = lastDocMap.get(c.id);
        return {
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
          lastDoc: ld ? {
            number: ld.number,
            total: ld.totalTTC,
            date: new Date(ld.createdAt).toLocaleDateString('fr-DZ'),
          } : null,
          createdAt: c.createdAt.toLocaleDateString('fr-DZ'),
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/clients error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });

export const POST = withApiErrorHandling(withAuth(async (req, session) => {
  try {
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
      },
    });

    return NextResponse.json({ id: client.id, name: client.name }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/clients error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });
