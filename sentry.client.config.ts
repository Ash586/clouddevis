import * as Sentry from '@sentry/nextjs';
import { replayIntegration } from '@sentry/replay';
import sentryConfig from './sentry.config';

const environment = sentryConfig.getEnvironment();

Sentry.init({
  ...sentryConfig.getCommonOptions(),
  replaysSessionSampleRate: environment === 'production' ? 0.1 : 1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],
});
