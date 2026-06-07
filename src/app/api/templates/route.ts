import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || '';

  const where: any = { userId: session.userId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (type) where.documentType = type.toUpperCase();

  const templates = await prisma.template.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({
    templates: templates.map(t => ({
      id: t.id, name: t.name, description: t.description,
      documentType: t.documentType, mode: t.mode,
      itemCount: Array.isArray(t.items) ? t.items.length : 0,
      createdAt: t.createdAt.toISOString().split('T')[0],
      updatedAt: t.updatedAt.toISOString().split('T')[0],
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json();
  const { name, description, documentType, mode, items, customFields, settings, sourceDocId } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Le nom du modèle est requis' }, { status: 400 });
  }

  let templateData: any = {
    userId: session.userId,
    name: name.trim(),
    description: description?.trim() || null,
    documentType: (documentType || 'DEVIS').toUpperCase(),
    mode: (mode || 'ARTISAN').toUpperCase(),
    items: items || [],
    customFields: customFields || {},
    settings: settings || {},
  };

  // If sourceDocId provided, copy from existing document
  if (sourceDocId) {
    const sourceDoc = await prisma.document.findFirst({
      where: { id: sourceDocId, userId: session.userId },
    });
    if (sourceDoc) {
      templateData = {
        ...templateData,
        name: templateData.name || `Modèle: ${sourceDoc.number}`,
        documentType: sourceDoc.type,
        mode: sourceDoc.mode,
        items: (() => { try { return JSON.parse(sourceDoc.items as string); } catch { return []; } })(),
        customFields: (() => { try { return typeof sourceDoc.customFields === 'string' ? JSON.parse(sourceDoc.customFields) : sourceDoc.customFields; } catch { return {}; } })(),
        settings: {
          tvaRate: sourceDoc.subTotalHT > 0 ? Math.round(sourceDoc.tvaAmount / sourceDoc.subTotalHT * 100) : 0,
          paymentMode: sourceDoc.paymentMode,
          taxRegime: sourceDoc.taxRegime,
        },
      };
    }
  }

  const template = await prisma.template.create({ data: templateData });
  return NextResponse.json({ id: template.id, name: template.name }, { status: 201 });
}
