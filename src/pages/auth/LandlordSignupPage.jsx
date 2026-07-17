import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function LandlordSignupPage() {
  const navigate  = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    fullName:    '',
    email:       '',
    password:    '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  function validate() {
    const errs = {};

    if (!form.fullName.trim())
      errs.fullName = 'Full name is required.';

    if (!form.email.trim())
      errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Must be a valid email address.';

    if (!form.password)
      errs.password = 'Password is required.';
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters.';

    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';

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
      await signup(
        form.fullName.trim(),
        form.email.trim(),
        form.password,
        form.phoneNumber.trim() || undefined,
      );
      navigate('/landlord/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl mb-6 shadow-xl shadow-blue-500/30 transform transition-transform hover:scale-105 duration-300">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Register as a landlord</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
          {apiError && (
            <Alert type="error" message={apiError} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Hamza Safi"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              disabled={loading}
            />

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
              label="Phone number"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="0912345678 (optional)"
              value={form.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              disabled={loading}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              disabled={loading}
            />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              className="mt-2"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}