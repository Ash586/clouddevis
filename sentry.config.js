const VALID_ENVIRONMENTS = new Set(['production', 'staging', 'development']);

function safeGitSha() {
  // Only run in the Node.js server runtime. Bail in the browser (`child_process`
  // doesn't exist and `module.require` is undefined → crash on import) and in the
  // Edge runtime (touching `process.versions` trips an Edge static-analysis error).
  if (
    typeof window !== 'undefined' ||
    typeof process === 'undefined' ||
    process.env.NEXT_RUNTIME === 'edge'
  ) {
    return '';
  }
  try {
    // Lazy require so this file stays import-safe in the client bundle.
    const req = typeof module !== 'undefined' && module.require ? module.require : require;
    const { execSync } = req('child_process');
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function getEnvironment() {
  const configured = process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
  if (configured === 'test') return 'development';
  if (configured === 'preview') return 'staging';
  return VALID_ENVIRONMENTS.has(configured) ? configured : 'development';
}

function getRelease() {
  return process.env.SENTRY_RELEASE || safeGitSha() || process.env.npm_package_version || 'local';
}

function getDsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || '';
}

function getCommonOptions() {
  const environment = getEnvironment();
  const release = getRelease();

  return {
    dsn: getDsn(),
    environment,
    release,
    enabled: Boolean(getDsn()),
    normalizePaths: true,
    maxBreadcrumbs: 20,
    sendDefaultPii: false,
    beforeSend(event) {
      const message = event.exception?.values?.[0]?.value || event.message || '';
      const userAgent = String(event.request?.headers?.['user-agent'] || event.request?.headers?.['User-Agent'] || '');
      const durationMs = Number(event.extra?.durationMs || event.contexts?.request?.duration_ms || 0);

      if (/resizeobserver loop/i.test(message)) return null;
      if (/timeout|timed out|ETIMEDOUT|ECONNABORTED|ERR_CANCELED|networkerror|failed to fetch/i.test(message) && durationMs > 0 && durationMs < 2000) return null;
      if (isBotUserAgent(userAgent)) return null;

      if (typeof window !== 'undefined') {
        event.request = {
          ...(event.request || {}),
          url: window.location.href,
          method: 'GET',
        };
      }

      event.tags = {
        ...(event.tags || {}),
        severity: event.tags?.severity || 'medium',
        component: event.tags?.component || 'api',
        user_impact: event.tags?.user_impact || 'degraded',
      };

      event.contexts = {
        ...(event.contexts || {}),
        app: {
          ...(event.contexts?.app || {}),
          version: release,
          environment,
        },
      };

      return event;
    },
  };
}

function isBotUserAgent(userAgent) {
  const value = String(userAgent || '').toLowerCase();
  return [
    'bot',
    'crawler',
    'spider',
    'slurp',
    'bingpreview',
    'facebookexternalhit',
    'linkedinbot',
    'twitterbot',
    'whatsapp',
    'telegrambot',
    'discordbot',
  ].some((token) => value.includes(token));
}

function getSentryBuildOptions() {
  const environment = getEnvironment();
  const release = getRelease();

  return {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: true,
    sourcemaps: {
      disable: false,
    },
    release: {
      name: release,
      create: true,
      finalize: true,
      setCommits: {
        auto: true,
        ignoreMissing: true,
      },
      deploy: {
        env: environment,
      },
    },
    reactComponentAnnotation: {
      enabled: true,
    },
  };
}

module.exports = {
  getEnvironment,
  getRelease,
  getDsn,
  getCommonOptions,
  getSentryBuildOptions,
  isBotUserAgent,
};
