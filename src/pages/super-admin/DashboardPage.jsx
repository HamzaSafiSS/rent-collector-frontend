import { useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { StatCard, PageHeader, Spinner } from '../../components/common';
import { adminApi } from '../../api/adminApi';
import { reportApi } from '../../api/reportApi';
import { StatCardsSkeleton } from '../../components/common';

const NAV = [
  { label: 'Dashboard',    to: '/super-admin/dashboard',  icon: '📊' },
  { label: 'Manage Admins',to: '/super-admin/admins',     icon: '👥' },
  { label: 'Audit Logs',   to: '/super-admin/audit-logs', icon: '📋' },
];

export default function SuperAdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

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
    <PortalLayout navItems={NAV} portalLabel="Super Admin">
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Platform-wide overview"
      />

      {loading ? (
        <StatCardsSkeleton count={9} />
      ) : !stats ? (
        <p className="text-slate-500 text-sm">Could not load statistics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard label="Total Admins"      value={stats.totalAdmins}           icon="👤" color="blue"   />
          <StatCard label="Total Landlords"   value={stats.totalLandlords}         icon="🏢" color="purple" />
          <StatCard label="Total Tenants"     value={stats.totalTenants}           icon="👨‍👩‍👧" color="green" />
          <StatCard label="Total Properties"  value={stats.totalProperties}        icon="🏗️" color="yellow" />
          <StatCard label="Total Units"       value={stats.totalUnits}             icon="🚪" color="slate"  />
          <StatCard label="Active Leases"     value={stats.totalActiveLeases}      icon="📄" color="green"  />
          <StatCard label="Pending Payments"  value={stats.totalPendingPayments}   icon="⏳" color="yellow" />
          <StatCard label="Revenue Collected" value={`ETB ${(stats.totalRevenueCollected ?? 0).toLocaleString()}`} icon="💰" color="green" />
          <StatCard label="Suspended Landlords" value={stats.suspendedLandlords}  icon="🚫" color="red"    />
        </div>
      )}
    </PortalLayout>
  );
}