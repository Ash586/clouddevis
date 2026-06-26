import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { CustomSectionDef } from '@/types';
import type { Prisma } from '@prisma/client';

export const GET = withApiErrorHandling(withAuth(async (_req, session) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { settings: true },
    });
    const settings = (user?.settings as Record<string, unknown>) ?? {};
    const raw = settings.customSections;
    const sections: CustomSectionDef[] = Array.isArray(raw) ? raw : [];
    return NextResponse.json({ sections });
  } catch (error) {
    logger.error('GET /api/user/custom-sections', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const POST = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = (await req.json()) as { section: CustomSectionDef };
    const { section } = body;
    if (!section?.id || !section.label) {
      return NextResponse.json({ error: 'id et label requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { settings: true },
    });
    const settings = (user?.settings as Record<string, unknown>) ?? {};
    const raw = settings.customSections;
    const sections: CustomSectionDef[] = Array.isArray(raw) ? raw : [];

    if (sections.some(s => s.id === section.id)) {
      return NextResponse.json({ error: 'Section existe déjà' }, { status: 409 });
    }

    sections.push(section);
    await prisma.user.update({
      where: { id: session.userId },
      data: { settings: { ...settings, customSections: sections } as unknown as Prisma.InputJsonValue },
    });
    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/user/custom-sections', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const PUT = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = (await req.json()) as { section: CustomSectionDef };
    const { section } = body;
    if (!section?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { settings: true },
    });
    const settings = (user?.settings as Record<string, unknown>) ?? {};
    const raw = settings.customSections;
    const sections: CustomSectionDef[] = Array.isArray(raw) ? raw : [];
    const idx = sections.findIndex(s => s.id === section.id);
    if (idx === -1) return NextResponse.json({ error: 'Section introuvable' }, { status: 404 });

    sections[idx] = section;
    await prisma.user.update({
      where: { id: session.userId },
      data: { settings: { ...settings, customSections: sections } as unknown as Prisma.InputJsonValue },
    });
    return NextResponse.json({ section });
  } catch (error) {
    logger.error('PUT /api/user/custom-sections', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });

export const DELETE = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { settings: true },
    });
    const settings = (user?.settings as Record<string, unknown>) ?? {};
    const raw = settings.customSections;
    const sections: CustomSectionDef[] = Array.isArray(raw) ? raw : [];
    const filtered = sections.filter(s => s.id !== id);
    if (filtered.length === sections.length) {
      return NextResponse.json({ error: 'Section introuvable' }, { status: 404 });
    }
    await prisma.user.update({
      where: { id: session.userId },
      data: { settings: { ...settings, customSections: filtered } as unknown as Prisma.InputJsonValue },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/user/custom-sections', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
