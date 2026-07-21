import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, StatCard, StatCardsSkeleton, Alert } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';
import { TENANT_NAV } from './tenantNav';

export default function TenantDashboard() {
  const navigate = useNavigate();

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [leaseRes, payRes] = await Promise.all([
          leaseApi.getMyLeases(0, 100, 'ACTIVE'), 
          paymentApi.getMyPayments({ page: 0, size: 500 }), 
        ]);
        
        const leases = leaseRes.data?.data?.content || [];
        const activeLeases = leaseRes.data?.data?.totalElements || 0;
        const payments = payRes.data?.data?.content || [];
        
        let pendingPayments = 0;
        let rejectedPayments = 0;
        
        payments.forEach(p => {
            if (p.status === 'PENDING') pendingPayments++;
            if (p.status === 'REJECTED') rejectedPayments++;
        });

        const currentDate = new Date();
        const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const daysUntilDue = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() - currentDate.getDate();

        let unpaidLeases = 0;
        let dueSoonLeases = 0;

        leases.forEach(lease => {
            const leasePayments = payments.filter(p => p.leaseId === lease.id && ['APPROVED', 'PENDING'].includes(p.status));
            leasePayments.sort((a, b) => b.paymentMonth.localeCompare(a.paymentMonth));
            
            const latestPayment = leasePayments[0];
            
            if (!latestPayment) {
                const startDateStr = lease.startDate.substring(0, 7);
                if (currentYearMonth > startDateStr) {
                    unpaidLeases++;
                } else if (currentYearMonth === startDateStr && daysUntilDue <= 3) {
                    dueSoonLeases++;
                }
            } else {
                const lastPaidMonth = latestPayment.paymentMonth;
                if (currentYearMonth > lastPaidMonth) {
                    unpaidLeases++;
                } else if (currentYearMonth === lastPaidMonth && daysUntilDue <= 3) {
                    dueSoonLeases++;
                }
            }
        });

        setStats({
          activeLeases,
          pendingPayments,
          rejectedPayments,
          unpaidLeases,
          dueSoonLeases,
          daysUntilDue
        });
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

      {error && <Alert type="error" message={error} className="mb-4" />}

      {loading ? (
        <StatCardsSkeleton count={3} />
      ) : !stats && !error ? (
        <p className="text-slate-500 text-sm">Could not load statistics.</p>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Active Leases"    
            value={stats.activeLeases}  
            icon="🏠" 
            color="blue" 
            onClick={() => navigate('/tenant/lease')} 
          />
          <StatCard 
            label="Pending Payments" 
            value={stats.pendingPayments} 
            icon="⏳" 
            color="yellow" 
            onClick={() => navigate('/tenant/payments')} 
          />
          <StatCard 
            label="Rejected Payments" 
            value={stats.rejectedPayments} 
            icon="❌" 
            color="red" 
            onClick={() => navigate('/tenant/payments')} 
          />
          <StatCard 
            label="Unpaid Leases" 
            value={stats.unpaidLeases} 
            icon="⚠️" 
            color="orange" 
            onClick={() => navigate('/tenant/payments')} 
          />
          {stats.daysUntilDue <= 3 && (
            <StatCard 
              label={`Due in ${stats.daysUntilDue} Days`}
              value={stats.dueSoonLeases} 
              icon="⏰" 
              color="indigo" 
              onClick={() => navigate('/tenant/payments')} 
            />
          )}
        </div>
      ) : null}
    </PortalLayout>
  );
}