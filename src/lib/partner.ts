import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function generateReferralCode(): Promise<string> {
  const prefix = 'CD';
  let attempts = 0;

  while (attempts < 100) {
    const suffix = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
    const code = `${prefix}${suffix}`;
    const exists = await prisma.partner.findUnique({ where: { code } });
    if (!exists) return code;
    attempts++;
  }

  throw new Error('Impossible de générer un code de parrainage unique');
}

const DIRECT_RATE = parseFloat(process.env.PARTNER_DIRECT_RATE || '') || 0.20;
const OVERRIDE_RATE = parseFloat(process.env.PARTNER_OVERRIDE_RATE || '') || 0.05;

export async function calculateCommission(subscriptionPrice: number, partnerTier: string): Promise<{ direct: number; override: number }> {
  const direct = Math.round(subscriptionPrice * DIRECT_RATE);
  const override = partnerTier === 'SUPER_AFFILIATE' ? Math.round(subscriptionPrice * OVERRIDE_RATE) : 0;

  return { direct, override };
}

export async function getPartnerReferralUrl(code: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app';
  return `${baseUrl}/auth/register?ref=${code}`;
}

import { PLANS } from '@/lib/pricing';

const SUBSCRIPTION_PRICES: Record<string, number> = {
  TRIAL: 0,
  FREE: 0,
  STANDARD: PLANS.standard.price,
};

export async function handleReferralConversion(
  userId: string,
  newStatus: string,
  options?: { subscriptionId?: string; amountPaid?: number; planId?: string }
): Promise<void> {
  if (newStatus !== 'STANDARD' && newStatus !== 'ENTERPRISE') return;

  const referral = await prisma.referral.findUnique({
    where: { referredUserId: userId },
    include: { partner: { select: { id: true, tier: true, parentId: true } } },
  });

  if (!referral || referral.status === 'CONVERTED') return;
  if (!referral.partner) return;

  const subId = options?.subscriptionId || `sub_${userId}_${newStatus}`;

  const existingCommission = await prisma.commission.findFirst({
    where: {
      partnerId: referral.partner.id,
      subscriptionId: subId,
      type: 'DIRECT',
    },
  });
  if (existingCommission) return;

  const price = options?.amountPaid || SUBSCRIPTION_PRICES[newStatus] || 0;
  if (price <= 0) return;

  const commission = await calculateCommission(price, referral.partner.tier);

  await prisma.$transaction([
    prisma.referral.update({
      where: { id: referral.id },
      data: { status: 'CONVERTED', convertedAt: new Date() },
    }),
    prisma.commission.create({
      data: {
        partnerId: referral.partner.id,
        amount: commission.direct,
        type: 'DIRECT',
        subscriptionId: subId,
        status: 'PENDING',
      },
    }),
    ...(commission.override > 0 && referral.partner.parentId
      ? [
          prisma.commission.create({
            data: {
              partnerId: referral.partner.parentId,
              amount: commission.override,
              type: 'OVERRIDE',
              subscriptionId: subId,
              status: 'PENDING',
            },
          }),
        ]
      : []),
  ]);
}
