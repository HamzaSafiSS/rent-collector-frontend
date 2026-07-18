import { useState } from 'react';
import { Input, Button, Alert } from '../common';

export default function LeaseForm({ units = [], onSubmit, loading, error }) {
  const [form, setForm]   = useState({
    tenantEmail: '',
    unitId: '', startDate: '', monthlyRent: '',
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.tenantEmail.trim()) errs.tenantEmail = 'Tenant email is required.';
    if (!form.unitId)      errs.unitId      = 'Please select a unit.';
    if (!form.startDate)   errs.startDate   = 'Start date is required.';
    if (!form.monthlyRent) errs.monthlyRent = 'Monthly rent is required.';
    else if (Number(form.monthlyRent) <= 0) errs.monthlyRent = 'Must be greater than zero.';
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
        label="Tenant Email"
        name="tenantEmail"
        type="email"
        value={form.tenantEmail}
        onChange={handleChange}
        error={errors.tenantEmail}
        disabled={loading}
        placeholder="tenant@example.com"
        hint="Enter the email for a new or existing tenant."
      />

      {/* Unit selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
        <select
          name="unitId"
          value={form.unitId}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
        >
          <option value="">Select a unit...</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.unitNumber}</option>
          ))}
        </select>
        {errors.unitId && <p className="mt-1 text-xs text-red-600">{errors.unitId}</p>}
        {units.length === 0 && <p className="mt-1 text-xs text-yellow-600">No available units. All units are occupied or in maintenance.</p>}
      </div>

      <Input
        label="Start date"
        name="startDate"
        type="date"
        value={form.startDate}
        onChange={handleChange}
        error={errors.startDate}
        disabled={loading}
      />

      <Input
        label="Monthly rent (ETB)"
        name="monthlyRent"
        type="number"
        min="1"
        value={form.monthlyRent}
        onChange={handleChange}
        error={errors.monthlyRent}
        disabled={loading}
        placeholder="e.g. 6500"
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Create lease</Button>
      </div>
    </form>
  );
}