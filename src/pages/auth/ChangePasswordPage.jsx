import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LanguageToggle from '../../components/common/LanguageToggle';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function ChangePasswordPage() {
  const { t }                  = useTranslation();
  const navigate               = useNavigate();
  const { user, logout, isAuthenticated, loading } = useAuth();

  const [form, setForm]         = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  function validate() {
    const errs = {};
    if (!form.currentPassword)
      errs.currentPassword = 'validation.currentPasswordRequired';
    if (!form.newPassword)
      errs.newPassword = 'validation.newPasswordRequired';
    else if (form.newPassword.length < 8)
      errs.newPassword = 'validation.newPasswordMinLength';
    else if (form.newPassword === form.currentPassword)
      errs.newPassword = 'validation.newPasswordMustDiffer';
    if (!form.confirmPassword)
      errs.confirmPassword = 'validation.confirmNewPasswordRequired';
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = 'validation.passwordsDoNotMatch';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setSubmitting(true);
      await authApi.changePassword(form.currentPassword, form.newPassword);
      setSuccess('auth.passwordChangedSuccess');

      setTimeout(async () => {
        await logout();
        navigate('/login', { replace: true });
      }, 2000);

    } catch (err) {
      setApiError(err.response?.data?.message || 'auth.failedChangePassword');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 to-[#F8FAFB] dark:from-slate-950 dark:to-slate-950 flex items-center justify-center p-4">
      {/* Top right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 dark:bg-emerald-600/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-300/10 dark:bg-emerald-800/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-slide-in">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl mb-6 shadow-xl shadow-emerald-500/30 transform transition-transform hover:scale-105 duration-300">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A2B3C] dark:text-white tracking-tight">{t('auth.changePasswordTitle')}</h1>

          {user?.status === 'PendingPasswordChange' ? (
            <div className="mt-3 mx-auto max-w-sm">
              <Alert
                type="warning"
                message={t('auth.mustChangePassword')}
              />
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">{t('auth.updateAccountPassword')}</p>
          )}
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
          {apiError && <Alert type="error"   message={t(apiError)} className="mb-5" />}
          {success   && <Alert type="success" message={t(success)}  className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label={t('auth.currentPasswordLabel')}
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder={t('auth.currentPasswordPlaceholder')}
              value={form.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword ? t(errors.currentPassword) : ''}
              disabled={submitting || !!success}
              required
            />
            <Input
              label={t('auth.newPasswordLabel')}
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t('auth.newPasswordPlaceholder')}
              value={form.newPassword}
              onChange={handleChange}
              error={errors.newPassword ? t(errors.newPassword) : ''}
              disabled={submitting || !!success}
              required
            />
            <Input
              label={t('auth.confirmNewPasswordLabel')}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t('auth.confirmNewPasswordPlaceholder')}
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword ? t(errors.confirmPassword) : ''}
              disabled={submitting || !!success}
              required
            />
            <Button
              type="submit"
              fullWidth
              loading={submitting}
              disabled={!!success}
              size="lg"
              className="mt-2"
            >
              {t('auth.changePasswordBtn')}
            </Button>
          </form>

          {/* Escape hatch for trapped users (e.g. pending password change) */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login', { replace: true });
              }}
              className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              {t('auth.signOutAndReturn')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}