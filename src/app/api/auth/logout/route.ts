import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('POST /api/auth/logout', { error: String(error) });
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
