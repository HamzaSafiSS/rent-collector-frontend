import { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import Alert from './Alert';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  function validate() {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required.';
    if (!form.newPassword) errs.newPassword = 'New password is required.';
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
        onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} title="My Profile">
      <div className="space-y-6 text-sm">
        
        {/* Profile Details */}
        <div className="space-y-3">
          <div className="flex gap-4"><p className="text-slate-500 w-24">Full name</p><p className="font-medium text-slate-800">{user?.fullName}</p></div>
          <div className="flex gap-4"><p className="text-slate-500 w-24">Email</p>    <p className="font-medium text-slate-800">{user?.email}</p></div>
          <div className="flex gap-4"><p className="text-slate-500 w-24">Role</p>     <p className="font-medium text-slate-800 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p></div>
          <div className="flex gap-4"><p className="text-slate-500 w-24">Status</p>   <p className="font-medium text-slate-800">{user?.status}</p></div>
        </div>

        {/* Change Password Toggle */}
        <div className="pt-4 border-t border-slate-100">
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
              Change Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Change Password</h3>
                <button type="button" onClick={() => { setShowPasswordForm(false); setApiError(''); setSuccess(''); }} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>

              {apiError && <Alert type="error" message={apiError} />}
              {success && <Alert type="success" message={success} />}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input label="Current password" name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} error={errors.currentPassword} disabled={loading || !!success} />
                <Input label="New password" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} error={errors.newPassword} disabled={loading || !!success} />
                <Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} disabled={loading || !!success} />
                <Button type="submit" loading={loading} disabled={!!success} className="w-full">Update Password</Button>
              </form>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}
