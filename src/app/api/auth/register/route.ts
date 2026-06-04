import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password, mode, sector, country, language, companyInfo } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mot de passe trop court (min 6 caractères)' }, { status: 400 });
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
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
