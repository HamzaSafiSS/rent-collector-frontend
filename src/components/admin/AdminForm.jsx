import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button, Alert } from '../common';

export default function AdminForm({ initial, onSubmit, loading, error, isEdit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName:    '',
    email:       '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        fullName:    initial.fullName    || '',
        email:       initial.email       || '',
        phoneNumber: initial.phoneNumber || '',
      });
    }
  }, [initial]);

  const PHONE_REGEX = /^(09|07|\+2519|\+2517)\d{8}$/;

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = t('validation.fullNameRequired');
    if (!isEdit) {
      if (!form.email.trim()) errs.email = t('validation.emailRequired');
      if (!form.phoneNumber.trim()) {
        errs.phoneNumber = t('validation.phoneNumberRequired');
      } else if (!PHONE_REGEX.test(form.phoneNumber.trim())) {
        errs.phoneNumber = t('validation.phoneNumberPattern');
      }
    } else {
      if (form.phoneNumber.trim() && !PHONE_REGEX.test(form.phoneNumber.trim())) {
        errs.phoneNumber = t('validation.phoneNumberPattern');
      }
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

      <Input label={t('profile.fullName')}    name="fullName"    value={form.fullName}    onChange={handleChange} error={errors.fullName}    disabled={loading} required />
      {!isEdit && (
        <Input label={t('profile.email')}      name="email"       type="email" value={form.email} onChange={handleChange} error={errors.email} disabled={loading} required />
      )}
      <Input
        label={isEdit ? t('auth.phoneNumberOptional') : t('payments.phoneNumber')}
        name="phoneNumber"
        placeholder="e.g. 0911234567 or +251911234567"
        value={form.phoneNumber}
        onChange={handleChange}
        error={errors.phoneNumber}
        disabled={loading}
        required={!isEdit}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {isEdit ? t('common.saveChanges') : t('admin.createAdmin')}
        </Button>
      </div>
    </form>
  );
}