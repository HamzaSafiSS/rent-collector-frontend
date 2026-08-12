import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

/**
 * Hook that provides locale-aware Gregorian date formatting functions.
 * Uses the i18n language to format dates in the appropriate locale
 * (Amharic or English), always using the Gregorian calendar.
 *
 * Usage:
 *   const { formatDate, formatDateTime, formatMonth } = useCalendarDate();
 *   <span>{formatDate(someIsoString)}</span>
 */
export default function useCalendarDate() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('am') ? 'am' : 'en';
  const locale = lang === 'am' ? 'am-ET' : 'en-US';

  return useMemo(() => ({
    /** Current language code ('am' or 'en') */
    lang,

    /**
     * Format an ISO date string (YYYY-MM-DD or full ISO) as a localized date.
     * e.g. "August 12, 2026" or "ኦገስት 12, 2026"
     */
    formatDate: (isoDate) => {
      if (!isoDate) return '—';
      return new Date(isoDate).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },

    /**
     * Format an ISO date-time string as a localized date+time.
     * e.g. "August 12, 2026, 2:30 PM"
     */
    formatDateTime: (isoDateTime) => {
      if (!isoDateTime) return '—';
      return new Date(isoDateTime).toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    /**
     * Format a YYYY-MM string as a localized month label.
     * e.g. "August 2026" or "ኦገስት 2026"
     */
    formatMonth: (isoMonth) => {
      if (!isoMonth) return '—';
      const parts = isoMonth.split('-');
      if (parts.length < 2) return isoMonth;
      const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      return dateObj.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    },
  }), [lang, locale]);
}
