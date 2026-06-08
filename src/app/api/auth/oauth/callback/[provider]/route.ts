import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

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

export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
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

  // CSRF state validation: compare against stored cookie
  const cookieHeader = _req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').filter(Boolean).map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  const storedState = cookies['oauth_state'];

  if (!callbackState || !storedState || callbackState !== storedState) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_invalid_state', _req.url));
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
        state: callbackState,
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

    let emails: Record<string, unknown>[] | undefined;
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
        // Create new user with secure random password
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

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      mode: user.mode?.toLowerCase() || 'artisan',
      sector: user.sector,
      country: user.country,
      language: user.language,
      subscriptionStatus: user.subscriptionStatus,
    });

    const redirect = NextResponse.redirect(new URL('/dashboard', _req.url));
    redirect.cookies.delete('oauth_state');
    return redirect;
  } catch (error) {
    logger.error('OAuth callback error', { error: String(error) });
    return NextResponse.redirect(new URL('/auth/login?error=oauth_error', _req.url));
  }
}
