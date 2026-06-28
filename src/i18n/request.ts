import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

type Messages = Record<string, unknown>;

// Bir çeviri anahtarı aktif dilde eksikse Türkçe (varsayılan dil) değerini kullan.
function deepMerge(fallback: Messages, override: Messages): Messages {
  const result: Messages = {...fallback};

  for (const key of Object.keys(override)) {
    const fallbackValue = fallback[key];
    const overrideValue = override[key];

    if (
      typeof fallbackValue === 'object' &&
      fallbackValue !== null &&
      typeof overrideValue === 'object' &&
      overrideValue !== null
    ) {
      result[key] = deepMerge(fallbackValue as Messages, overrideValue as Messages);
    } else {
      result[key] = overrideValue;
    }
  }

  return result;
}

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  // Varsayılan dil için ek birleştirmeye gerek yok.
  if (locale === routing.defaultLocale) {
    return {locale, messages};
  }

  const fallbackMessages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;

  return {
    locale,
    messages: deepMerge(fallbackMessages, messages),
    onError: (error) => {
      console.error('[next-intl]', error);
    },
    getMessageFallback: ({namespace, key}) => {
      const path = [namespace, key].filter(Boolean).join('.');
      console.warn(`[next-intl] Eksik çeviri anahtarı: "${path}" (${locale})`);
      return path;
    }
  };
});
