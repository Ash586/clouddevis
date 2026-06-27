import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, applySessionCookie } from '@/lib/auth';
import { requireCsrf } from '@/lib/csrf';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { validateAuthInput } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { t, getLang } from '@/lib/api-i18n';

export const runtime = 'nodejs';

// TEMP: step-by-step diagnostics — remove after auth confirmed working
export async function POST(req: Request) {
  const diag: Record<string, unknown> = {};
  try {
    diag.step = 'csrf';
    requireCsrf(req);

    diag.step = 'parse';
    const body = await req.json();

    diag.step = 'validate';
    const validation = validateAuthInput(body, 'register', getLang(req));
    if (!validation.valid) {
      return NextResponse.json({ error: Object.values(validation.errors).join(', ') }, { status: 400 });
    }

    const { name, email, password, mode, sector, country, language, companyInfo, referralCode: bodyRef } = body;

    diag.step = 'rateLimit';
    const ip = getClientIP(req);
    const rateCheck = await checkRateLimit(`register:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: t(req, 'rateLimit') }, { status: 429 });
    }

    diag.step = 'findUser';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: t(req, 'emailTaken') }, { status: 409 });
    }

    diag.step = 'createUser';
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
    diag.userId = user.id;

    diag.step = 'createSession';
    const { token, maxAge } = await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      mode: user.mode?.toLowerCase() || 'artisan',
      sector: user.sector,
      country: user.country,
      language: user.language,
      subscriptionStatus: user.subscriptionStatus,
    });

    diag.step = 'done';
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    applySessionCookie(response, token, maxAge);

    let referralCode = bodyRef;
    if (!referralCode) {
      const cookieHeader = req.headers.get('cookie') || '';
      const cdRefMatch = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('cd_ref='));
      if (cdRefMatch) referralCode = cdRefMatch.split('=').slice(1).join('=');
    }
    if (referralCode) response.cookies.set('cd_ref', '', { maxAge: 0, path: '/' });

    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('Register error', { step: diag.step, error: msg });
    return NextResponse.json({ error: 'Erreur interne', _step: diag.step, _diag: msg }, { status: 500 });
  }
}
