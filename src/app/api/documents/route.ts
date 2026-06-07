import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.userId };
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (type) {
      const validTypes = ['DEVIS', 'PROFORMA', 'BC', 'BR', 'FACTURE'];
      const upperType = type.toUpperCase();
      if (validTypes.includes(upperType)) where.type = upperType;
    }
    if (status) {
      const validStatuses = ['DRAFT', 'ACCEPTED', 'PROGRESS', 'DELIVERED'];
      const upperStatus = status.toUpperCase();
      if (validStatuses.includes(upperStatus)) where.status = upperStatus;
    }
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from && !isNaN(new Date(from).getTime())) dateFilter.gte = new Date(from);
      if (to && !isNaN(new Date(to).getTime())) dateFilter.lte = new Date(to + 'T23:59:59');
      if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;
    }

    const [docs, total, statusGroup, typeGroup] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { client: { select: { name: true } } },
      }),
      prisma.document.count({ where }),
      prisma.document.groupBy({
        by: ['status'],
        where: { userId: session.userId },
        _count: { status: true },
      }),
      prisma.document.groupBy({
        by: ['type'],
        where: { userId: session.userId },
        _count: { type: true },
        _sum: { totalTTC: true },
      }),
    ]);

    const statusBreakdown: Record<string, number> = {};
    for (const row of statusGroup) statusBreakdown[row.status] = row._count.status;

    const typeBreakdown: Record<string, { count: number; total: number }> = {};
    for (const row of typeGroup) {
      typeBreakdown[row.type] = { count: row._count.type, total: row._sum.totalTTC || 0 };
    }

    return NextResponse.json({
      documents: docs.map(d => ({
        id: d.id, number: d.number, type: d.type, status: d.status,
        client: d.client?.name || '',
        total: d.totalTTC.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        date: d.date.toISOString().split('T')[0],
        createdAt: d.createdAt.toISOString().split('T')[0],
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      statusBreakdown,
      typeBreakdown,
    });
  } catch (error) {
    logger.error('GET /api/documents error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

const VALID_STATUSES = ['DRAFT', 'ACCEPTED', 'PROGRESS', 'DELIVERED'];

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

    const upperStatus = String(status).toUpperCase();
    if (!VALID_STATUSES.includes(upperStatus)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({ where: { id, userId: session.userId } });
    if (!doc) return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });

    const updated = await prisma.document.update({
      where: { id },
      data: { status: upperStatus as 'DRAFT' | 'ACCEPTED' | 'PROGRESS' | 'DELIVERED' },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    logger.error('PATCH /api/documents error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
