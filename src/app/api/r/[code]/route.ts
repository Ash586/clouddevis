import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const partner = await prisma.partner.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, status: true, code: true },
    });

    if (!partner || partner.status !== 'ACTIVE') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app';
      return NextResponse.redirect(new URL('/auth/register', baseUrl));
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';
    const url = new URL(req.url);
    const landingPath = url.pathname + url.search;

    try {
      await prisma.partnerClick.create({
        data: {
          partnerId: partner.id,
          code: partner.code,
          ipHash: ip ? simpleHash(String(ip)) : null,
          userAgent: userAgent.substring(0, 500),
          referrer: referrer.substring(0, 500),
          landingPath: landingPath.substring(0, 500),
        },
      });
    } catch {
      logger.warn('Failed to track partner click');
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app';
    const redirectUrl = new URL(`/auth/register?ref=${partner.code}`, baseUrl);

    const response = NextResponse.redirect(redirectUrl);

    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('cd_ref', partner.code, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Referral redirect error', { error: String(error) });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app';
    return NextResponse.redirect(new URL('/auth/register', baseUrl));
  }
}
