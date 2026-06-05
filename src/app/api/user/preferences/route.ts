import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { settings: true },
  });

  const settings = (user?.settings as Record<string, unknown> | null) ?? {};
  return NextResponse.json({ fields: settings.fieldPreferences ?? null });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

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
    data: { settings: { ...currentSettings, fieldPreferences: fields } },
  });

  return NextResponse.json({ ok: true });
}
