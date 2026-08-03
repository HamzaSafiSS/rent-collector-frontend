/**
 * Ethiopian Calendar ↔ Gregorian Calendar conversion utilities.
 *
 * Uses the Julian Day Number (JDN) algorithm for accurate bidirectional conversion.
 * The Ethiopian calendar has 13 months: 12 months of 30 days each, plus Pagumē (5 or 6 days).
 * The Ethiopian New Year (Meskerem 1) falls on September 11 (or 12 in a Gregorian leap year).
 */

// ── Constants ────────────────────────────────────────────────────────────────────

const ETH_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ',
];

const ETH_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume',
];

const ETH_MONTHS_SHORT_AM = [
  'መስከ', 'ጥቅም', 'ኅዳር', 'ታኅሣ', 'ጥር', 'የካቲ',
  'መጋቢ', 'ሚያዝ', 'ግንቦ', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ',
];

const ETH_MONTHS_SHORT_EN = [
  'Mes', 'Tik', 'Hid', 'Tah', 'Tir', 'Yek',
  'Meg', 'Miy', 'Gin', 'Sen', 'Ham', 'Neh', 'Pag',
];

const GREG_MONTHS_AM = [
  'ጃንዋሪ', 'ፌብሩዋሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን',
  'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር', 'ዲሴምበር',
];

// ── JDN-based conversion ─────────────────────────────────────────────────────────

/**
 * Gregorian date → Julian Day Number
 */
function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Julian Day Number → Ethiopian date
 */
function jdnToEthiopian(jdn) {
  // Ethiopian epoch in JDN: August 29, 8 AD (Julian) = JDN 1724221
  const ethiopianEpoch = 1724221;
  const r = (jdn - ethiopianEpoch) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  const year = 4 * Math.floor((jdn - ethiopianEpoch) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  return { year, month, day };
}

/**
 * Ethiopian date → Julian Day Number
 */
function ethiopianToJDN(year, month, day) {
  const ethiopianEpoch = 1724221;
  return (
    ethiopianEpoch +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    (day - 1)
  );
}

/**
 * Julian Day Number → Gregorian date
 */
function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return { year, month, day };
}

// ── Public API ───────────────────────────────────────────────────────────────────

/**
 * Convert Gregorian date to Ethiopian date.
 * @param {number} gYear  - Gregorian year
 * @param {number} gMonth - Gregorian month (1-12)
 * @param {number} gDay   - Gregorian day (1-31)
 * @returns {{ year: number, month: number, day: number }}
 */
export function toEthiopian(gYear, gMonth, gDay) {
  const jdn = gregorianToJDN(gYear, gMonth, gDay);
  return jdnToEthiopian(jdn);
}

/**
 * Convert Ethiopian date to Gregorian date.
 * @param {number} eYear  - Ethiopian year
 * @param {number} eMonth - Ethiopian month (1-13)
 * @param {number} eDay   - Ethiopian day (1-30, or 1-5/6 for Pagumē)
 * @returns {{ year: number, month: number, day: number }}
 */
export function toGregorian(eYear, eMonth, eDay) {
  const jdn = ethiopianToJDN(eYear, eMonth, eDay);
  return jdnToGregorian(jdn);
}

/**
 * Check if an Ethiopian year is a leap year.
 * Ethiopian leap year: year % 4 === 3  (e.g., 2015 ET is a leap year)
 */
export function isEthiopianLeapYear(eYear) {
  return eYear % 4 === 3;
}

/**
 * Get the number of days in a given Ethiopian month.
 * Months 1–12 have 30 days. Month 13 (Pagumē) has 5 or 6 days.
 */
export function getEthiopianMonthDays(eYear, eMonth) {
  if (eMonth >= 1 && eMonth <= 12) return 30;
  if (eMonth === 13) return isEthiopianLeapYear(eYear) ? 6 : 5;
  return 0;
}

/**
 * Get current date in Ethiopian calendar.
 * @returns {{ year: number, month: number, day: number }}
 */
export function getCurrentEthiopianDate() {
  const now = new Date();
  return toEthiopian(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Get current Ethiopian year.
 * @returns {number}
 */
export function getCurrentEthiopianYear() {
  return getCurrentEthiopianDate().year;
}

/**
 * Get Ethiopian month info array (13 months).
 * @returns {Array<{ value: string, month: number, labelAm: string, labelEn: string }>}
 */
export function getEthiopianMonths() {
  return ETH_MONTHS_AM.map((am, i) => ({
    value: String(i + 1).padStart(2, '0'),
    month: i + 1,
    labelAm: am,
    labelEn: ETH_MONTHS_EN[i],
  }));
}

/**
 * Get the Ethiopian month name.
 * @param {number} month - Ethiopian month (1-13)
 * @param {'am'|'en'} lang - Language
 * @returns {string}
 */
export function getEthiopianMonthName(month, lang = 'am') {
  const idx = month - 1;
  if (idx < 0 || idx > 12) return '';
  return lang === 'am' ? ETH_MONTHS_AM[idx] : ETH_MONTHS_EN[idx];
}

/**
 * Get abbreviated Ethiopian month name.
 * @param {number} month - Ethiopian month (1-13)
 * @param {'am'|'en'} lang - Language
 * @returns {string}
 */
export function getEthiopianMonthShort(month, lang = 'am') {
  const idx = month - 1;
  if (idx < 0 || idx > 12) return '';
  return lang === 'am' ? ETH_MONTHS_SHORT_AM[idx] : ETH_MONTHS_SHORT_EN[idx];
}

/**
 * Format an ISO date string (YYYY-MM-DD) as an Ethiopian date string.
 * @param {string} isoDate - e.g. "2026-08-03"
 * @param {'am'|'en'} lang
 * @returns {string} e.g. "27 ሐምሌ 2018" or "27 Hamle 2018"
 */
export function formatEthiopianDate(isoDate, lang = 'am') {
  if (!isoDate) return '';
  const parts = isoDate.split('T')[0].split('-');
  if (parts.length < 3) return isoDate;
  const eth = toEthiopian(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10),
    parseInt(parts[2], 10)
  );
  const monthName = getEthiopianMonthName(eth.month, lang);
  return `${eth.day} ${monthName} ${eth.year}`;
}

/**
 * Format an ISO date-time string as an Ethiopian date-time string.
 * @param {string} isoDateTime - e.g. "2026-08-03T14:30:00"
 * @param {'am'|'en'} lang
 * @returns {string} e.g. "27 ሐምሌ 2018, 2:30 PM"
 */
export function formatEthiopianDateTime(isoDateTime, lang = 'am') {
  if (!isoDateTime) return '';
  const dateStr = formatEthiopianDate(isoDateTime, lang);
  // Extract time portion
  const dateObj = new Date(isoDateTime);
  if (isNaN(dateObj.getTime())) return dateStr;
  const timeStr = dateObj.toLocaleTimeString(lang === 'am' ? 'am-ET' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr}, ${timeStr}`;
}

/**
 * Format a Gregorian YYYY-MM string as an Ethiopian month+year label.
 * Uses the 15th of that Gregorian month as a representative date.
 * @param {string} gregMonth - e.g. "2026-08"
 * @param {'am'|'en'} lang
 * @returns {string} e.g. "ሐምሌ 2018" or "Hamle 2018"
 */
export function formatEthiopianMonth(gregMonth, lang = 'am') {
  if (!gregMonth) return '';
  const parts = gregMonth.split('-');
  if (parts.length < 2) return gregMonth;
  const eth = toEthiopian(parseInt(parts[0], 10), parseInt(parts[1], 10), 15);
  const monthName = getEthiopianMonthName(eth.month, lang);
  return `${monthName} ${eth.year}`;
}

/**
 * Convert an Ethiopian year + month selection to an approximate Gregorian YYYY-MM.
 * Returns the Gregorian month that contains the start of the Ethiopian month.
 * @param {number} ethYear
 * @param {number} ethMonth (1-13)
 * @returns {string} e.g. "2026-09"
 */
export function ethiopianMonthToGregorian(ethYear, ethMonth) {
  const greg = toGregorian(ethYear, ethMonth, 1);
  return `${greg.year}-${String(greg.month).padStart(2, '0')}`;
}

/**
 * Convert a Gregorian YYYY-MM to an Ethiopian { year, month }.
 * Uses the 15th as a representative day.
 * @param {string} gregYearMonth - e.g. "2026-08"
 * @returns {{ year: number, month: number }}
 */
export function gregorianMonthToEthiopian(gregYearMonth) {
  if (!gregYearMonth) return { year: 0, month: 0 };
  const parts = gregYearMonth.split('-');
  return toEthiopian(parseInt(parts[0], 10), parseInt(parts[1], 10), 15);
}

/**
 * Convert a Gregorian year to an approximate Ethiopian year.
 * (Based on the start of the Gregorian year — January 1.)
 * @param {number} gregYear
 * @returns {number}
 */
export function gregorianYearToEthiopian(gregYear) {
  // January 1 of a Gregorian year falls in the Ethiopian year that is ~7-8 years behind
  const eth = toEthiopian(gregYear, 1, 1);
  return eth.year;
}

/**
 * Convert an Ethiopian year to the primary overlapping Gregorian year.
 * Ethiopian year X starts in September of Gregorian year X+7 or X+8.
 * @param {number} ethYear
 * @returns {number}
 */
export function ethiopianYearToGregorian(ethYear) {
  const greg = toGregorian(ethYear, 1, 1);
  return greg.year;
}

/**
 * Format a Gregorian ISO date string for Gregorian display (respects locale).
 * @param {string} isoDate
 * @returns {string}
 */
export function formatGregorianDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString();
}

/**
 * Format a Gregorian ISO date-time string for Gregorian display.
 * @param {string} isoDateTime
 * @returns {string}
 */
export function formatGregorianDateTime(isoDateTime) {
  if (!isoDateTime) return '';
  return new Date(isoDateTime).toLocaleString();
}

/**
 * Convert a Gregorian ISO date string (YYYY-MM-DD) to an Ethiopian ISO-like string.
 * Useful for rendering Ethiopian date in an input value context.
 * @param {string} gregDate - e.g. "2026-08-03"
 * @returns {string} - e.g. "2018-11-27" (Ethiopian)
 */
export function toEthiopianDateString(gregDate) {
  if (!gregDate) return '';
  const parts = gregDate.split('-');
  if (parts.length < 3) return '';
  const eth = toEthiopian(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10),
    parseInt(parts[2], 10)
  );
  return `${eth.year}-${String(eth.month).padStart(2, '0')}-${String(eth.day).padStart(2, '0')}`;
}

/**
 * Convert an Ethiopian date components back to a Gregorian ISO string.
 * @param {number} ethYear
 * @param {number} ethMonth
 * @param {number} ethDay
 * @returns {string} - e.g. "2026-08-03"
 */
export function toGregorianDateString(ethYear, ethMonth, ethDay) {
  const greg = toGregorian(ethYear, ethMonth, ethDay);
  return `${greg.year}-${String(greg.month).padStart(2, '0')}-${String(greg.day).padStart(2, '0')}`;
}

// Re-export constants for external use
export { ETH_MONTHS_AM, ETH_MONTHS_EN, ETH_MONTHS_SHORT_AM, ETH_MONTHS_SHORT_EN, GREG_MONTHS_AM };
