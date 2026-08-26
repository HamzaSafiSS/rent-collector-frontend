/**
 * Utility functions for robust timezone-aware date parsing and formatting.
 */

/**
 * Safely parses any date or ISO string as UTC where appropriate.
 *
 * If given an ISO datetime string without an explicit timezone (e.g. "2026-08-26T11:04:21"),
 * it appends 'Z' to prevent the browser from incorrectly parsing it as local time.
 *
 * @param {string|number|Date} dateInput
 * @returns {Date|null}
 */
export function parseUtcDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    // If it is an ISO datetime string missing timezone offset or 'Z'
    // e.g. "2026-08-26T11:04:21" or "2026-08-26T11:04:21.123456"
    if (trimmed.includes('T') && !trimmed.endsWith('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(trimmed)) {
      const parsed = new Date(`${trimmed}Z`);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/**
 * Calculates human-readable relative time (e.g. "Just now", "5m ago", "2h ago", "3d ago")
 * using the provided i18n translate function.
 *
 * @param {string|number|Date} dateInput
 * @param {Function} t - i18next translate function
 * @returns {string}
 */
export function formatRelativeTime(dateInput, t) {
  const date = parseUtcDate(dateInput);
  if (!date) return '';

  const now = Date.now();
  const diffMs = now - date.getTime();

  // If timestamp is slightly in the future due to small client/server clock skew
  // or happened less than 1 minute ago:
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return t ? t('dashboard.justNow', 'Just now') : 'Just now';
  }
  if (diffMins < 60) {
    return t
      ? t('dashboard.minutesAgo', { count: diffMins, defaultValue: `${diffMins}m ago` })
      : `${diffMins}m ago`;
  }

  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) {
    return t
      ? t('dashboard.hoursAgo', { count: diffHrs, defaultValue: `${diffHrs}h ago` })
      : `${diffHrs}h ago`;
  }

  const diffDays = Math.floor(diffHrs / 24);
  return t
    ? t('dashboard.daysAgo', { count: diffDays, defaultValue: `${diffDays}d ago` })
    : `${diffDays}d ago`;
}
