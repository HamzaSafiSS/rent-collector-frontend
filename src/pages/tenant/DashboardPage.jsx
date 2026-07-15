import { useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Badge, Spinner, Alert, Button } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';
import { useNavigate } from 'react-router-dom';
import { TENANT_NAV } from './tenantNav';

export default function TenantDashboard() {
  const navigate = useNavigate();

  const [leases, setLeases]           = useState([]);
  const [lastPayment, setLastPayment] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [leaseRes, payRes] = await Promise.all([
          leaseApi.getMyLeases(0, 10, 'ACTIVE'),   // ← tenant-scoped endpoint
          paymentApi.getMyPayments(0, 1),
        ]);
        setLeases(leaseRes.data?.data?.content || []);
        setLastPayment(payRes.data?.data?.content?.[0] || null);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PortalLayout navItems={TENANT_NAV} portalLabel="Tenant">
      <PageHeader title="My Dashboard" subtitle="Your rental summary" />

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {!loading && !error && (
        <div className="space-y-6">

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Active Leases</h2>
            {leases.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                <p className="text-3xl mb-2">🏠</p>
                <p className="text-slate-500 text-sm">You have no active leases.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leases.map((lease) => (
                  <div key={lease.id} className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-slate-800">{lease.propertyName}</p>
                        <p className="text-sm text-slate-500 mt-0.5">Unit: {lease.unitNumber}</p>
                      </div>
                      <Badge label={lease.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                      <div>
                        <p className="text-slate-400 text-xs">Monthly Rent</p>
                        <p className="font-semibold text-slate-800">
                          ETB {Number(lease.monthlyRent).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Start Date</p>
                        <p className="font-semibold text-slate-800">{lease.startDate}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => navigate('/tenant/upload-payment')}
                    >
                      Upload Payment
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {lastPayment && (
            <section>
              <h2 className="text-base font-semibold text-slate-700 mb-3">Last Payment</h2>
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{lastPayment.paymentMonth}</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">
                    ETB {Number(lastPayment.amount).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge label={lastPayment.status} />
                  {lastPayment.status === 'REJECTED' && lastPayment.landLoardComment && (
                    <p className="text-xs text-red-500 mt-2 max-w-xs text-right">
                      {lastPayment.landLoardComment}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

        </div>
      )}
    </PortalLayout>
  );
}