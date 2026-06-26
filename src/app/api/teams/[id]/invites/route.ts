import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

const VALID_INVITE_ROLES = ['MEMBER', 'ADMIN'];

export const POST = withApiErrorHandling(withAuth(async (req, session, ctx) => {
  try {
    const { id } = await ctx.params;
    const { email, role } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const inviteRole = role && VALID_INVITE_ROLES.includes(role) ? role : 'MEMBER';

    const member = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: session.userId } },
    });
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const alreadyMember = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: id, userId: existingUser.id } },
      });
      if (alreadyMember) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 86400000); // 7 days

    const invite = await prisma.teamInvite.create({
      data: {
        teamId: id,
        email: email.toLowerCase().trim(),
        token,
        role: inviteRole,
        expiresAt,
      },
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    logger.error('Team invite POST error', { error: String(error) });
    throw error;
  }
}), { component: 'dashboard', severity: 'high', userImpact: 'blocking' });
