import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateAuthInput } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validateAuthInput(body, 'register');
    if (!validation.valid) {
      return NextResponse.json({ error: Object.values(validation.errors).join(', ') }, { status: 400 });
    }

    const { name, email, password, mode, sector, country, language, companyInfo } = body;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateCheck = checkRateLimit(`register:${ip}`, 3, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        mode: mode === 'entreprise' ? 'ENTREPRISE' : 'ARTISAN',
        sector: sector || null,
        country: country || 'algeria',
        language: language || 'fr',
        subscriptionStatus: 'TRIAL',
        trialStartAt: new Date(),
        companyInfo: companyInfo || undefined,
        settings: { defaultTaxRegime: mode === 'artisan' ? 'tva_0' : 'tva_19', defaultDocType: 'devis' },
      },
    });

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      mode: user.mode.toLowerCase(),
      sector: user.sector,
      country: user.country,
      language: user.language,
      subscriptionStatus: user.subscriptionStatus,
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    logger.error('Register error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
