import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import Alert from './Alert';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setShowPasswordForm(false);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setApiError('');
      setSuccess('');
      setErrors({});
    }
  }, [isOpen]);

  function validate() {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = t('validation.currentPasswordRequired');
    if (!form.newPassword) errs.newPassword = t('validation.newPasswordRequired');
    else if (form.newPassword.length < 8) errs.newPassword = t('validation.minimum8Chars');
    else if (form.newPassword === form.currentPassword) errs.newPassword = t('validation.mustBeDifferentFromCurrent');
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = t('validation.passwordsDoNotMatch');
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(''); setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setLoading(true);
      await authApi.changePassword(form.currentPassword, form.newPassword);
      setSuccess(t('auth.passwordChangedSuccess'));
      toast.success(t('profile.passwordChanged'));
      setTimeout(async () => {
        await logout();
        onClose();
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || t('auth.failedChangePassword'));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.title')}>
      <div className="space-y-6 text-sm">
        
        {/* Profile Details */}
        {!showPasswordForm && (
          <div className="space-y-3">
            <div className="flex gap-4"><p className="text-slate-500 w-24">{t('profile.fullName')}</p><p className="font-medium text-slate-200">{user?.fullName}</p></div>
            <div className="flex gap-4"><p className="text-slate-500 w-24">{t('profile.email')}</p>    <p className="font-medium text-slate-200">{user?.email}</p></div>
            <div className="flex gap-4"><p className="text-slate-500 w-24">{t('profile.role')}</p>     <p className="font-medium text-slate-200 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p></div>
            <div className="flex gap-4"><p className="text-slate-500 w-24">{t('profile.status')}</p>   <p className="font-medium text-slate-200">{user?.status}</p></div>
          </div>
        )}

        {/* Change Password Toggle */}
        <div className={!showPasswordForm ? "pt-4 border-t border-slate-700/50" : ""}>
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
              {t('profile.changePassword')}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-200">{t('profile.changePassword')}</h3>
              </div>

              {apiError && <Alert type="error" message={apiError} />}
              {success && <Alert type="success" message={success} />}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input label={t('auth.currentPasswordLabel')} name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} error={errors.currentPassword} disabled={loading || !!success} required />
                <Input label={t('auth.newPasswordLabel')} name="newPassword" type="password" value={form.newPassword} onChange={handleChange} error={errors.newPassword} disabled={loading || !!success} required />
                <Input label={t('auth.confirmPasswordLabel')} name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} disabled={loading || !!success} required />
                <Button type="submit" loading={loading} disabled={!!success} className="w-full">{t('profile.updatePassword')}</Button>
              </form>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}
