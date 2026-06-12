import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PROVIDERS: Record<string, { authUrl: string; params: Record<string, string> }> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    params: {
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app'}/api/auth/oauth/callback/google`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    },
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    params: {
      client_id: process.env.GITHUB_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://clouddevis.vercel.app'}/api/auth/oauth/callback/github`,
      scope: 'read:user user:email',
    },
  },
};

const STATE_COOKIE_NAME = 'oauth_state';
const REFERRAL_COOKIE_NAME = 'oauth_referral';
const REDIRECT_COOKIE_NAME = 'oauth_redirect';
const COOKIE_MAX_AGE = 10 * 60; // 10 minutes

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(';').filter(Boolean).map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const config = PROVIDERS[provider];

  if (!config) {
    return NextResponse.json({ error: 'Provider non supporté' }, { status: 400 });
  }

  const clientId = config.params.client_id;
  if (!clientId) {
    return NextResponse.json(
      { error: `OAuth ${provider} non configuré. Ajoutez ${provider.toUpperCase()}_CLIENT_ID et _CLIENT_SECRET dans .env` },
      { status: 501 }
    );
  }

  // Generate CSRF state token
  const state = crypto.randomBytes(16).toString('hex');

  // Read referral code and redirect path from cookies/query
  const cookieHeader = _req.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const referralCode = cookies['cd_ref'] || '';
  const { searchParams } = new URL(_req.url);
  const requestedRedirect = searchParams.get('redirect') || '';

  // Validate redirect: must start with /dashboard (security)
  const safeRedirect = requestedRedirect.startsWith('/dashboard') ? requestedRedirect : '';

  const url = new URL(config.authUrl);
  Object.entries(config.params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('state', state);

  // Store state + referral + redirect in httpOnly cookies
  const response = NextResponse.redirect(url.toString());
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  if (referralCode) {
    response.cookies.set(REFERRAL_COOKIE_NAME, referralCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }

  if (safeRedirect) {
    response.cookies.set(REDIRECT_COOKIE_NAME, safeRedirect, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return response;
}