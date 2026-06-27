import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { prisma } from '@/lib/prisma';
import { createSession, applySessionCookie } from '@/lib/auth';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

export const runtime = 'nodejs';

const VALID_PROVIDERS = ['google', 'github'] as const;
type ValidProvider = (typeof VALID_PROVIDERS)[number];

const TOKEN_URLS: Record<ValidProvider, string> = {
  google: 'https://oauth2.googleapis.com/token',
  github: 'https://github.com/login/oauth/access_token',
};

const USER_URLS: Record<ValidProvider, { url: string; emailUrl?: string; parser: (data: Record<string, unknown>, emails?: Record<string, unknown>[]) => { id: string; email: string; name: string } }> = {
  google: {
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    parser: (data) => ({ id: String(data.id), email: String(data.email), name: String(data.name) }),
  },
  github: {
    url: 'https://api.github.com/user',
    emailUrl: 'https://api.github.com/user/emails',
    parser: (data, emails) => {
      const primary = emails?.find((e) => e.primary && e.verified);
      const email = primary?.email || data.email;
      return { id: String(data.id), email: email ? String(email) : `gh-${data.id}@auth.local`, name: String(data.name || data.login) };
    },
  },
};

export const GET = withApiErrorHandling(getHandler, { component: 'auth', severity: 'high', userImpact: 'blocking' });
async function getHandler(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: rawProvider } = await params;

  if (!VALID_PROVIDERS.includes(rawProvider as ValidProvider)) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_invalid_provider', _req.url));
  }
  const provider = rawProvider as ValidProvider;

  const { searchParams } = new URL(_req.url);
  const code = searchParams.get('code');
  const callbackState = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_canceled', _req.url));
  }

  const cookieHeader = _req.headers.get('cookie') || '';
  const parsedCookies = Object.fromEntries(
    cookieHeader.split(';').filter(Boolean).map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  const storedState = parsedCookies['oauth_state'];

  if (!callbackState || !storedState || callbackState !== storedState) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_invalid_state', _req.url));
  }

  try {
    const tokenBody = provider === 'github'
      ? new URLSearchParams({
          code,
          client_id: process.env.GITHUB_CLIENT_ID || '',
          client_secret: process.env.GITHUB_CLIENT_SECRET || '',
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app'}/api/auth/oauth/callback/github`,
        }).toString()
      : JSON.stringify({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app'}/api/auth/oauth/callback/google`,
          grant_type: 'authorization_code',
          state: callbackState,
        });

    const tokenRes = await fetch(TOKEN_URLS[provider], {
      method: 'POST',
      headers: {
        'Content-Type': provider === 'github' ? 'application/x-www-form-urlencoded' : 'application/json',
        Accept: 'application/json',
      },
      body: tokenBody,
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', _req.url));
    }

    const cfg = USER_URLS[provider];
    const userRes = await fetch(cfg.url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const userData = await userRes.json();

    let emails: Record<string, unknown>[] | undefined;
    if (cfg.emailUrl) {
      const emailRes = await fetch(cfg.emailUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (emailRes.ok) emails = await emailRes.json();
    }

    const { id: providerId, email, name } = cfg.parser(userData, emails);

    const existingAccount = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: providerId } },
      include: { user: true },
    });

    let user = existingAccount?.user;

    if (!user) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        await prisma.account.create({
          data: { userId: existingUser.id, provider, providerAccountId: providerId, accessToken },
        });
        user = existingUser;
      } else {
        const oauthPassword = crypto.randomBytes(32).toString('hex');
        const { hashPassword } = await import('@/lib/auth');
        const hashedPassword = await hashPassword(oauthPassword);

        user = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            mode: 'ARTISAN',
            country: 'algeria',
            language: 'fr',
            subscriptionStatus: 'TRIAL',
            trialStartAt: new Date(),
            accounts: { create: { provider, providerAccountId: providerId, accessToken } },
          },
        });
      }
    }

    const { token, maxAge } = await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      mode: user.mode?.toLowerCase() || 'artisan',
      sector: user.sector,
      country: user.country,
      language: user.language,
      subscriptionStatus: user.subscriptionStatus,
    });

    const referralCode = parsedCookies['oauth_referral'] || '';
    const savedRedirect = parsedCookies['oauth_redirect'] || '/dashboard';
    const safeRedirect = savedRedirect.startsWith('/dashboard') || savedRedirect.startsWith('/auth') ? savedRedirect : '/dashboard';

    const redirect = NextResponse.redirect(new URL(safeRedirect, _req.url));
    applySessionCookie(redirect, token, maxAge);
    redirect.cookies.delete('oauth_state');
    redirect.cookies.delete('oauth_referral');
    redirect.cookies.delete('oauth_redirect');

    if (referralCode && !existingAccount) {
      try {
        const partner = await prisma.partner.findUnique({ where: { code: referralCode.toUpperCase() } });
        if (partner && partner.status === 'ACTIVE' && partner.userId !== user.id) {
          const existingReferral = await prisma.referral.findFirst({ where: { referredUserId: user.id } });
          if (!existingReferral) {
            await prisma.referral.create({
              data: { partnerId: partner.id, referredUserId: user.id, status: 'PENDING' },
            });
          }
        }
      } catch {
        // Non-critical
      }
    }

    return redirect;
  } catch (error) {
    logger.error('OAuth callback error', { error: String(error) });
    return NextResponse.redirect(new URL('/auth/login?error=oauth_error', _req.url));
  }
}
