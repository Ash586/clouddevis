/**
 * Central brand identity. Change these once instead of hunting strings across the app.
 *
 * NOTE: only the *display* name lives here. Technical identifiers that would break
 * user data or external services if renamed (localStorage/persist keys, the mobile
 * SQLite DB name, offline cache names, PLAUSIBLE_DOMAIN, the Resend EMAIL_FROM default,
 * OAuth/Vercel/Sentry config, hardcoded deploy URLs) intentionally still use the old
 * "clouddevis" slug and are tracked as an external follow-up until the new domain is live.
 */
export const BRAND_NAME = 'Rakmana';
export const BRAND_TAGLINE = 'Devis & Factures conformes DGI en Algérie';

// Kept on the current working domain/email until the new domain + DNS/Resend are set up.
export const BRAND_URL = 'https://clouddevis.vercel.app';
export const SUPPORT_EMAIL = 'support@clouddevis.com';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Rakmana <noreply@clouddevis.io>';
