import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { migrateUserCompany } from '@/lib/migrateDeprecated';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAuth(async (_req, session) => {
  try {
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
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const PUT = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const allowedFields = ['name', 'phone', 'country', 'sector', 'mode', 'language', 'companyInfo'];
    const data: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    if (data.mode && !['ARTISAN', 'ENTREPRISE'].includes(data.mode as string)) {
      return NextResponse.json({ error: 'Mode invalide' }, { status: 400 });
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: session.userId }, data });
    if (body.companyInfo) migrateUserCompany(session.userId).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('PUT /api/user/profile', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
