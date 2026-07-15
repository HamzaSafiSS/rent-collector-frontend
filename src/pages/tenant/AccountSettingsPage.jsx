import { useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Input, Button, Alert } from '../../components/common';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { TENANT_NAV } from './tenantNav';

export default function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const toast            = useToast();

  const [form, setForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  function validate() {
    const errs = {};
    if (!form.currentPassword)     errs.currentPassword = 'Current password is required.';
    if (!form.newPassword)         errs.newPassword     = 'New password is required.';
    else if (form.newPassword.length < 8) errs.newPassword = 'Minimum 8 characters.';
    else if (form.newPassword === form.currentPassword) errs.newPassword = 'Must be different from current.';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
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
      setSuccess('Password changed successfully. Please log in again.');
      toast.success('Password changed.');
      setTimeout(async () => {
        await logout();
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to change password.');
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
    <PortalLayout navItems={TENANT_NAV} portalLabel="Tenant">
      <PageHeader title="Account Settings" subtitle="Manage your account" />

      <div className="max-w-lg space-y-6">

        {/* Profile info card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-4"><p className="text-slate-400 w-32">Full name</p><p className="font-medium text-slate-800">{user?.fullName}</p></div>
            <div className="flex gap-4"><p className="text-slate-400 w-32">Email</p>    <p className="font-medium text-slate-800">{user?.email}</p></div>
            <div className="flex gap-4"><p className="text-slate-400 w-32">Status</p>   <p className="font-medium text-slate-800">{user?.status}</p></div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Change Password</h2>

          {apiError && <Alert type="error"   message={apiError} className="mb-4" />}
          {success  && <Alert type="success" message={success}  className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input label="Current password"  name="currentPassword"  type="password" value={form.currentPassword}  onChange={handleChange} error={errors.currentPassword}  disabled={loading || !!success} />
            <Input label="New password"      name="newPassword"      type="password" value={form.newPassword}      onChange={handleChange} error={errors.newPassword}      disabled={loading || !!success} />
            <Input label="Confirm password"  name="confirmPassword"  type="password" value={form.confirmPassword}  onChange={handleChange} error={errors.confirmPassword}  disabled={loading || !!success} />
            <Button type="submit" loading={loading} disabled={!!success}>Change password</Button>
          </form>
        </div>

      </div>
    </PortalLayout>
  );
}