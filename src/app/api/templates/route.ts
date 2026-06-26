import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const GET = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.userId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) {
      const validTypes = ['DEVIS', 'PROFORMA', 'BC', 'BR', 'FACTURE'];
      const upperType = type.toUpperCase();
      if (validTypes.includes(upperType)) where.documentType = upperType;
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.template.count({ where }),
    ]);

    return NextResponse.json({
      templates: templates.map(t => ({
        id: t.id, name: t.name, description: t.description,
        documentType: t.documentType, mode: t.mode,
        itemCount: Array.isArray(t.items) ? t.items.length : 0,
        createdAt: t.createdAt.toISOString().split('T')[0],
        updatedAt: t.updatedAt.toISOString().split('T')[0],
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/templates error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });

export const POST = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const { name, description, documentType, mode, items, customFields, settings, sourceDocId } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du modèle est requis' }, { status: 400 });
    }

    const VALID_DOC_TYPES = ['DEVIS', 'PROFORMA', 'BC', 'BR', 'FACTURE'];
    const VALID_MODES = ['ARTISAN', 'ENTREPRISE'];

    const docType = String(documentType || 'DEVIS').toUpperCase();
    const modeVal = String(mode || 'ARTISAN').toUpperCase();

    if (!VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 });
    }
    if (!VALID_MODES.includes(modeVal)) {
      return NextResponse.json({ error: 'Mode invalide' }, { status: 400 });
    }

    let templateData: Record<string, unknown> = {
      userId: session.userId,
      name: name.trim(),
      description: description?.trim() || null,
      documentType: docType,
      mode: modeVal,
      items: Array.isArray(items) ? items : [],
      customFields: (typeof customFields === 'object' && customFields) || {},
      settings: (typeof settings === 'object' && settings) || {},
    };

    // If sourceDocId provided, copy from existing document
    if (sourceDocId && typeof sourceDocId === 'string') {
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

    const template = await prisma.template.create({ data: templateData as never });
    return NextResponse.json({ id: template.id, name: template.name }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/templates error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });
