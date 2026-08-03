import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  toEthiopian,
  toGregorianDateString,
  getEthiopianMonths,
  getEthiopianMonthDays,
  getCurrentEthiopianDate,
} from '../../utils/ethiopianDateUtils';

/**
 * A calendar-aware date picker.
 * - Amharic mode → Ethiopian calendar dropdowns (year / month / day)
 * - English mode → native <input type="date">
 *
 * Always outputs and accepts Gregorian ISO date strings (YYYY-MM-DD).
 */
export default function EthiopianDatePicker({
  value,        // Gregorian ISO string, e.g. "2026-08-03"
  onChange,      // (e: { target: { name, value } }) => void — Gregorian ISO string
  name = '',
  disabled = false,
  className = '',
  label,
  error,
  required,
}) {
  const { i18n, t } = useTranslation();
  const isEthiopian = i18n.language?.startsWith('am');

  // Parse the Gregorian value into Ethiopian components
  const ethFromValue = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length < 3) return null;
    return toEthiopian(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10),
      parseInt(parts[2], 10)
    );
  }, [value]);

  const [ethYear, setEthYear] = useState('');
  const [ethMonth, setEthMonth] = useState('');
  const [ethDay, setEthDay] = useState('');

  // Sync internal state when value prop changes
  useEffect(() => {
    if (ethFromValue) {
      setEthYear(String(ethFromValue.year));
      setEthMonth(String(ethFromValue.month));
      setEthDay(String(ethFromValue.day));
    } else {
      setEthYear('');
      setEthMonth('');
      setEthDay('');
    }
  }, [ethFromValue]);

  const ethMonths = useMemo(() => getEthiopianMonths(), []);

  const currentEth = useMemo(() => getCurrentEthiopianDate(), []);

  // Generate year options: current Ethiopian year -5 to +5
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentEth.year - 5; y <= currentEth.year + 5; y++) {
      years.push(y);
    }
    return years;
  }, [currentEth.year]);

  // Day count depends on selected month and year
  const maxDays = useMemo(() => {
    if (!ethYear || !ethMonth) return 30;
    return getEthiopianMonthDays(parseInt(ethYear, 10), parseInt(ethMonth, 10));
  }, [ethYear, ethMonth]);

  // Emit Gregorian value when Ethiopian selections change
  function emitChange(y, m, d) {
    if (y && m && d) {
      const yearNum = parseInt(y, 10);
      const monthNum = parseInt(m, 10);
      const dayNum = parseInt(d, 10);
      if (yearNum && monthNum && dayNum) {
        const gregStr = toGregorianDateString(yearNum, monthNum, dayNum);
        onChange?.({ target: { name, value: gregStr } });
        return;
      }
    }
    // If incomplete, emit empty
    onChange?.({ target: { name, value: '' } });
  }

  function handleYearChange(e) {
    const newYear = e.target.value;
    setEthYear(newYear);
    // Clamp day if needed
    if (ethMonth && ethDay) {
      const max = getEthiopianMonthDays(
        parseInt(newYear || '0', 10),
        parseInt(ethMonth, 10)
      );
      const clampedDay = parseInt(ethDay, 10) > max ? String(max) : ethDay;
      setEthDay(clampedDay);
      emitChange(newYear, ethMonth, clampedDay);
    } else {
      emitChange(newYear, ethMonth, ethDay);
    }
  }

  function handleMonthChange(e) {
    const newMonth = e.target.value;
    setEthMonth(newMonth);
    // Clamp day if needed
    if (ethYear && ethDay) {
      const max = getEthiopianMonthDays(
        parseInt(ethYear, 10),
        parseInt(newMonth || '0', 10)
      );
      const clampedDay = parseInt(ethDay, 10) > max ? String(max) : ethDay;
      setEthDay(clampedDay);
      emitChange(ethYear, newMonth, clampedDay);
    } else {
      emitChange(ethYear, newMonth, ethDay);
    }
  }

  function handleDayChange(e) {
    const newDay = e.target.value;
    setEthDay(newDay);
    emitChange(ethYear, ethMonth, newDay);
  }

  const selectClass =
    'px-2 py-2 text-sm bg-[#111827] text-slate-100 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-slate-800/50 disabled:text-slate-500 transition-all duration-200';

  const inputBaseClass =
    'w-full px-3 py-2 text-sm text-slate-100 bg-[#111827] border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-slate-800/30 disabled:text-slate-500 transition-all duration-200';

  // Gregorian mode — standard native input
  if (!isEthiopian) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium leading-none text-slate-300 mb-2">
            {required && <span className="text-red-400 mr-1" aria-hidden="true">*</span>}
            {label}
          </label>
        )}
        <input
          type="date"
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={`${inputBaseClass} ${className}`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  // Ethiopian mode — three dropdowns
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium leading-none text-slate-300 mb-2">
          {required && <span className="text-red-400 mr-1" aria-hidden="true">*</span>}
          {label}
        </label>
      )}
      <div className="flex gap-2">
        {/* Day */}
        <select
          value={ethDay}
          onChange={handleDayChange}
          disabled={disabled}
          className={`${selectClass} w-[72px] ${className}`}
          aria-label={t('calendar.day', 'Day')}
        >
          <option value="">{t('calendar.day', 'ቀን')}</option>
          {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={ethMonth}
          onChange={handleMonthChange}
          disabled={disabled}
          className={`${selectClass} flex-1 ${className}`}
          aria-label={t('calendar.month', 'Month')}
        >
          <option value="">{t('calendar.month', 'ወር')}</option>
          {ethMonths.map((m) => (
            <option key={m.month} value={m.month}>{m.labelAm}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={ethYear}
          onChange={handleYearChange}
          disabled={disabled}
          className={`${selectClass} w-[90px] ${className}`}
          aria-label={t('calendar.year', 'Year')}
        >
          <option value="">{t('calendar.year', 'ዓ.ም.')}</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
