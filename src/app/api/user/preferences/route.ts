import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Prisma } from '@prisma/client';

const VALID_DOC_TYPES = ['devis', 'proforma', 'bc', 'br', 'facture', 'intervention', 'attachement'];

function isNewFormat(fields: unknown): fields is Record<string, Record<string, string[]>> {
  if (!fields || typeof fields !== 'object') return false;
  const keys = Object.keys(fields);
  return keys.some(k => VALID_DOC_TYPES.includes(k));
}

export const GET = withApiErrorHandling(withAuth(async (_req, session) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { settings: true },
    });

    const settings = (user?.settings as Record<string, unknown> | null) ?? {};
    let fieldPreferences = settings.fieldPreferences ?? null;

    // 🧪 ترحيل: إذا كان التنسيق قديماً (مسطح) → نحوله للجديد
    if (fieldPreferences && !isNewFormat(fieldPreferences)) {
      const oldPrefs = fieldPreferences as Record<string, string[]>;
      fieldPreferences = { devis: oldPrefs };
      // حفظ الترحيل
      await prisma.user.update({
        where: { id: session.userId },
        data: { settings: { ...settings, fieldPreferences } as unknown as Prisma.InputJsonValue },
      });
    }

    return NextResponse.json({ fields: fieldPreferences });
  } catch (error) {
    logger.error('GET /api/user/preferences', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const PUT = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const fields: Record<string, Record<string, string[]>> = body.fields;

    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ error: 'fields must be an object' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { settings: true },
    });

    const currentSettings = (user?.settings as Record<string, unknown> | null) ?? {};
    await prisma.user.update({
      where: { id: session.userId },
      data: { settings: { ...currentSettings, fieldPreferences: fields } as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('PUT /api/user/preferences', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
