import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ partner: null });

    const partner = await prisma.partner.findUnique({
      where: { userId: session.userId },
      select: { id: true, code: true, tier: true, status: true },
    });

    return NextResponse.json({ partner });
  } catch {
    return NextResponse.json({ partner: null });
  }
}
