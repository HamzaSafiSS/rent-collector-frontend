import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LanguageToggle from '../../components/common/LanguageToggle';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function LandlordSignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};

    if (!form.fullName.trim()) {
      errs.fullName = 'validation.fullNameRequired';
    } else if (/\d/.test(form.fullName)) {
      errs.fullName = 'validation.fullNameNoNumbers';
    } else if (!form.fullName.trim().includes(' ')) {
      errs.fullName = 'validation.fullNameSpaceRequired';
    }

    if (!form.email.trim()) {
      errs.email = 'validation.emailRequired';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'validation.validEmail';
    }

    if (!form.phoneNumber.trim()) {
      errs.phoneNumber = 'validation.phoneNumberRequired';
    } else if (form.phoneNumber.trim().length < 10) {
      errs.phoneNumber = 'validation.phoneNumberInvalid';
    }

    if (!form.password) {
      errs.password = 'validation.passwordRequired';
    } else if (form.password.length < 8) {
      errs.password = 'validation.passwordMinLength';
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = 'validation.confirmPasswordRequired';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'validation.passwordsDoNotMatch';
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      return;
    }

    try {
      setLoading(true);
      await signup(
        form.fullName.trim(),
        form.email.trim(),
        form.password,
        form.phoneNumber.trim(),
      );
      navigate('/landlord/dashboard', { replace: true });
    } catch (err) {
      const messageKey = err.response?.data?.message || 'auth.signupFailed';
      setApiError(messageKey);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "phoneNumber") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "fullName") {
      nextValue = value.replace(/[0-9]/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

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

      <div className="w-full max-w-sm relative z-10 animate-slide-in">

        {/* Brand */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl mb-4 shadow-xl shadow-emerald-500/30 transform transition-transform hover:scale-105 duration-300">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A2B3C] dark:text-white tracking-tight">{t('auth.createAccountTitle')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">{t('auth.registerAsLandlord')}</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-6 text-slate-700 dark:text-slate-200">
          {apiError && (
            <Alert type="error" message={t(apiError)} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <Input
              label={t('auth.fullNameLabel')}
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder={t('auth.fullNamePlaceholder')}
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName ? t(errors.fullName) : ''}
              disabled={loading}
              required
            />

            <Input
              label={t('auth.emailLabel')}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              value={form.email}
              onChange={handleChange}
              error={errors.email ? t(errors.email) : ''}
              disabled={loading}
              required
            />

            <Input
              label={t('auth.phoneLabel')}
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={form.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber ? t(errors.phoneNumber) : ''}
              disabled={loading}
              inputMode="numeric"
              maxLength={10}
              required
            />

            <Input
              label={t('auth.passwordLabel')}
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={t('auth.passwordPlaceholderSignup')}
              value={form.password}
              onChange={handleChange}
              error={errors.password ? t(errors.password) : ''}
              disabled={loading}
              required
            />

            <Input
              label={t('auth.confirmPasswordLabel')}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword ? t(errors.confirmPassword) : ''}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              {t('auth.createAccountBtn')}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
            >
              {t('auth.signIn')}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}