import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // @react-pdf/renderer (and its fontkit deps) must run as a real Node module
  // server-side, not be bundled by webpack — otherwise PDF generation throws.
  serverExternalPackages: ['@react-pdf/renderer'],

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    serverActions: {
      // Max body size for API routes and Server Actions
      // Logo uploads go through /api/documents which accepts base64 (~500KB → ~670KB encoded)
      // Set to 1MB to cover that case; everything else should be well under 100KB
      bodySizeLimit: '1mb',
    },
  },
  async rewrites() {
    // /api/v1/* aliases for forward-compat — clients can pin to v1 without code changes
    return [
      { source: '/api/v1/:path*', destination: '/api/:path*' },
    ];
  },

  async headers() {
    // CSP notes:
    // - 'unsafe-inline' for script-src is required by Next.js App Router (inline hydration scripts).
    //   To tighten this further, switch to nonce-based CSP via middleware.
    // - 'unsafe-inline' for style-src is required by Tailwind's runtime class injection.
    // - data: / blob: for img-src cover base64 logos and PDF blob previews.
    // - fonts.googleapis.com / fonts.gstatic.com for Google Fonts loaded by PDF print templates.
    // - *.ingest.sentry.io for Sentry error telemetry.
    const isDev = process.env.NODE_ENV === 'development';
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.sentry.io https://*.ingest.sentry.io",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default withSentryConfig(analyze(withNextIntl(nextConfig)), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  sourcemaps: { disable: true },
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
    reactComponentAnnotation: { enabled: true },
  },
});
