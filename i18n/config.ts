export const locales = ['en', 'da', 'de', 'fr', 'nl'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  da: 'Dansk',
  de: 'Deutsch',
  fr: 'Francais',
  nl: 'Nederlands',
};

// Map locales to their currency preferences
export const localeCurrencies: Record<Locale, 'EUR' | 'DKK'> = {
  en: 'EUR',
  da: 'DKK',
  de: 'EUR',
  fr: 'EUR',
  nl: 'EUR',
};
