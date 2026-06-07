import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
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

  const where: any = { userId: session.userId };
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (type) where.type = type.toUpperCase();
  if (status) where.status = status.toUpperCase();
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
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
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

  const doc = await prisma.document.findFirst({ where: { id, userId: session.userId } });
  if (!doc) return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });

  const updated = await prisma.document.update({
    where: { id },
    data: { status: status.toUpperCase() as any },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
