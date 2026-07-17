import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function ChangePasswordPage() {
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

  // Redirect completely unauthenticated visitors to /login.
  // Wait until AuthContext has finished its silent refresh check (loading = false)
  // before deciding — otherwise we might redirect a user whose session is
  // still being restored from the HttpOnly cookie.
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  function validate() {
    const errs = {};
    if (!form.currentPassword)
      errs.currentPassword = 'Current password is required.';
    if (!form.newPassword)
      errs.newPassword = 'New password is required.';
    else if (form.newPassword.length < 8)
      errs.newPassword = 'New password must be at least 8 characters.';
    else if (form.newPassword === form.currentPassword)
      errs.newPassword = 'New password must be different from your current password.';
    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your new password.';
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
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
      setSuccess('Password changed successfully. Please log in again.');

      setTimeout(async () => {
        await logout();
        navigate('/login', { replace: true });
      }, 2000);

    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  // Show spinner while AuthContext is still checking the session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Change Password</h1>

          {user?.status === 'PendingPasswordChange' ? (
            <div className="mt-3 mx-auto max-w-sm">
              <Alert
                type="warning"
                message="You must set a new password before you can access the platform."
              />
            </div>
          ) : (
            <p className="text-slate-400 text-sm mt-2 font-medium">Update your account password</p>
          )}
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
          {apiError && <Alert type="error"   message={apiError} className="mb-5" />}
          {success   && <Alert type="success" message={success}  className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Current password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Your current password"
              value={form.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              disabled={submitting || !!success}
            />
            <Input
              label="New password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={form.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              disabled={submitting || !!success}
            />
            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={submitting || !!success}
            />
            <Button
              type="submit"
              fullWidth
              loading={submitting}
              disabled={!!success}
              size="lg"
              className="mt-2"
            >
              Change password
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}