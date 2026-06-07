import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const partner = await prisma.partner.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, status: true, code: true },
    });

    if (!partner || partner.status !== 'ACTIVE') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.app';
      return NextResponse.redirect(new URL('/auth/register', baseUrl));
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.app';
    return NextResponse.redirect(new URL(`/auth/register?ref=${partner.code}`, baseUrl));
  } catch (error) {
    logger.error('Referral redirect error', { error: String(error) });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.app';
    return NextResponse.redirect(new URL('/auth/register', baseUrl));
  }
}
