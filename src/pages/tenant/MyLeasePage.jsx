import { useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Badge, Spinner, Alert } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';
import { TENANT_NAV } from './tenantNav';

export default function MyLeasePage() {
  const [leases, setLeases]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    leaseApi.getMyLeases(0, 50)          // ← tenant-scoped endpoint
      .then((r) => setLeases(r.data?.data?.content || []))
      .catch((err) => setError(
        err.response?.data?.message || 'Failed to load leases.'
      ))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout navItems={TENANT_NAV} portalLabel="Tenant">
      <PageHeader title="My Leases" subtitle="All your lease agreements" />

      {error   && <Alert type="error" message={error} />}
      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {!loading && !error && leases.length === 0 && (
        <div className="text-center py-20">
          <p className="text-3xl mb-3">📄</p>
          <p className="text-slate-500">No leases found.</p>
        </div>
      )}

      <div className="space-y-4">
        {leases.map((lease) => (
          <div key={lease.id} className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">{lease.propertyName}</h3>
                <p className="text-slate-500 text-sm mt-0.5">Unit: {lease.unitNumber}</p>
              </div>
              <Badge label={lease.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Monthly Rent</p>
                <p className="font-semibold">ETB {Number(lease.monthlyRent).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Start Date</p>
                <p className="font-semibold">{lease.startDate}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Lease ID</p>
                <p className="font-semibold">#{lease.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}