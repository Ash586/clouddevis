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
const STATE_COOKIE_MAX_AGE = 10 * 60; // 10 minutes

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

  const url = new URL(config.authUrl);
  Object.entries(config.params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('state', state);

  // Store state in httpOnly cookie
  const response = NextResponse.redirect(url.toString());
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STATE_COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}