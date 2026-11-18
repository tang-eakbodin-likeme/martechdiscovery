export const LOCALES = ['th', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'th';

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);
export const otherLocale = (locale: Locale): Locale => (locale === 'th' ? 'en' : 'th');

/** Pick the English or Thai string for the current locale. */
export const pick = (locale: Locale, en: string, th: string) => (locale === 'th' ? th : en);

/** A text field that is either plain or localized per language. */
export type LocalText = string | { en?: string; th?: string };
export const local = (value: LocalText | undefined | null, locale: Locale): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? value.en ?? '';
};

export const localeParams = () => LOCALES.map((locale) => ({ locale }));
