import { useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { StatCard, PageHeader, Spinner } from '../../components/common';
import { reportApi } from '../../api/reportApi';
import { propertyApi } from '../../api/propertyApi';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';
import { LANDLORD_NAV } from './landlordNav';


export default function LandlordDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [propRes, occRes, payRes, pendRes] = await Promise.all([
          propertyApi.listMyProperties(0, 1),
          reportApi.getOccupancyReport({}),
          reportApi.getPaymentReport({}),
          paymentApi.getPendingPayments(0, 1),
        ]);
        setStats({
          totalProperties:   propRes.data?.data?.totalElements ?? 0,
          occupiedUnits:     occRes.data?.data?.occupiedUnits  ?? 0,
          availableUnits:    occRes.data?.data?.availableUnits ?? 0,
          totalUnits:        occRes.data?.data?.totalUnits     ?? 0,
          occupancyRate:     occRes.data?.data?.occupancyRate  ?? 0,
          totalCollected:    payRes.data?.data?.totalCollected ?? 0,
          pendingPayments:   pendRes.data?.data?.totalElements ?? 0,
        });
      } catch {
        // stats remain null
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PortalLayout navItems={LANDLORD_NAV} portalLabel="Landlord">
      <PageHeader title="Landlord Dashboard" subtitle="Your portfolio at a glance" />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !stats ? (
        <p className="text-slate-500 text-sm">Could not load statistics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard label="My Properties"    value={stats.totalProperties}  icon="🏗️" color="blue"   />
          <StatCard label="Total Units"      value={stats.totalUnits}       icon="🚪" color="slate"  />
          <StatCard label="Occupied Units"   value={stats.occupiedUnits}    icon="👥" color="green"  subtitle={`${stats.occupancyRate}% occupancy`} />
          <StatCard label="Available Units"  value={stats.availableUnits}   icon="✅" color="green"  />
          <StatCard label="Revenue Collected" value={`ETB ${Number(stats.totalCollected).toLocaleString()}`} icon="💰" color="green" />
          <StatCard label="Pending Payments" value={stats.pendingPayments}  icon="⏳" color="yellow" />
        </div>
      )}
    </PortalLayout>
  );
}