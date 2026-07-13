import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to send the user after login — respect the page they tried to visit
  const from = location.state?.from?.pathname || null;

  function validate() {
    const errs = {};
    if (!form.email.trim())    errs.email    = 'Email is required.';
    if (!form.password.trim()) errs.password = 'Password is required.';
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
      const message = err.response?.data?.message || 'Login failed. Please try again.';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Rent Collector</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {apiError && (
            <Alert type="error" message={apiError} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              disabled={loading}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              Sign in
            </Button>
          </form>

          {/* Signup link — only for new landlords */}
          <p className="text-center text-sm text-slate-500 mt-6">
            New landlord?{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create an account
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
    case 'ADMIN':       navigate('/admin/dashboard',       { replace: true }); break;
    case 'LANDLORD':    navigate('/landlord/dashboard',    { replace: true }); break;
    case 'TENANT':      navigate('/tenant/dashboard',      { replace: true }); break;
    default:            navigate('/login',                 { replace: true });
  }
}