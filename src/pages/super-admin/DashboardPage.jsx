import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, PageHeader, Spinner } from '../../components/common';
import { adminApi } from '../../api/adminApi';
import { reportApi } from '../../api/reportApi';
import { StatCardsSkeleton } from '../../components/common';


export default function SuperAdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [overviewRes, adminsRes] = await Promise.all([
          reportApi.getAdminOverview(),
          adminApi.listAdmins(0, 1),
        ]);
        setStats({
          ...overviewRes.data?.data,
          totalAdmins: adminsRes.data?.data?.totalElements ?? 0,
        });
      } catch {
        // stats stay null — handled in render
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="text-[75%]">
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Platform-wide overview"
      />

      {loading ? (
        <StatCardsSkeleton count={7} />
      ) : !stats ? (
        <p className="text-slate-500 text-sm">Could not load statistics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard label="Total Admins"      value={stats.totalAdmins}           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} color="blue"   onClick={() => navigate('/super-admin/view/admins')} />
          <StatCard label="Total Landlords"   value={stats.totalLandlords}         icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg>} color="purple" onClick={() => navigate('/super-admin/view/landlords')} />
          <StatCard label="Total Tenants"     value={stats.totalTenants}           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} color="green" onClick={() => navigate('/super-admin/view/tenants')} />
          <StatCard label="Total Properties" value={stats.totalProperties} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg>} color="purple" onClick={() => navigate('/super-admin/view/properties')} />
          <StatCard label="Total Units"       value={stats.totalUnits}             icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} color="slate"  onClick={() => navigate('/super-admin/view/units')} />
          <StatCard label="Total Leases"      value={stats.totalLeases}            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} color="green"  onClick={() => navigate('/super-admin/view/leases')} />
          <StatCard label="Suspended Landlords" value={stats.suspendedLandlords}  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} color="red"    onClick={() => navigate('/super-admin/view/suspended-landlords')} />
        </div>
      )}
    </div>
  );
}