import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Check env vars
  results.hasJwtSecret = !!process.env.JWT_SECRET;
  results.hasFieldKey = !!process.env.FIELD_ENCRYPTION_KEY;
  results.fieldKeyLen = process.env.FIELD_ENCRYPTION_KEY?.length ?? 0;
  results.appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // 2. Try DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.dbOk = true;
  } catch (e) {
    results.dbOk = false;
    results.dbError = String(e);
  }

  // 3. Try user create
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Debug Test',
        email: `debug_${Date.now()}@test.com`,
        password: 'TestPassword123!',
        mode: 'ARTISAN',
        sector: 'btp',
        country: 'algeria',
        language: 'fr',
        subscriptionStatus: 'TRIAL',
        trialStartAt: new Date(),
        settings: { defaultTaxRegime: 'tva_19', defaultDocType: 'devis' },
      },
    });
    results.userCreateOk = true;
    results.userId = user.id;

    // 4. Try session create
    try {
      await createSession({
        id: user.id, email: user.email, name: user.name,
        mode: 'artisan', sector: null, country: 'algeria',
        language: 'fr', subscriptionStatus: 'TRIAL',
      });
      results.sessionOk = true;
    } catch (e) {
      results.sessionOk = false;
      results.sessionError = String(e);
    }

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
  } catch (e) {
    results.userCreateOk = false;
    results.userCreateError = String(e);
  }

  return NextResponse.json(results);
}
