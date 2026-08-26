import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { parseUtcDate, formatRelativeTime as formatRelTime } from '../utils/dateUtils';

/**
 * Hook that provides locale-aware Gregorian date formatting functions.
 * Uses the i18n language to format dates in the appropriate locale
 * (Amharic or English), always using the Gregorian calendar.
 *
 * Usage:
 *   const { formatDate, formatDateTime, formatMonth, formatRelativeTime } = useCalendarDate();
 *   <span>{formatDate(someIsoString)}</span>
 */
export default function useCalendarDate() {
  const { t, i18n } = useTranslation();
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
      if (typeof isoDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
        const [y, m, d] = isoDate.split('-').map((v) => parseInt(v, 10));
        const localDate = new Date(y, m - 1, d);
        return localDate.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      const parsed = parseUtcDate(isoDate);
      if (!parsed) return '—';
      return parsed.toLocaleDateString(locale, {
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
      const parsed = parseUtcDate(isoDateTime);
      if (!parsed) return '—';
      return parsed.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    /**
     * Format a date into relative time (e.g. "Just now", "5m ago", "2h ago", "3d ago").
     */
    formatRelativeTime: (dateInput) => {
      return formatRelTime(dateInput, t);
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
  }), [t, lang, locale]);
}

