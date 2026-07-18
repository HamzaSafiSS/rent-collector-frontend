import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/common/PortalLayout';
import { StatCard, PageHeader, Spinner } from '../../components/common';
import { reportApi } from '../../api/reportApi';
import { propertyApi } from '../../api/propertyApi';
import { leaseApi } from '../../api/leaseApi';
import { LANDLORD_NAV } from './landlordNav';
import { StatCardsSkeleton } from '../../components/common';


export default function LandlordDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [propRes, occRes] = await Promise.all([
          propertyApi.listMyProperties(0, 1),
          reportApi.getOccupancyReport({}),
        ]);
        setStats({
          totalProperties:   propRes.data?.data?.totalElements ?? 0,
          occupiedUnits:     occRes.data?.data?.occupiedUnits  ?? 0,
          availableUnits:    occRes.data?.data?.availableUnits ?? 0,
          totalUnits:        occRes.data?.data?.totalUnits     ?? 0,
          occupancyRate:     occRes.data?.data?.occupancyRate  ?? 0,
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
      <PageHeader title="Landlord Dashboard"/>

      {loading ? (
        <StatCardsSkeleton count={6} />
      ) : !stats ? (
        <p className="text-slate-500 text-sm">Could not load statistics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="My Properties"    value={stats.totalProperties}  icon="🏗️" color="blue" onClick={() => navigate('/landlord/properties')} />
          <StatCard label="Total Units"      value={stats.totalUnits}       icon="🚪" color="slate" onClick={() => navigate('/landlord/units?status=ALL')} />
          <StatCard label="Occupied Units"   value={stats.occupiedUnits}    icon="👥" color="green" subtitle={`${stats.occupancyRate}% occupancy`} onClick={() => navigate('/landlord/units?status=OCCUPIED')} />
          <StatCard label="Available Units"  value={stats.availableUnits}   icon="✅" color="green" onClick={() => navigate('/landlord/units?status=AVAILABLE')} />
        </div>
      )}
    </PortalLayout>
  );
}