'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { translate, type Locale, type TranslationValues } from '@/lib/i18n';

const LanguageContext = createContext({
  locale: 'en' as Locale,
  localeRef: { current: 'en' as Locale },
  setLocale: (() => {}) as (locale: Locale) => void,
  t: (key: string, values?: TranslationValues) => translate('en', key, values),
});

export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const [locale, setLanguage] = useState<Locale>(initialLocale);
  const localeRef = useRef(initialLocale);
  const setLocale = useCallback((next: Locale) => {
    localeRef.current = next;
    setLanguage(next);
    document.cookie = `cc-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  }, []);
  const t = useCallback((key: string, values?: TranslationValues) => translate(locale, key, values), [locale]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, 'Clark County Digital Equity Assistant');
    return () => { document.documentElement.lang = 'en'; };
  }, [locale]);
  const value = useMemo(() => ({ locale, localeRef, setLocale, t }), [locale, setLocale, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <ToggleGroup aria-label={t('Language')} value={[locale]} onValueChange={values => {
      const next = values[0];
      if (next === 'en' || next === 'es') setLocale(next);
    }} className="flex shrink-0 rounded-xl border border-primary-foreground/30 p-1">
      {(['en', 'es'] as const).map(value => (
        <Toggle key={value} value={value} lang={value} className="min-h-9 rounded-lg px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/15 data-pressed:bg-primary-foreground data-pressed:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground">
          {value === 'en' ? 'English' : 'Español'}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
