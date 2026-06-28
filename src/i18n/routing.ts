import {defineRouting} from 'next-intl/routing';

export const locales = ['tr', 'en', 'de', 'it', 'ar', 'ru'] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: 'tr',
  localePrefix: 'always'
});

export type Locale = (typeof locales)[number];
