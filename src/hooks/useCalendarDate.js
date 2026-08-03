import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import {
  formatEthiopianDate,
  formatEthiopianDateTime,
  formatEthiopianMonth,
  formatGregorianDate,
  formatGregorianDateTime,
} from '../utils/ethiopianDateUtils';

/**
 * Hook that provides calendar-aware date formatting functions.
 * Automatically switches between Gregorian and Ethiopian based on i18n language.
 *
 * Usage:
 *   const { formatDate, formatDateTime, formatMonth, isEthiopian } = useCalendarDate();
 *   <span>{formatDate(someIsoString)}</span>
 */
export default function useCalendarDate() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('am') ? 'am' : 'en';
  const isEthiopian = lang === 'am';

  return useMemo(() => ({
    /** Whether the current calendar is Ethiopian */
    isEthiopian,

    /** Current language code ('am' or 'en') */
    lang,

    /**
     * Format an ISO date string (YYYY-MM-DD or full ISO) as a localized date.
     * Ethiopian mode: "27 ሐምሌ 2018"
     * Gregorian mode: browser locale date string
     */
    formatDate: (isoDate) => {
      if (!isoDate) return '—';
      return isEthiopian
        ? formatEthiopianDate(isoDate, lang)
        : formatGregorianDate(isoDate);
    },

    /**
     * Format an ISO date-time string as a localized date+time.
     * Ethiopian mode: "27 ሐምሌ 2018, 2:30 PM"
     * Gregorian mode: browser locale date-time string
     */
    formatDateTime: (isoDateTime) => {
      if (!isoDateTime) return '—';
      return isEthiopian
        ? formatEthiopianDateTime(isoDateTime, lang)
        : formatGregorianDateTime(isoDateTime);
    },

    /**
     * Format a YYYY-MM string as a localized month label.
     * Ethiopian mode: "ሐምሌ 2018"
     * Gregorian mode: "8/2026" (browser default)
     */
    formatMonth: (isoMonth) => {
      if (!isoMonth) return '—';
      if (isEthiopian) return formatEthiopianMonth(isoMonth, lang);
      // Gregorian: produce a readable month label
      const parts = isoMonth.split('-');
      if (parts.length < 2) return isoMonth;
      const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    },
  }), [isEthiopian, lang]);
}
