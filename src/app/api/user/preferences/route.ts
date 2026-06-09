import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { settings: true },
    });

    const settings = (user?.settings as Record<string, unknown> | null) ?? {};
    return NextResponse.json({ fields: settings.fieldPreferences ?? null });
  } catch (error) {
    logger.error('GET /api/user/preferences', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const fields: Record<string, string[]> = body.fields;

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
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
