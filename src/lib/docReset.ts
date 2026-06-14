import { prisma } from '@/lib/prisma';

export async function ensureDocCountReset(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastDocResetAt: true, docCountThisMonth: true },
  });
  if (!user) return;

  const now = new Date();
  const lastReset = user.lastDocResetAt;

  if (!lastReset || lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
    await prisma.user.update({
      where: { id: userId },
      data: { docCountThisMonth: 0, lastDocResetAt: now },
    });
  }
}
