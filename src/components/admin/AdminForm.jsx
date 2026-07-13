import { useEffect, useState } from 'react';
import { Input, Button, Alert } from '../common';

export default function AdminForm({ initial, onSubmit, loading, error, isEdit }) {
  const [form, setForm] = useState({
    fullName:    '',
    email:       '',
    password:    '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        fullName:    initial.fullName    || '',
        email:       initial.email       || '',
        password:    '',
        phoneNumber: initial.phoneNumber || '',
      });
    }
  }, [initial]);

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!isEdit) {
      if (!form.email.trim())    errs.email    = 'Email is required.';
      if (!form.password)        errs.password = 'Password is required.';
      else if (form.password.length < 8) errs.password = 'Minimum 8 characters.';
    }
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

      <Input label="Full name"    name="fullName"    value={form.fullName}    onChange={handleChange} error={errors.fullName}    disabled={loading} />
      {!isEdit && (
        <Input label="Email"      name="email"       type="email" value={form.email} onChange={handleChange} error={errors.email} disabled={loading} />
      )}
      <Input label="Phone number (optional)" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} disabled={loading} />
      {!isEdit && (
        <Input label="Password"   name="password"    type="password" value={form.password} onChange={handleChange} error={errors.password} disabled={loading} />
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save changes' : 'Create admin'}
        </Button>
      </div>
    </form>
  );
}