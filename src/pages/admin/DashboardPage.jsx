import { useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { StatCard, PageHeader, Spinner } from '../../components/common';
import { reportApi } from '../../api/reportApi';

const NAV = [
  { label: 'Dashboard',      to: '/admin/dashboard',  icon: '📊' },
  { label: 'Landlords',      to: '/admin/landlords',  icon: '🏢' },
  { label: 'Tenants',        to: '/admin/tenants',    icon: '👥' },
  { label: 'Audit Logs',     to: '/admin/audit-logs', icon: '📋' },
];

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.getAdminOverview()
      .then((r) => setStats(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout navItems={NAV} portalLabel="Admin">
      <PageHeader title="Admin Dashboard" subtitle="Platform overview" />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !stats ? (
        <p className="text-slate-500 text-sm">Could not load statistics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard label="Total Landlords"      value={stats.totalLandlords}          icon="🏢" color="blue"   />
          <StatCard label="Suspended Landlords"  value={stats.suspendedLandlords}       icon="🚫" color="red"    />
          <StatCard label="Total Tenants"        value={stats.totalTenants}             icon="👥" color="green"  />
          <StatCard label="Total Properties"     value={stats.totalProperties}          icon="🏗️" color="purple" />
          <StatCard label="Total Units"          value={stats.totalUnits}               icon="🚪" color="slate"  />
          <StatCard label="Pending Payments"     value={stats.totalPendingPayments}     icon="⏳" color="yellow" />
          <StatCard label="Approved Payments"    value={stats.totalApprovedPayments}    icon="✅" color="green"  />
          <StatCard label="Revenue Collected"    value={`ETB ${(stats.totalRevenueCollected ?? 0).toLocaleString()}`} icon="💰" color="green" />
          <StatCard label="Maintenance Units"    value={stats.maintenanceUnits}         icon="🔧" color="yellow" />
        </div>
      )}
    </PortalLayout>
  );
}