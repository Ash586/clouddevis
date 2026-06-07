import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const template = await prisma.template.findFirst({
      where: { id, userId: session.userId },
    });

    if (!template) return NextResponse.json({ error: 'Modèle non trouvé' }, { status: 404 });

    return NextResponse.json({
      template: {
        id: template.id, name: template.name, description: template.description,
        documentType: template.documentType, mode: template.mode,
        items: template.items, customFields: template.customFields,
        settings: template.settings,
        createdAt: template.createdAt.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    logger.error('GET /api/templates/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const template = await prisma.template.findFirst({ where: { id, userId: session.userId } });
    if (!template) return NextResponse.json({ error: 'Modèle non trouvé' }, { status: 404 });

    const body = await _req.json();
    const { name, description, documentType, mode, items, customFields, settings } = body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return NextResponse.json({ error: 'Le nom ne peut pas être vide' }, { status: 400 });
    }

    const VALID_DOC_TYPES = ['DEVIS', 'PROFORMA', 'BC', 'BR', 'FACTURE'];
    const VALID_MODES = ['ARTISAN', 'ENTREPRISE'];

    if (documentType !== undefined) {
      const upperType = String(documentType).toUpperCase();
      if (!VALID_DOC_TYPES.includes(upperType)) {
        return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 });
      }
    }

    if (mode !== undefined) {
      const upperMode = String(mode).toUpperCase();
      if (!VALID_MODES.includes(upperMode)) {
        return NextResponse.json({ error: 'Mode invalide' }, { status: 400 });
      }
    }

    const updated = await prisma.template.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(documentType !== undefined && { documentType: String(documentType).toUpperCase() as 'DEVIS' | 'PROFORMA' | 'BC' | 'BR' | 'FACTURE' }),
        ...(mode !== undefined && { mode: String(mode).toUpperCase() as 'ARTISAN' | 'ENTREPRISE' }),
        ...(items !== undefined && { items }),
        ...(customFields !== undefined && { customFields }),
        ...(settings !== undefined && { settings }),
      },
    });

    return NextResponse.json({ id: updated.id, name: updated.name });
  } catch (error) {
    logger.error('PUT /api/templates/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const template = await prisma.template.findFirst({ where: { id, userId: session.userId } });
    if (!template) return NextResponse.json({ error: 'Modèle non trouvé' }, { status: 404 });

    await prisma.template.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/templates/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
