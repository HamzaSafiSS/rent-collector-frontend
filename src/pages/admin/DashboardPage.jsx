import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
          <StatCard label="Total Landlords"      value={stats.totalLandlords}           icon="🏢" color="blue"   onClick={() => navigate('/admin/view/landlords')} />
          <StatCard label="Suspended Landlords"  value={stats.suspendedLandlords}       icon="🚫" color="red"    onClick={() => navigate('/admin/view/suspended-landlords')} />
          <StatCard label="Total Tenants"        value={stats.totalTenants}             icon="👥" color="green"  onClick={() => navigate('/admin/view/tenants')} />
          <StatCard label="Total Properties"     value={stats.totalProperties}          icon="🏗️" color="purple" onClick={() => navigate('/admin/view/properties')} />
          <StatCard label="Total Units"          value={stats.totalUnits}               icon="🚪" color="slate"  onClick={() => navigate('/admin/view/units')} />
        </div>
      )}
    </PortalLayout>
  );
}