import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Badge, Spinner, Alert } from '../../components/common';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';



export default function AdminDashboardViewPage() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const navItems = isSuperAdmin ? SUPER_ADMIN_NAV : ADMIN_NAV;
  const portalLabel = isSuperAdmin ? 'Super Admin' : 'Admin';
  const backUrl = isSuperAdmin ? '/super-admin/view/admins' : '/admin/dashboard';

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
        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Admins
      </button>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : adminData ? (
        <div className="space-y-6">
          <PageHeader
            title={`${adminData.fullName}'s Dashboard`}
            subtitle={`Admin ID: ${adminId}`}
          >
            <Badge label={adminData.status} />
          </PageHeader>

          {/* Admin Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Profile Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</span>
                  <span className="text-slate-800 font-medium">{adminData.fullName}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</span>
                  <span className="text-slate-800">{adminData.email}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</span>
                  <span className="text-slate-800">{adminData.phoneNumber || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Status</span>
                  <Badge label={adminData.status} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Join Date</span>
                  <span className="text-slate-800">{adminData.createdAt ? new Date(adminData.createdAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
