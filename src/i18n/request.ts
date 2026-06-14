import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

type Locale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const localeRaw = await requestLocale;
  let locale: Locale = routing.defaultLocale;
  if (localeRaw && (routing.locales as readonly string[]).includes(localeRaw)) {
    locale = localeRaw as Locale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
