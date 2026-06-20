import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

const VALID_INVITE_ROLES = ['MEMBER', 'ADMIN'];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
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
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
