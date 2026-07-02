import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth, createSession, applySessionCookie } from '@/lib/auth';
import { migrateUserCompany } from '@/lib/migrateDeprecated';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { encryptObjectFields, decryptObjectFields, COMPANY_INFO_SENSITIVE_KEYS } from '@/lib/fieldCrypto';

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

    const decrypted = {
      ...user,
      companyInfo: decryptObjectFields(
        user.companyInfo as Record<string, unknown> | null,
        COMPANY_INFO_SENSITIVE_KEYS as unknown as string[]
      ),
    };
    return NextResponse.json({ user: decrypted });
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

    if (data.companyInfo && typeof data.companyInfo === 'object') {
      data.companyInfo = encryptObjectFields(
        data.companyInfo as Record<string, unknown>,
        COMPANY_INFO_SENSITIVE_KEYS as unknown as string[]
      );
    }

    if (data.mode && !['ARTISAN', 'ENTREPRISE'].includes(data.mode as string)) {
      return NextResponse.json({ error: 'Mode invalide' }, { status: 400 });
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
    }
    const updated = await prisma.user.update({ where: { id: session.userId }, data });
    if (body.companyInfo) migrateUserCompany(session.userId).catch(() => {});

    const response = NextResponse.json({ ok: true, mode: updated.mode });

    // The JWT carries `mode` — re-issue the session cookie when it changes so
    // the sidebar/editor reflect the new mode without re-login.
    if (data.mode && data.mode !== session.mode?.toUpperCase()) {
      const { token, maxAge } = await createSession({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        mode: updated.mode?.toLowerCase() || 'artisan',
        sector: updated.sector,
        country: updated.country,
        language: updated.language,
        subscriptionStatus: updated.subscriptionStatus,
      });
      applySessionCookie(response, token, maxAge);
    }

    return response;
  } catch (error) {
    logger.error('PUT /api/user/profile', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
