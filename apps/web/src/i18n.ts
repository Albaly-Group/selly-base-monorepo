import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Supported locales
export const locales = ['en', 'th'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({requestLocale}) => {
  // Get the locale - this is now always a string in next-intl v3+
  const locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
