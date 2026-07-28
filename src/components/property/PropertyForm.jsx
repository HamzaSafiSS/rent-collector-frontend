import { useEffect, useState } from 'react';
import { Input, Button, Alert } from '../common';

export default function PropertyForm({ initial, onSubmit, loading, error }) {
  const [form, setForm] = useState({ name: '', address: '', description: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) setForm({ name: initial.name || '', address: initial.address || '', description: initial.description || '' });
  }, [initial]);

  function validate() {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Property name is required.';
    if (!form.address.trim()) errs.address = 'Address is required.';
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
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert type="error" message={error} />}
      <Input label="Property name" name="name"        value={form.name}        onChange={handleChange} error={errors.name}    disabled={loading} placeholder="e.g. Bole Sunshine Apartments" required />
      <Input label="Address"       name="address"     value={form.address}     onChange={handleChange} error={errors.address} disabled={loading} placeholder="Full street address" required />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Description (optional)</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={loading}
          rows={3}
          className="w-full px-3 py-2 text-sm text-slate-100 bg-slate-800/60 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-slate-800/30 disabled:text-slate-500 placeholder-slate-500 transition-all duration-200"
          placeholder="Brief description of the property..."
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {initial ? 'Save changes' : 'Create property'}
        </Button>
      </div>
    </form>
  );
}