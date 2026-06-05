import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { CustomSectionDef } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { settings: true },
  });
  const settings = (user?.settings as Record<string, any>) ?? {};
  const sections: CustomSectionDef[] = (settings.customSections as CustomSectionDef[]) ?? [];
  return NextResponse.json({ sections });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const body = (await req.json()) as { section: CustomSectionDef };
  const { section } = body;
  if (!section || !section.id || !section.label) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { settings: true },
  });
  const settings = (user?.settings as Record<string, any>) ?? {};
  const sections: CustomSectionDef[] = (settings.customSections as CustomSectionDef[]) ?? [];
  if (sections.find(s => s.id === section.id)) {
    return NextResponse.json({ error: 'Ce nom de section existe déjà' }, { status: 409 });
  }
  sections.push(section);
  await prisma.user.update({
    where: { id: session.userId },
    data: { settings: { ...settings, customSections: sections } as any },
  });
  return NextResponse.json({ section }, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const body = (await req.json()) as { section: CustomSectionDef };
  const { section } = body;
  if (!section || !section.id) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { settings: true },
  });
  const settings = (user?.settings as Record<string, any>) ?? {};
  const sections: CustomSectionDef[] = (settings.customSections as CustomSectionDef[]) ?? [];
  const idx = sections.findIndex(s => s.id === section.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Section introuvable' }, { status: 404 });
  }
  sections[idx] = section;
  await prisma.user.update({
    where: { id: session.userId },
    data: { settings: { ...settings, customSections: sections } as any },
  });
  return NextResponse.json({ section });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { settings: true },
  });
  const settings = (user?.settings as Record<string, any>) ?? {};
  const sections: CustomSectionDef[] = (settings.customSections as CustomSectionDef[]) ?? [];
  const filtered = sections.filter(s => s.id !== id);
  if (filtered.length === sections.length) {
    return NextResponse.json({ error: 'Section introuvable' }, { status: 404 });
  }
  await prisma.user.update({
    where: { id: session.userId },
    data: { settings: { ...settings, customSections: filtered } as any },
  });
  return NextResponse.json({ success: true });
}
