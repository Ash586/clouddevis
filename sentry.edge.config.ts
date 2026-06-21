import * as Sentry from '@sentry/nextjs';
import sentryConfig from './sentry.config';

Sentry.init({
  ...sentryConfig.getCommonOptions(),
  tracesSampleRate: sentryConfig.getEnvironment() === 'production' ? 0.1 : 1,
});
