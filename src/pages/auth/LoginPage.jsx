import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LanguageToggle from '../../components/common/LanguageToggle';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.status === 'PendingPasswordChange') {
        navigate('/change-password', { replace: true });
      } else if (user?.role) {
        navigateByRole(user.role, navigate);
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to send the user after login — respect the page they tried to visit
  const from = location.state?.from?.pathname || null;

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = t('validation.emailRequired');
    if (!form.password.trim()) errs.password = t('validation.passwordRequired');
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      const result = await login(form.email.trim(), form.password);

      // Tenant with PendingPasswordChange must change password first
      if (result.mustChangePassword) {
        navigate('/change-password');
        return;
      }

      // Redirect to the page they tried to visit, or their role dashboard
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        navigateByRole(result.role, navigate);
      }
    } catch (err) {
      const message = err.response?.data?.message || t('auth.loginFailed');
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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

      <div className="w-full max-w-sm relative z-10 animate-slide-in">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <svg className="w-16 h-16 mx-auto mb-4 transform transition-transform hover:scale-105 duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21V7L10 3V21" fill="#10b981" />
            <path d="M10 21V9L21 9V21" stroke="currentColor" className="text-[#1A2B3C] dark:text-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 21V15H17V21" stroke="currentColor" className="text-[#1A2B3C] dark:text-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-3xl font-extrabold text-[#1A2B3C] dark:text-white tracking-tight">{t('common.appName')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">{t('auth.welcomeBack')}</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-6 text-slate-700 dark:text-slate-200">
          {apiError && (
            <Alert type="error" message={apiError} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label={t('auth.emailLabel')}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              disabled={loading}
              required
            />

            <Input
              label={t('auth.passwordLabel')}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={t('auth.passwordPlaceholder')}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              {t('auth.signIn')}
            </Button>
          </form>

          {/* Signup link — only for new landlords */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            {t('auth.newLandlord')}{' '}
            <Link
              to="/signup"
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
            >
              {t('auth.createAccount')}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Role-based post-login redirect ─────────────────────────────────────────────
function navigateByRole(role, navigate) {
  switch (role) {
    case 'SUPER_ADMIN': navigate('/super-admin/dashboard', { replace: true }); break;
    case 'ADMIN': navigate('/admin/dashboard', { replace: true }); break;
    case 'LANDLORD': navigate('/landlord/dashboard', { replace: true }); break;
    case 'TENANT': navigate('/tenant/dashboard', { replace: true }); break;
    default: navigate('/login', { replace: true });
  }
}