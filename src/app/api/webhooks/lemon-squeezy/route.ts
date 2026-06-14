import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { verifyWebhookSignature, parseWebhookEvent } from '@/lib/lemon-squeezy';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature') || '';

    if (!verifyWebhookSignature(body, signature)) {
      logger.warn('LS webhook invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = parseWebhookEvent(payload);

    switch (event.event) {
      case 'order_created':
      case 'subscription_created': {
        const planId = event.planId || 'pro';
        if (!event.userId) break;

        const statusMap: Record<string, 'STANDARD' | 'PRO' | 'MAX'> = {
          standard: 'STANDARD', pro: 'PRO', max: 'MAX',
        };
        const status = statusMap[planId] || 'PRO';

        // Verify user exists before updating
        const targetUser = await prisma.user.findUnique({ where: { id: event.userId }, select: { id: true } });
        if (!targetUser) break;

        const lsAttributes = payload.data.attributes;
        const lsSubscriptionId = lsAttributes?.customer_id || event.orderId;
        const lsCustomerId = lsAttributes?.customer_id || event.orderId;

        await prisma.user.update({
          where: { id: event.userId },
          data: {
            subscriptionStatus: status,
            lemonsqueezyCustomerId: String(lsCustomerId),
            lemonsqueezySubscriptionId: String(lsSubscriptionId),
            subscriptionEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        const amount = typeof lsAttributes?.total === 'number' ? lsAttributes.total : Number(lsAttributes?.total) || 0;
        await prisma.transaction.create({
          data: {
            userId: event.userId,
            amount,
            status: 'COMPLETED',
            provider: 'LEMON_SQUEEZY',
            providerId: event.orderId,
            planId,
            description: `Abonnement ${planId}`,
          },
        });
        break;
      }

      case 'subscription_expired':
      case 'subscription_cancelled': {
        if (!event.userId) break;
        const user = await prisma.user.findUnique({ where: { id: event.userId } });
        if (user && user.subscriptionStatus !== 'ENTERPRISE') {
          await prisma.user.update({
            where: { id: event.userId },
            data: { subscriptionStatus: 'FREE', lemonsqueezySubscriptionId: null, subscriptionEndAt: null },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('LS webhook error', { error: String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
