import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

const VALID_PLANS = new Set(['PRO', 'MAX', 'ENTERPRISE']);

export const GET = withApiErrorHandling(withAuth(async (request, _session) => {
  try {
    const isConfigured = !!(process.env.WISE_IBAN || process.env.WISE_BENEFICIARY);
    const plan = request.nextUrl.searchParams.get('plan');

    if (!plan || !VALID_PLANS.has(plan)) {
      return NextResponse.json({ configured: isConfigured });
    }

    const wiseInfo = {
      configured: isConfigured,
      beneficiary: process.env.WISE_BENEFICIARY || '',
      iban: process.env.WISE_IBAN || '',
      bic: process.env.WISE_BIC || '',
      bank: process.env.WISE_BANK || 'Wise',
      currency: process.env.WISE_CURRENCY || 'DZD',
      instructions: 'Envoyez le montant exact correspondant au forfait choisi. Votre abonnement sera activé manuellement sous 24-48h.',
    };

    return NextResponse.json(wiseInfo);
  } catch (error) {
    logger.error('GET /api/subscribe/wise', { error: String(error) });
    return NextResponse.json({ configured: false, error: 'Erreur' }, { status: 500 });
  }
}), { component: 'billing', severity: 'critical', userImpact: 'blocking' });
