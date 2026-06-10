import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { createCheckout, PLAN_VARIANTS } from '@/lib/lemon-squeezy';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const hasLS = !!process.env.LEMONSQUEEZY_API_KEY;
    if (!hasLS) {
      return NextResponse.json({
        message: 'Paiement non configuré',
        note: 'Paiement par carte bientôt disponible.',
      }, { status: 503 });
    }

    const body = await req.json();
    const { planId } = body as { planId: string };

    if (!['standard', 'pro', 'max'].includes(planId)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const variantId = PLAN_VARIANTS[planId];
    if (!variantId) {
      return NextResponse.json({
        message: 'Variant non configuré',
        note: 'Ce plan n\'est pas encore configuré.',
      }, { status: 503 });
    }

    const productId = process.env.LEMONSQUEEZY_PRODUCT_ID;
    if (!productId) {
      return NextResponse.json({ message: 'Produit non configuré', note: 'Bientôt disponible.' }, { status: 503 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.app';

    const checkout = await createCheckout({
      productId,
      variantId,
      email: session.email,
      name: session.name,
      metadata: { userId: session.userId, planId },
      redirectUrl: `${appUrl}/dashboard/subscription?success=1`,
    });

    return NextResponse.json({ url: checkout.attributes.url });
  } catch (error) {
    logger.error('Subscribe error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
  }
}
