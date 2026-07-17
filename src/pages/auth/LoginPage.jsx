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
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-slide-in">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl mb-6 shadow-xl shadow-blue-500/30 transform transition-transform hover:scale-105 duration-300">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Rent Collector</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Welcome back. Please sign in.</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
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
          <p className="text-center text-sm text-slate-400 mt-8">
            New landlord?{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
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