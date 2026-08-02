import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button, Alert } from '../common';

const selectClass = 'w-full px-3 py-2 text-sm text-slate-100 bg-slate-800/60 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-slate-800/30 disabled:text-slate-500 transition-all duration-200';

export default function LeaseForm({ units = [], totalUnits = 0, onSubmit, loading, error }) {
  const { t } = useTranslation();
  const [form, setForm]   = useState({
    tenantEmail: '',
    unitId: '', startDate: '', monthlyRent: '',
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.tenantEmail.trim()) errs.tenantEmail = t('validation.tenantEmailRequired');
    if (!form.unitId)      errs.unitId      = t('validation.selectUnit');
    if (!form.startDate)   errs.startDate   = t('validation.startDateRequired');
    if (!form.monthlyRent) errs.monthlyRent = t('validation.monthlyRentRequired');
    else if (Number(form.monthlyRent) <= 0) errs.monthlyRent = t('validation.mustBeGreaterThanZero');
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
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

    onSubmit(payload);
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
        error={errors.tenantEmail}
        disabled={loading}
        placeholder={t('leases.tenantEmailPlaceholder')}
        hint={t('leases.tenantEmailHint')}
        required
      />

      {/* Unit selector */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
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

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>{t('leases.createLeaseBtn')}</Button>
      </div>
    </form>
  );
}