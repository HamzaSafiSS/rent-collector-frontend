import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  gregorianMonthToEthiopian,
  ethiopianMonthToGregorian,
  getEthiopianMonths,
  getCurrentEthiopianDate,
} from '../../utils/ethiopianDateUtils';

/**
 * A calendar-aware month picker.
 * - Amharic mode → Ethiopian month + year dropdowns (13 months)
 * - English mode → native <input type="month">
 *
 * Always outputs and accepts Gregorian YYYY-MM strings.
 */
export default function EthiopianMonthPicker({
  value,        // Gregorian YYYY-MM string, e.g. "2026-08"
  onChange,      // (e: { target: { name, value } }) => void — Gregorian YYYY-MM string
  name = '',
  disabled = false,
  className = '',
  label,
  error,
  placeholder,
}) {
  const { i18n, t } = useTranslation();
  const isEthiopian = i18n.language?.startsWith('am');

  // Parse Gregorian value into Ethiopian using refs to preserve Pagume
  const ethStateRef = useRef({ ethYear: '', ethMonth: '' });
  
  const [ethYear, setEthYear] = useState('');
  const [ethMonth, setEthMonth] = useState('');

  ethStateRef.current = { ethYear, ethMonth };

  // Sync when value changes
  useEffect(() => {
    if (!value) {
      setEthYear('');
      setEthMonth('');
      return;
    }

    const { ethYear: prevYear, ethMonth: prevMonth } = ethStateRef.current;
    if (prevYear && prevMonth) {
      const currentGregStr = ethiopianMonthToGregorian(parseInt(prevYear, 10), parseInt(prevMonth, 10));
      if (currentGregStr === value) {
        return; // Skip overriding to preserve the user's explicit selection (e.g. Pagume)
      }
    }

    const eth = gregorianMonthToEthiopian(value);
    if (eth && eth.year) {
      setEthYear(String(eth.year));
      setEthMonth(String(eth.month));
    } else {
      setEthYear('');
      setEthMonth('');
    }
  }, [value]);

  const ethMonths = useMemo(() => getEthiopianMonths(), []);
  const currentEth = useMemo(() => getCurrentEthiopianDate(), []);

  // Year options: current - 5 to current + 5
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentEth.year - 5; y <= currentEth.year + 5; y++) {
      years.push(y);
    }
    return years;
  }, [currentEth.year]);

  function emitChange(y, m) {
    if (y && m) {
      const gregStr = ethiopianMonthToGregorian(parseInt(y, 10), parseInt(m, 10));
      onChange?.({ target: { name, value: gregStr } });
    } else {
      onChange?.({ target: { name, value: '' } });
    }
  }

  function handleMonthChange(e) {
    const newMonth = e.target.value;
    setEthMonth(newMonth);
    emitChange(ethYear, newMonth);
  }

  function handleYearChange(e) {
    const newYear = e.target.value;
    setEthYear(newYear);
    emitChange(newYear, ethMonth);
  }

  const selectClass =
    'px-2 py-2 text-sm bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-500 transition-all duration-200';

  const inputBaseClass =
    'w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/30 disabled:text-slate-400 dark:disabled:text-slate-500 transition-all duration-200';

  // Gregorian mode — standard native input
  if (!isEthiopian) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium leading-none text-slate-700 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        <input
          type="month"
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`${inputBaseClass} ${className}`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  // Ethiopian mode — two dropdowns (month + year)
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium leading-none text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        {/* Month */}
        <select
          value={ethMonth}
          onChange={handleMonthChange}
          disabled={disabled}
          className={`${selectClass} flex-1 ${className}`}
          aria-label={t('calendar.month', 'Month')}
        >
          <option value="">{t('calendar.selectMonth', 'ወር ይምረጡ')}</option>
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
