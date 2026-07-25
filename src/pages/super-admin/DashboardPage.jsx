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
    <>
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
          <StatCard label="Total Admins"      value={stats.totalAdmins}           icon="👤" color="blue"   onClick={() => navigate('/super-admin/view/admins')} />
          <StatCard label="Total Landlords"   value={stats.totalLandlords}         icon="🏢" color="purple" onClick={() => navigate('/super-admin/view/landlords')} />
          <StatCard label="Total Tenants"     value={stats.totalTenants}           icon="👨‍👩‍👧" color="green" onClick={() => navigate('/super-admin/view/tenants')} />
          <StatCard label="Total Properties"  value={stats.totalProperties}        icon="🏗️" color="yellow" onClick={() => navigate('/super-admin/view/properties')} />
          <StatCard label="Total Units"       value={stats.totalUnits}             icon="🚪" color="slate"  onClick={() => navigate('/super-admin/view/units')} />
          <StatCard label="Total Leases"      value={stats.totalLeases}            icon="📄" color="green"  onClick={() => navigate('/super-admin/view/leases')} />
          <StatCard label="Suspended Landlords" value={stats.suspendedLandlords}  icon="🚫" color="red"    onClick={() => navigate('/super-admin/view/suspended-landlords')} />
        </div>
      )}
    </>
  );
}