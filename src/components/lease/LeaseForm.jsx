import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button, Alert } from '../common';

const selectClass = 'w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/30 disabled:text-slate-400 dark:disabled:text-slate-500 transition-all duration-200';

export default function LeaseForm({ units = [], totalUnits = 0, onSubmit, loading, error }) {
  const { t } = useTranslation();
  const [form, setForm]   = useState({
    tenantEmail: '',
    unitId: '', startDate: '', monthlyRent: '',
    agreementDocument: null,
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.tenantEmail.trim()) {
      errs.tenantEmail = 'validation.tenantEmailRequired';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.tenantEmail.trim())) {
      errs.tenantEmail = 'validation.validEmail';
    }

    if (!form.unitId)      errs.unitId      = 'validation.selectUnit';
    if (!form.startDate)   errs.startDate   = 'validation.startDateRequired';
    if (!form.monthlyRent) errs.monthlyRent = 'validation.monthlyRentRequired';
    else if (Number(form.monthlyRent) <= 0) errs.monthlyRent = 'validation.mustBeGreaterThanZero';
    if (!form.agreementDocument) errs.agreementDocument = 'validation.agreementDocumentRequired';
    return errs;
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm((p) => ({ ...p, [name]: files ? files[0] : value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      unitId:      Number(form.unitId),
      startDate:   form.startDate,
      monthlyRent: Number(form.monthlyRent),
      tenantEmail: form.tenantEmail.trim(),
    };

    onSubmit(payload, form.agreementDocument);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert type="error" message={error} />}

      <Input
        label={t('leases.tenantEmail')}
        name="tenantEmail"
        type="email"
        value={form.tenantEmail}
        onChange={handleChange}
        error={errors.tenantEmail ? t(errors.tenantEmail) : ''}
        disabled={loading}
        placeholder={t('leases.tenantEmailPlaceholder')}
        hint={t('leases.tenantEmailHint')}
        required
      />

      {/* Unit selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          <span className="text-red-400 mr-1" aria-hidden="true">*</span>{t('leases.unitSelector')}
        </label>
        <select
          name="unitId"
          value={form.unitId}
          onChange={handleChange}
          disabled={loading}
          className={selectClass}
        >
          <option value="">{t('leases.selectUnit')}</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.unitNumber}</option>
          ))}
        </select>
        {errors.unitId && <p className="mt-1 text-xs text-red-400">{errors.unitId}</p>}
        {totalUnits === 0 ? (
          <p className="mt-1 text-xs text-amber-400">{t('leases.noUnitsYet')}</p>
        ) : units.length === 0 ? (
          <p className="mt-1 text-xs text-amber-400">{t('leases.noAvailableUnits')}</p>
        ) : null}
      </div>

      <Input
        label={t('leases.startDate')}
        name="startDate"
        type="date"
        value={form.startDate}
        onChange={handleChange}
        error={errors.startDate}
        disabled={loading}
        required
      />

      <Input
        label={t('leases.monthlyRentETB')}
        name="monthlyRent"
        type="number"
        min="1"
        value={form.monthlyRent}
        onChange={handleChange}
        error={errors.monthlyRent}
        disabled={loading}
        placeholder={t('leases.monthlyRentPlaceholder')}
        required
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          <span className="text-red-400 mr-1" aria-hidden="true">*</span>
          {t('leases.agreementDocument')}
        </label>
        <input
          type="file"
          name="agreementDocument"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
          disabled={loading}
          className={`block w-full text-sm text-slate-500 dark:text-slate-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-xl file:border-0
            file:text-sm file:font-semibold
            file:bg-emerald-50 file:text-emerald-700
            dark:file:bg-emerald-900/30 dark:file:text-emerald-400
            hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/50
            cursor-pointer
            ${errors.agreementDocument ? 'border border-red-500 rounded-xl' : ''}`}
        />
        {errors.agreementDocument && (
          <p className="mt-1 text-xs text-red-500">{errors.agreementDocument}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>{t('leases.createLeaseBtn')}</Button>
      </div>
    </form>
  );
}