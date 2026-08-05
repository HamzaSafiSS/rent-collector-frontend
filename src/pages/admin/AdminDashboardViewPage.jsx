import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageHeader, Badge, Spinner, Alert } from '../../components/common';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';



export default function AdminDashboardViewPage() {
  const { t } = useTranslation();

  const { adminId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';


  const backUrl = location.state?.from || (isSuperAdmin ? '/super-admin/view/admins' : '/admin/dashboard');

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await adminApi.getAdmin(adminId);
        setAdminData(res.data?.data);
      } catch (err) {
        setError('Failed to load admin profile.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [adminId]);

  return (
    <>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(backUrl)}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        ← {t('common.backToAdmins', 'Back to Admins')}
      </button>

      {error && <Alert type="error" message={t('admin.failedToLoadProfile', error)} className="mb-4" />}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : adminData ? (
        <div className="space-y-6">
          <PageHeader
            title={t('dashboard.userDashboard', { name: adminData.fullName, defaultValue: `${adminData.fullName}'s Dashboard` })}
            subtitle={t('admin.adminId', { id: adminId, defaultValue: `Admin ID: ${adminId}` })}
          >
            <Badge statusKey={adminData.status} label={adminData.status ? t(`common.status${adminData.status.charAt(0) + adminData.status.slice(1).toLowerCase()}`, { defaultValue: adminData.status }) : ''} />
          </PageHeader>

          {/* Admin Info Card */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700/50 pb-2">{t('admin.profileInfo', 'Profile Information')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('admin.name')}</span>
                  <span className="text-slate-100 font-medium">{adminData.fullName}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('admin.email')}</span>
                  <span className="text-slate-100">{adminData.email}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('payments.phone')}</span>
                  <span className="text-slate-100">{adminData.phoneNumber || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('admin.status')}</span>
                  <Badge statusKey={adminData.status} label={adminData.status ? t(`common.status${adminData.status.charAt(0) + adminData.status.slice(1).toLowerCase()}`, { defaultValue: adminData.status }) : ''} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('admin.joined')}</span>
                  <span className="text-slate-100">{adminData.createdAt ? new Date(adminData.createdAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
