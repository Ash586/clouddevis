import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, email: true, name: true, phone: true,
        country: true, sector: true, mode: true, language: true,
        companyInfo: true, settings: true,
        subscriptionStatus: true, createdAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    logger.error('GET /api/user/profile', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const allowedFields = ['name', 'phone', 'country', 'sector', 'mode', 'language', 'companyInfo'];
    const data: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    if (data.mode && !['ARTISAN', 'ENTREPRISE'].includes(data.mode as string)) {
      return NextResponse.json({ error: 'Mode invalide' }, { status: 400 });
    }

    await prisma.user.update({ where: { id: session.userId }, data });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('PUT /api/user/profile', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
