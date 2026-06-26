import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { requireCsrf } from '@/lib/csrf';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { validateAuthInput } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { t, getLang } from '@/lib/api-i18n';

export const POST = withApiErrorHandling(postHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    requireCsrf(req);
    const body = await req.json();
    const validation = validateAuthInput(body, 'register', getLang(req));
    if (!validation.valid) {
      return NextResponse.json({ error: Object.values(validation.errors).join(', ') }, { status: 400 });
    }

    const { name, email, password, mode, sector, country, language, companyInfo, referralCode: bodyRef } = body;

    let referralCode = bodyRef;
    if (!referralCode) {
      const cookieHeader = req.headers.get('cookie') || '';
      const cdRefMatch = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('cd_ref='));
      if (cdRefMatch) {
        referralCode = cdRefMatch.split('=').slice(1).join('=');
      }
    }

    const ip = getClientIP(req);
    const rateCheck = await checkRateLimit(`register:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: t(req, 'rateLimit') }, { status: 429 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: t(req, 'emailTaken') }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        mode: mode === 'entreprise' ? 'ENTREPRISE' : 'ARTISAN',
        sector: sector || null,
        country: country || 'algeria',
        language: language || 'fr',
        subscriptionStatus: 'TRIAL',
        trialStartAt: new Date(),
        companyInfo: companyInfo || undefined,
        settings: { defaultTaxRegime: 'tva_19', defaultDocType: 'devis' },
      },
    });

    if (referralCode && typeof referralCode === 'string') {
      const partner = await prisma.partner.findUnique({ where: { code: referralCode.toUpperCase() } });
      if (partner && partner.status === 'ACTIVE' && partner.userId !== user.id) {
        try {
          await prisma.referral.create({
            data: {
              partnerId: partner.id,
              referredUserId: user.id,
              status: 'PENDING',
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('Unique constraint') || msg.includes('unique constraint')) {
            logger.warn('Referral already exists for user', { userId: user.id });
          } else {
            logger.error('Failed to create referral', { error: msg });
          }
        }
      }
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      mode: user.mode?.toLowerCase() || 'artisan',
      sector: user.sector,
      country: user.country,
      language: user.language,
      subscriptionStatus: user.subscriptionStatus,
    });

    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });

    if (referralCode) {
      response.cookies.set('cd_ref', '', { maxAge: 0, path: '/' });
    }

    return response;
  } catch (error) {
    logger.error('Register error', { error: String(error) });
    throw error;
  }
}
