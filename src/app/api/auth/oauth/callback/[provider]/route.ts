import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

const TOKEN_URLS: Record<string, string> = {
  google: 'https://oauth2.googleapis.com/token',
  github: 'https://github.com/login/oauth/access_token',
};

const USER_URLS: Record<string, { url: string; emailUrl?: string; parser: (data: any, emails?: any[]) => { id: string; email: string; name: string } }> = {
  google: {
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    parser: (data: any) => ({ id: data.id, email: data.email, name: data.name }),
  },
  github: {
    url: 'https://api.github.com/user',
    emailUrl: 'https://api.github.com/user/emails',
    parser: (data: any, emails?: any[]) => {
      const primary = emails?.find((e: any) => e.primary && e.verified);
      return { id: String(data.id), email: primary?.email || `${data.id}@github.local`, name: data.name || data.login };
    },
  },
};

export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const { searchParams } = new URL(_req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_canceled', _req.url));
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(TOKEN_URLS[provider], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        code,
        client_id: provider === 'google' ? process.env.GOOGLE_CLIENT_ID : process.env.GITHUB_CLIENT_ID,
        client_secret: provider === 'google' ? process.env.GOOGLE_CLIENT_SECRET : process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/oauth/callback/${provider}`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', _req.url));
    }

    // Fetch user info
    const cfg = USER_URLS[provider];
    const userRes = await fetch(cfg.url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const userData = await userRes.json();

    let emails: any[] | undefined;
    if (cfg.emailUrl) {
      const emailRes = await fetch(cfg.emailUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (emailRes.ok) emails = await emailRes.json();
    }

    const { id: providerId, email, name } = cfg.parser(userData, emails);

    // Find or create user
    const existingAccount = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: providerId } },
      include: { user: true },
    });

    let user = existingAccount?.user;

    if (!user) {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        // Link account to existing user
        await prisma.account.create({
          data: { userId: existingUser.id, provider, providerAccountId: providerId, accessToken },
        });
        user = existingUser;
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name,
            password: '',
            country: 'algeria',
            language: 'fr',
            subscriptionStatus: 'TRIAL',
            accounts: { create: { provider, providerAccountId: providerId, accessToken } },
          },
        });
      }
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      mode: user.mode.toLowerCase(),
      sector: user.sector,
      country: user.country,
      language: user.language,
      subscriptionStatus: user.subscriptionStatus,
    });

    return NextResponse.redirect(new URL('/dashboard', _req.url));
  } catch (error) {
    logger.error('OAuth callback error', { error: String(error) });
    return NextResponse.redirect(new URL('/auth/login?error=oauth_error', _req.url));
  }
}
