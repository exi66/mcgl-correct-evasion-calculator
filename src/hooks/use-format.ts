import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/** Number formats in the current UI language. */
export function useFormat() {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  return useMemo(() => {
    /** Up to 4 decimals: real evasion, gains. */
    const exact = new Intl.NumberFormat(lang, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
    /** Exactly 1 decimal: armor evasion (a sum of 0.7/1.1/1.5 steps). */
    const fixed1 = new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return { exact: (n: number) => exact.format(n), fixed1: (n: number) => fixed1.format(n) };
  }, [lang]);
}
