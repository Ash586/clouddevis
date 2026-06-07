import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Check if user is suspended
  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { suspended: true, suspendedAt: true },
  });
  if (user?.suspended) {
    return NextResponse.json({
      error: 'Compte suspendu',
      suspended: true,
      suspendedAt: user.suspendedAt,
    }, { status: 403 });
  }

  return NextResponse.json({ user: session });
}
