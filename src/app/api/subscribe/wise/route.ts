import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const wiseInfo = {
      beneficiary: process.env.WISE_BENEFICIARY || '',
      iban: process.env.WISE_IBAN || '',
      bic: process.env.WISE_BIC || '',
      bank: process.env.WISE_BANK || 'Wise',
      currency: process.env.WISE_CURRENCY || 'DZD',
      instructions: 'Envoyez le montant exact correspondant au forfait choisi. Votre abonnement sera activé manuellement sous 24-48h.',
    };

    const isConfigured = !!(process.env.WISE_IBAN || process.env.WISE_BENEFICIARY);

    return NextResponse.json({ configured: isConfigured, ...wiseInfo });
  } catch (error) {
    logger.error('GET /api/subscribe/wise', { error: String(error) });
    return NextResponse.json({ configured: false, error: 'Erreur' }, { status: 500 });
  }
}
